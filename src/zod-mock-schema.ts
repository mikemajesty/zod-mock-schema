import { Faker, en } from '@faker-js/faker';
import RandExp from 'randexp';
import z from 'zod';
import { MockManyOptions, MockOptions, ZodCheck, ZodCheckMinLength, ZodCheckMaxLength, ZodCheckMinSize, ZodCheckMaxSize, ZodCheckRegex, ZodCheckRegexDef, ZodCheckMinLengthDef, ZodCheckMaxLengthDef, ZodCheckMinSizeDef, ZodCheckMaxSizeDef, MockValue, ZodStringWithPublicProps, ZodNumberWithPublicProps } from './types';
import { Constants } from './constants';

export class ZodMockSchema<T> {
  public faker: Faker;

  constructor(readonly schema: z.ZodSchema<T>) {
    this.faker = new Faker({ locale: en });
  }

  seed(seed: number | number[]): this {
    this.faker.seed(Array.isArray(seed) ? seed : [seed]);
    return this;
  }

  generate<D extends T>(overrides?: MockOptions<T>): D {
    const originalFaker = this.faker;
    
    try {
      if (overrides?.faker) {
        this.faker = overrides.faker;
      }
      
      const mockData = this.generateFromSchema(this.schema);
      
      if (mockData instanceof Promise) {
        return mockData as D;
      }
      
      if (overrides?.overrides && this.isPlainObject(mockData)) {
        const merged = { ...(mockData as object), ...overrides.overrides };
        return this.schema.parse(merged) as D;
      }
      
      return this.schema.parse(mockData) as D;
    } finally {
      this.faker = originalFaker;
    }
  }

  generateMany<D extends T>(
    count: number,
    options: MockManyOptions<T> = {}
  ): D[] {
    return Array.from({ length: count }, () => this.generate(options));
  }

  private generateFromSchema(schema: z.core.$ZodType): MockValue {
    if (this.hasMetadata(schema)) {
      const meta = (schema as { meta: () => Record<string, unknown> }).meta();
      const brazilianFormats: Record<string, 'cpf' | 'cnpj' | 'rg' | 'phoneBR' | 'cep'> = {
        [Constants.FORMAT_CPF]: 'cpf',
        [Constants.FORMAT_CNPJ]: 'cnpj',
        [Constants.FORMAT_RG]: 'rg',
        [Constants.FORMAT_PHONE_BR]: 'phoneBR',
        [Constants.FORMAT_CEP]: 'cep'
      };
      
      const format = meta?.format as string;
      if (format && brazilianFormats[format]) {
        return this.getBrazilianMockValue(brazilianFormats[format]);
      }
    }

    if (schema instanceof z.ZodUnion) {
      const options = schema.def.options as z.core.$ZodType[];
      const selectedOption = this.faker.helpers.arrayElement(options);
      return this.generateFromSchema(selectedOption);
    }

    if (schema instanceof z.ZodIntersection) {
      const leftSchema = this.generateFromSchema(schema.def.left) as Record<string, unknown>;
      const rightSchema = this.generateFromSchema(schema.def.right) as Record<string, unknown>;
      return { ...leftSchema, ...rightSchema };
    }

    if (schema instanceof z.ZodEmail) return this.faker.internet.email();
    if (schema instanceof z.ZodURL) return this.faker.internet.url();
    if (schema instanceof z.ZodUUID) return this.faker.string.uuid();
    if (schema instanceof z.ZodString) {
      return this.generateStringValue(schema);
    };
    if (schema instanceof z.ZodNumber) {
      return this.generateNumberValue(schema);
    }
    if (schema instanceof z.ZodBoolean) return this.faker.datatype.boolean();
    if (schema instanceof z.ZodDate) {
      const constraints = (schema.def.checks as ZodCheck[]) || [];
      const minConstraint = constraints.find((c) => c._zod.def.check === 'greater_than');
      const maxConstraint = constraints.find((c) => c._zod.def.check === 'less_than');
      const minDateBound = minConstraint ? new Date((minConstraint._zod.def as z.core.$ZodCheckGreaterThanDef).value as Date) : undefined;
      const maxDateBound = maxConstraint ? new Date((maxConstraint._zod.def as z.core.$ZodCheckLessThanDef).value as Date) : undefined;
      
      if (minDateBound && maxDateBound) {
        return this.faker.date.between({ from: minDateBound, to: maxDateBound });
      }
      
      if (minDateBound) {
        return this.faker.date.future({ refDate: minDateBound });
      }
      
      if (maxDateBound) {
        return this.faker.date.past({ refDate: maxDateBound });
      }
      
      return this.faker.date.recent();
    }

    if (schema instanceof z.ZodArray) {
      const checks = (schema.def.checks as ZodCheck[]) || [];
      const minCheck = checks.find((c) => c._zod.def.check === 'min_length') as ZodCheckMinLength | undefined;
      const maxCheck = checks.find((c) => c._zod.def.check === 'max_length') as ZodCheckMaxLength | undefined;
      const minLength = (minCheck?._zod.def as ZodCheckMinLengthDef)?.minimum ?? Constants.DEFAULT_ARRAY_MIN_LENGTH;
      const maxLength = (maxCheck?._zod.def as ZodCheckMaxLengthDef)?.maximum ?? Constants.DEFAULT_ARRAY_MAX_LENGTH;
      const arrayLength = this.faker.number.int({ min: Math.min(minLength, maxLength), max: Math.max(minLength, maxLength) });

      return Array.from({ length: arrayLength }, () => this.generateFromSchema(schema.element));
    }

    if (schema instanceof z.ZodObject) {
      const objectData: Record<string, MockValue> = {};
      const schemaShape = schema.shape;

      for (const [propertyKey, propertySchema] of Object.entries(schemaShape)) {
        objectData[propertyKey] = this.generateFromSchema(propertySchema as z.core.$ZodType);
      }
      return objectData;
    }

    if (schema instanceof z.ZodEnum) {
      return this.faker.helpers.arrayElement(schema.options);
    }

    if (schema instanceof z.ZodRecord) {
      const recordKeySchema = schema.keyType;
      const recordValueSchema = schema.valueType;

      if (recordKeySchema instanceof z.ZodEnum) {
        const enumOptions = recordKeySchema.options as string[];
        const selectedKeys = this.faker.helpers.arrayElements(enumOptions, enumOptions.length);

        return selectedKeys.reduce((recordData, propertyKey) => ({
          ...recordData,
          [propertyKey]: this.generateFromSchema(recordValueSchema)
        }), {} as Record<string, MockValue>);
      }

      const propertiesCount = this.faker.number.int({ min: Constants.DEFAULT_RECORD_MIN_PROPERTIES, max: Constants.DEFAULT_RECORD_MAX_PROPERTIES });

      return Array.from({ length: propertiesCount })
        .reduce((recordData, _, propertyIndex) => {
          const propertyKey = recordKeySchema instanceof z.ZodString
            ? this.generateStringValue(recordKeySchema)
            : recordKeySchema instanceof z.ZodNumber
              ? this.generateNumberValue(recordKeySchema).toString()
              : `key${propertyIndex}`;

          return {
            ...recordData as object,
            [propertyKey]: this.generateFromSchema(recordValueSchema)
          };
        }, {} as Record<string, MockValue>);
    }

    if (schema instanceof z.ZodOptional) return this.generateFromSchema(schema.unwrap());
    if (schema instanceof z.ZodNullable) return this.generateFromSchema(schema.unwrap());

    if (schema instanceof z.ZodDefault) {
      const defaultValueOrFunction = (schema.def as { defaultValue?: unknown }).defaultValue;
      return typeof defaultValueOrFunction === 'function' ? defaultValueOrFunction() : defaultValueOrFunction;
    }

    if (schema instanceof z.ZodLazy) return this.generateFromSchema(schema.def.getter());

    if (schema instanceof z.ZodAny || schema instanceof z.ZodUnknown) return this.generateUnknownTypeValue();
    if (schema instanceof z.ZodVoid) return undefined;
    if (schema instanceof z.ZodNull) return null;
    if (schema instanceof z.ZodLiteral) return schema.value;


    if (schema instanceof z.ZodPipe) {
      return this.generateFromSchema(schema.def.in);
    }

    if (schema instanceof z.ZodSet) {
      const checks = (schema.def.checks as ZodCheck[]) || [];
      const minConstraint = checks.find((c) => c._zod.def.check === 'min_size') as ZodCheckMinSize | undefined;
      const maxConstraint = checks.find((c) => c._zod.def.check === 'max_size') as ZodCheckMaxSize | undefined;
      const minSetSize = (minConstraint?._zod.def as ZodCheckMinSizeDef)?.minimum ?? Constants.DEFAULT_SET_MIN_SIZE;
      const maxSetSize = (maxConstraint?._zod.def as ZodCheckMaxSizeDef)?.maximum ?? Constants.DEFAULT_SET_MAX_SIZE;
      
      const targetSize = this.faker.number.int({ 
        min: Math.min(minSetSize, maxSetSize), 
        max: Math.max(minSetSize, maxSetSize) 
      });
      
      const items = new Set<MockValue>();
      let attempts = 0;
      const maxAttempts = targetSize * 10;
      
      const setWithDef = schema as unknown as { def: { valueType: z.core.$ZodType; checks: ZodCheck[] } };
      
      while (items.size < targetSize && attempts < maxAttempts) {
        items.add(this.generateFromSchema(setWithDef.def.valueType));
        attempts++;
      }
      
      return items;
    }

    if (schema instanceof z.ZodMap) {
      const mapSize = Constants.DEFAULT_MAP_SIZE;
      const mapData = new Map<MockValue, MockValue>();
      const mapWithDef = schema as unknown as { def: { keyType: z.core.$ZodType; valueType: z.core.$ZodType } };
      
      for (let i = 0; i < mapSize; i++) {
        const key = this.generateFromSchema(mapWithDef.def.keyType);
        const value = this.generateFromSchema(mapWithDef.def.valueType);
        mapData.set(key, value);
      }
      
      return mapData;
    }

    if (schema instanceof z.ZodTuple) {
      const tupleWithDef = schema as unknown as { def: { items: z.core.$ZodType[]; rest: z.core.$ZodType | null } };
      const fixedTupleItems = tupleWithDef.def.items?.map((itemSchema: z.core.$ZodType) => 
        this.generateFromSchema(itemSchema)
      ) ?? [];
      
      const restTupleItems = tupleWithDef.def.rest ? Array.from(
        { length: this.faker.number.int({ min: Constants.DEFAULT_TUPLE_REST_MIN, max: Constants.DEFAULT_TUPLE_REST_MAX }) },
        () => this.generateFromSchema(tupleWithDef.def.rest!)
      ) : [];
      
      return [...fixedTupleItems, ...restTupleItems];
    }

    if (schema instanceof z.ZodFunction) {
      const functionWithDef = schema as unknown as { def: { output: z.core.$ZodType } };
      return (() => {
        return this.generateFromSchema(functionWithDef.def.output);
      }) as MockValue;
    }

    if (schema instanceof z.ZodPromise) {
      const promiseWithDef = schema as unknown as { def: { type: z.core.$ZodType } };
      return Promise.resolve(this.generateFromSchema(promiseWithDef.def.type));
    }

    if (this.isBrandedType(schema)) {
      return this.generateFromSchema(schema.unwrap());
    }

    if (schema instanceof z.ZodReadonly) {
      return this.generateFromSchema(schema.def.innerType);
    }

    if (schema instanceof z.ZodDiscriminatedUnion) {
      const unionOptions = Array.from(schema.def.options.values());
      const selectedOption = this.faker.helpers.arrayElement(unionOptions);
      return this.generateFromSchema(selectedOption);
    }

    if (this.isEffectsType(schema)) {
      const inputValue = this.generateFromSchema(schema.def.schema);
      
      if (schema.def.effect?.type === Constants.EFFECT_TYPE_TRANSFORM) {
        try {
          return schema.def.effect.transform(inputValue, { addIssue: () => undefined, path: [] });
        } catch {
          return inputValue;
        }
      }
      
      return inputValue;
    }

    if (schema instanceof z.ZodBigInt) {
      const checks = (schema.def.checks as ZodCheck[]) || [];
      const minConstraint = checks.find((c) => c._zod.def.check === 'greater_than');
      const maxConstraint = checks.find((c) => c._zod.def.check === 'less_than');
      const minBigInt = minConstraint ? BigInt((minConstraint._zod.def as z.core.$ZodCheckGreaterThanDef).value as bigint) : Constants.DEFAULT_BIGINT_MIN;
      const maxBigInt = maxConstraint ? BigInt((maxConstraint._zod.def as z.core.$ZodCheckLessThanDef).value as bigint) : Constants.DEFAULT_BIGINT_MAX;
      
      const normalizedMin = minBigInt < maxBigInt ? minBigInt : maxBigInt;
      const normalizedMax = minBigInt < maxBigInt ? maxBigInt : minBigInt;
      
      const minNumber = Number(normalizedMin);
      const maxNumber = Number(normalizedMax);
      const generatedNumber = this.faker.number.int({ min: minNumber, max: maxNumber });
      
      return BigInt(generatedNumber);
    }

    if (schema instanceof z.ZodNaN) {
      return NaN;
    }

    return null;
  }

  private generateStringValue(schema: z.core.$ZodString): string {
    const { minLength, maxLength, format } = schema as unknown as ZodStringWithPublicProps;

    if (format === Constants.FORMAT_EMAIL) {
      return this.faker.internet.email();
    }

    if (format === Constants.FORMAT_REGEX) {
      const stringWithDef = schema as unknown as ZodStringWithPublicProps;
      const regexCheck = stringWithDef.def.checks?.find((c: ZodCheck) => (c._zod.def as ZodCheckRegexDef).format === 'regex') as ZodCheckRegex | undefined;
      const regexPattern = (regexCheck?._zod.def as ZodCheckRegexDef)?.pattern;
      const regexGenerator = new RandExp(regexPattern);
      
      regexGenerator.randInt = (min: number, max: number) => this.faker.number.int({ min, max });
      
      if (maxLength) {
        regexGenerator.max = maxLength;
      }
      
      return regexGenerator.gen();
    }

    if (format === Constants.FORMAT_URL) {
      return this.faker.internet.url();
    }

    if (format === Constants.FORMAT_UUID) {
      return this.faker.string.uuid();
    }

    if (format === Constants.FORMAT_ULID) {
      return this.faker.string.ulid();
    }

    if (format === 'date-time' || format === 'datetime') {
      return this.faker.date.recent().toISOString();
    }

    const minStringLength = minLength ?? Constants.DEFAULT_STRING_MIN_LENGTH;
    const maxStringLength = maxLength ?? Constants.DEFAULT_STRING_MAX_LENGTH;
    const stringLength = this.faker.number.int({ min: minStringLength, max: maxStringLength });

    return this.faker.string.alpha({ length: stringLength });

  }

  private generateNumberValue(schema: z.ZodNumber): number {
    const { minValue, maxValue, format } = schema as unknown as ZodNumberWithPublicProps;

    const hasDecimalBounds = !Number.isInteger(minValue) || !Number.isInteger(maxValue);
    const hasFloatFormat = format !== null && Constants.FLOAT_FORMATS.includes(format as typeof Constants.FLOAT_FORMATS[number]);
    const isFloat = hasFloatFormat || hasDecimalBounds;
    
    const { min, max } = this.getNormalizedBounds(minValue, maxValue, isFloat);
    
    return isFloat 
      ? this.faker.number.float({ min, max }) 
      : this.faker.number.int({ min, max });
  }

  private getBrazilianMockValue(type: 'cpf' | 'cnpj' | 'rg' | 'phoneBR' | 'cep'): string {
    return this.faker.helpers.arrayElement(Constants.BRAZILIAN_MOCK_DATA[type]);
  }
  private getNormalizedBounds(minValue: number | null, maxValue: number | null, isFloat: boolean = false) {
    const isInfinity = (v: number | null) => v === Infinity || v === -Infinity;
    const defaultMin = isFloat ? Constants.DEFAULT_FLOAT_MIN : Constants.DEFAULT_INT_MIN;
    const defaultMax = isFloat ? Constants.DEFAULT_FLOAT_MAX : Constants.DEFAULT_INT_MAX;
    
    const minBound = minValue === null || isInfinity(minValue) ? defaultMin : minValue;
    const maxBound = maxValue === null || isInfinity(maxValue) ? defaultMax : maxValue;
    
    return minBound > maxBound ? { min: maxBound, max: minBound } : { min: minBound, max: maxBound };
  }

  private generateUnknownTypeValue(): MockValue {
    const typeGenerators: Record<string, () => MockValue> = {
      string: () => this.faker.lorem.words(Constants.DEFAULT_ANY_WORDS_COUNT),
      number: () => this.faker.number.int(Constants.DEFAULT_ANY_NUMBER_MAX),
      boolean: () => this.faker.datatype.boolean(),
      date: () => this.faker.date.recent(),
      array: () => Array.from({ length: Constants.DEFAULT_ANY_ARRAY_LENGTH }, () => this.faker.lorem.word()),
      object: () => ({ [this.faker.lorem.word()]: this.faker.lorem.words(Constants.DEFAULT_ANY_WORDS_COUNT) })
    };
    
    const selectedType = this.faker.helpers.arrayElement(Object.keys(typeGenerators));
    return typeGenerators[selectedType]();
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && 
           value !== null && 
           !Array.isArray(value) && 
           !(value instanceof Date) && 
           !(value instanceof Set) && 
           !(value instanceof Map);
  }

  private hasMetadata(schema: unknown): schema is { meta: () => Record<string, unknown> } {
    if (schema === null || typeof schema !== Constants.TYPE_OBJECT) return false;
    const obj = schema as Record<string, unknown>;
    return 'meta' in obj && typeof obj.meta === 'function';
  }

  private isBrandedType(schema: unknown): schema is { unwrap: () => z.core.$ZodType } {
    if (schema === null || typeof schema !== Constants.TYPE_OBJECT) return false;
    const obj = schema as Record<string, unknown>;
    return 'unwrap' in obj && typeof obj.unwrap === Constants.TYPE_FUNCTION;
  }

  private isEffectsType(schema: unknown): schema is { def: { schema: z.core.$ZodType; effect?: { type: string; transform: Function } } } {
    if (typeof schema !== Constants.TYPE_OBJECT || schema === null) return false;
    const def = (schema as Record<string, unknown>).def as Record<string, unknown> | undefined;
    return def?.typeName === Constants.ZOD_TYPE_EFFECTS;
  }

}