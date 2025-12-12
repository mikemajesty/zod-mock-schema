import { Faker, en } from '@faker-js/faker';
import RandExp from 'randexp';
import z from 'zod';
import { MockManyOptions, MockOptions, ZodCheck, ZodCheckMinLength, ZodCheckMaxLength, ZodCheckMinSize, ZodCheckMaxSize, ZodCheckRegex, ZodCheckRegexDef, ZodCheckMinLengthDef, ZodCheckMaxLengthDef, ZodCheckMinSizeDef, ZodCheckMaxSizeDef, MockValue, ZodStringWithPublicProps, ZodNumberWithPublicProps, BrazilianFormat } from './types';
import { Constants } from './constants';

export class ZodMockSchema<T> {
  public faker: Faker;

  constructor(readonly schema: z.ZodSchema<T>) {
    this.faker = new Faker({ locale: en });
  }

  seed(seed: number | number[]): this {
    const seedArray = Array.isArray(seed) ? seed : [seed];
    this.faker.seed(seedArray);
    return this;
  }

  generate<D extends T>(overrides?: MockOptions<T>): D {
    const originalFaker = this.faker;
    
    try {
      if (overrides?.faker) {
        this.faker = overrides.faker;
      }
      
      const mockData = this.generateFromSchema(this.schema);
      
      if (!this.hasCustomOverrides(overrides)) {
        return this.schema.parse(mockData) as D;
      }
      
      if (this.isPlainObject(overrides.overrides) && this.isPlainObject(mockData)) {
        const merged = { ...(mockData as object), ...overrides.overrides };
        return this.schema.parse(merged) as D;
      }
      
      return this.schema.parse(overrides.overrides) as D;
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
      const brazilianFormats: Record<string, BrazilianFormat> = {
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
      const constraints = this.getChecks(schema);
      const minConstraint = constraints.find((c) => c._zod.def.check === 'greater_than');
      const maxConstraint = constraints.find((c) => c._zod.def.check === 'less_than');
      
      const getDateBound = (constraint: ZodCheck | undefined): Date | undefined => {
        if (!constraint) return undefined;
        return new Date((constraint._zod.def as z.core.$ZodCheckGreaterThanDef | z.core.$ZodCheckLessThanDef).value as Date);
      };
      const minDateBound = getDateBound(minConstraint);
      const maxDateBound = getDateBound(maxConstraint);
      
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
      const checks = this.getChecks(schema);
      const minCheck = checks.find((c) => c._zod.def.check === 'min_length') as ZodCheckMinLength | undefined;
      const maxCheck = checks.find((c) => c._zod.def.check === 'max_length') as ZodCheckMaxLength | undefined;
      const minLength = (minCheck?._zod.def as ZodCheckMinLengthDef)?.minimum ?? Constants.DEFAULT_ARRAY_MIN_LENGTH;
      const maxLength = (maxCheck?._zod.def as ZodCheckMaxLengthDef)?.maximum ?? Constants.DEFAULT_ARRAY_MAX_LENGTH;
      const arrayLength = this.faker.number.int({ min: minLength, max: maxLength });

      return Array.from({ length: arrayLength }, () => this.generateFromSchema(schema.element));
    }

    if (schema instanceof z.ZodObject) {
      return Object.fromEntries(
        Object.entries(schema.shape).map(([key, propertySchema]) => [
          key,
          this.generateFromSchema(propertySchema as z.core.$ZodType)
        ])
      );
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

      const generateRecordKey = (index: number): string => {
        if (recordKeySchema instanceof z.ZodString) return this.generateStringValue(recordKeySchema);
        if (recordKeySchema instanceof z.ZodNumber) return this.generateNumberValue(recordKeySchema).toString();
        return `key${index}`;
      };

      return Array.from({ length: propertiesCount })
        .reduce((recordData, _, index) => ({
          ...recordData as object,
          [generateRecordKey(index)]: this.generateFromSchema(recordValueSchema)
        }), {} as Record<string, MockValue>);
    }

    if (schema instanceof z.ZodOptional) return this.generateFromSchema(schema.unwrap());
    if (schema instanceof z.ZodNullable) return this.generateFromSchema(schema.unwrap());

    if (schema instanceof z.ZodDefault) {
      const defaultValueOrFunction = (schema.def as { defaultValue?: unknown }).defaultValue;
      if (typeof defaultValueOrFunction === 'function') {
        return defaultValueOrFunction();
      }
      return defaultValueOrFunction;
    }

    if (schema instanceof z.ZodLazy) return this.generateFromSchema(schema.def.getter());

    if ([z.ZodAny, z.ZodUnknown].some(Type => schema instanceof Type)) {
      return this.generateUnknownTypeValue();
    }
    if (schema instanceof z.ZodVoid) return undefined;
    if (schema instanceof z.ZodNull) return null;
    if (schema instanceof z.ZodLiteral) return schema.value;


    if (schema instanceof z.ZodPipe) {
      return this.generateFromSchema(schema.def.in);
    }

    if (schema instanceof z.ZodSet) {
      const checks = this.getChecks(schema);
      const minConstraint = checks.find((c) => c._zod.def.check === 'min_size') as ZodCheckMinSize | undefined;
      const maxConstraint = checks.find((c) => c._zod.def.check === 'max_size') as ZodCheckMaxSize | undefined;
      const minSetSize = (minConstraint?._zod.def as ZodCheckMinSizeDef)?.minimum ?? Constants.DEFAULT_SET_MIN_SIZE;
      const maxSetSize = (maxConstraint?._zod.def as ZodCheckMaxSizeDef)?.maximum ?? Constants.DEFAULT_SET_MAX_SIZE;
      
      const targetSize = this.faker.number.int({ min: minSetSize, max: maxSetSize });
      
      const items = new Set<MockValue>();
      const setWithDef = schema as unknown as { def: { valueType: z.core.$ZodType; checks: ZodCheck[] } };
      
      for (let i = 0; i < targetSize * 3; i++) {
        items.add(this.generateFromSchema(setWithDef.def.valueType));
        if (items.size >= targetSize) break;
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
      
      if (!tupleWithDef.def.rest) {
        return fixedTupleItems;
      }
      
      const restTupleItems = Array.from(
        { length: this.faker.number.int({ min: Constants.DEFAULT_TUPLE_REST_MIN, max: Constants.DEFAULT_TUPLE_REST_MAX }) },
        () => this.generateFromSchema(tupleWithDef.def.rest!)
      );
      
      return [...fixedTupleItems, ...restTupleItems];
    }

    if (schema instanceof z.ZodFunction) {
      const functionWithDef = schema as unknown as { def: { output: z.core.$ZodType } };
      return (() => {
        return this.generateFromSchema(functionWithDef.def.output);
      }) as MockValue;
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
      const checks = this.getChecks(schema);
      const minConstraint = checks.find((c) => c._zod.def.check === 'greater_than');
      const maxConstraint = checks.find((c) => c._zod.def.check === 'less_than');
      
      const getBigIntBound = (constraint: ZodCheck | undefined, defaultValue: bigint): bigint => {
        if (!constraint) return defaultValue;
        return BigInt((constraint._zod.def as z.core.$ZodCheckGreaterThanDef | z.core.$ZodCheckLessThanDef).value as bigint);
      };
      const minBigInt = getBigIntBound(minConstraint, Constants.DEFAULT_BIGINT_MIN);
      const maxBigInt = getBigIntBound(maxConstraint, Constants.DEFAULT_BIGINT_MAX);
      
      const minNumber = minBigInt < maxBigInt ? Number(minBigInt) : Number(maxBigInt);
      const maxNumber = minBigInt < maxBigInt ? Number(maxBigInt) : Number(minBigInt);
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

    const formatGenerators = {
      [Constants.FORMAT_EMAIL]: this.faker.internet.email,
      [Constants.FORMAT_URL]: this.faker.internet.url,
      [Constants.FORMAT_UUID]: this.faker.string.uuid,
      [Constants.FORMAT_ULID]: this.faker.string.ulid
    };

    const simpleFormatResult = formatGenerators[format as keyof typeof formatGenerators]?.();
    if (simpleFormatResult) return simpleFormatResult;

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

    if (['date-time', 'datetime'].includes(format as `date-time` | `datetime`)) {
      return this.faker.date.recent().toISOString();
    }

    const minStringLength = minLength ?? Constants.DEFAULT_STRING_MIN_LENGTH;
    const maxStringLength = maxLength ?? Constants.DEFAULT_STRING_MAX_LENGTH;
    const stringLength = this.faker.number.int({ min: minStringLength, max: maxStringLength });

    return this.faker.string.alpha({ length: stringLength });
  }

  private generateNumberValue(schema: z.ZodNumber): number {
    const { minValue, maxValue, format } = schema as unknown as ZodNumberWithPublicProps;

    const hasDecimalBounds = [minValue, maxValue].some(v => !Number.isInteger(v));
    const hasFloatFormat = format !== null && Constants.FLOAT_FORMATS.includes(format as typeof Constants.FLOAT_FORMATS[number]);
    const isFloat = hasFloatFormat || hasDecimalBounds;
    
    const { min, max } = this.getNormalizedBounds(minValue, maxValue, isFloat);
    
    if (isFloat) {
      return this.faker.number.float({ min, max });
    }
    return this.faker.number.int({ min, max });
  }

  private getBrazilianMockValue(type: BrazilianFormat): string {
    return this.faker.helpers.arrayElement(Constants.BRAZILIAN_MOCK_DATA[type]);
  }

  private getChecks(schema: { def: { checks?: unknown } }): ZodCheck[] {
    return (schema.def.checks as ZodCheck[]) || [];
  }

  private getNormalizedBounds(minValue: number | null, maxValue: number | null, isFloat: boolean = false) {
    const isInfinity = (v: number | null) => v === Infinity || v === -Infinity;
    const defaultMin = isFloat ? Constants.DEFAULT_FLOAT_MIN : Constants.DEFAULT_INT_MIN;
    const defaultMax = isFloat ? Constants.DEFAULT_FLOAT_MAX : Constants.DEFAULT_INT_MAX;
    
    const getBound = (value: number | null, defaultValue: number): number => {
      if (value === null || isInfinity(value)) return defaultValue;
      return value;
    };
    const minBound = getBound(minValue, defaultMin);
    const maxBound = getBound(maxValue, defaultMax);
    
    if (minBound > maxBound) {
      return { min: maxBound, max: minBound };
    }
    return { min: minBound, max: maxBound };
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
    return typeof value === 'object' && [
      value !== null,
      !Array.isArray(value),
      !(value instanceof Date),
      !(value instanceof Set),
      !(value instanceof Map)
    ].every(Boolean);
  }

  private hasCustomOverrides(overrides?: MockOptions<T>): overrides is MockOptions<T> & { overrides: unknown } {
    return !!overrides && 'overrides' in overrides;
  }

  private isSchemaObject(schema: unknown): schema is Record<string, unknown> {
    return typeof schema === Constants.TYPE_OBJECT && schema !== null;
  }

  private hasMetadata(schema: unknown): schema is { meta: () => Record<string, unknown> } {
    if (!this.isSchemaObject(schema)) return false;
    return 'meta' in schema && typeof schema.meta === 'function';
  }

  private isBrandedType(schema: unknown): schema is { unwrap: () => z.core.$ZodType } {
    if (!this.isSchemaObject(schema)) return false;
    return 'unwrap' in schema && typeof schema.unwrap === Constants.TYPE_FUNCTION;
  }

  private isEffectsType(schema: unknown): schema is { def: { schema: z.core.$ZodType; effect?: { type: string; transform: Function } } } {
    if (!this.isSchemaObject(schema)) return false;
    const def = (schema as Record<string, unknown>).def as Record<string, unknown> | undefined;
    return def?.typeName === Constants.ZOD_TYPE_EFFECTS;
  }

}