import { faker } from '@faker-js/faker';
import RandExp from 'randexp';
import z from 'zod';
import { MockManyOptions, MockOptions, UseOptionsType } from './types';

type AllType = string | number | boolean | Date | null | undefined | Record<string, unknown> | any | AllType[];

export class ZodMockSchema<T> {
  public faker = faker

  constructor(readonly schema: z.ZodSchema<T>) {}

  generate<D extends T>(overrides?: MockOptions<T>): D {
    const mockData = this.generateMockData(this.schema);
    const merged = { ...(mockData as object), ...overrides?.overrides};
    return this.schema.parse(merged) as D;
  }

  generateMany<D extends T>(
    count: number, 
    options: MockManyOptions<T> = {}
  ): D[] {
    const { overrides = {}, prefix } = options;
    
    return Array.from({ length: count }, (_, index) => {
      const data = this.generate(overrides) as any;
      
      if (!prefix) return data as D;
      
      const { for: field, options: prefixOptions } = prefix;
      
      if (Array.isArray(prefixOptions)) {
        const selectedPrefix = faker.helpers.arrayElement(prefixOptions);
        data[field] = `${selectedPrefix}_${String(data[field])}`;
        return data as D;
      }
      
      data[field] = `${String(data[field])}_${index + 1}`;
      return data as D;
    });
  }

  private generateMockData(schema: z.core.$ZodType): AllType {
    if ('meta' in schema && schema?.meta) {
      const meta = (schema as { meta: () => Record<string, unknown> })?.meta() as Record<string, unknown> || { format: null };

      if (meta?.format === 'cpf') {
        return '52269759028'
      }

      if (meta?.format === 'cnpj') {
        return '79372947000183'
      }

      if (meta?.format === 'rg') {
        return '202991210'
      }

      if (meta?.format === 'phoneBR') {
        return '11987654321'
      }

      if (meta?.format === 'cep') {
        return '88030490'
      }
    }

    if (schema instanceof z.ZodUnion) {
      const options = schema.def.options as z.core.$ZodType[];
      const randomOption = faker.helpers.arrayElement(options);
      return this.generateMockData(randomOption);
    }

    if (schema instanceof z.ZodIntersection) {
      const left = this.generateMockData(schema.def.left) as Record<string, unknown>;
      const right = this.generateMockData(schema.def.right) as Record<string, unknown>;
      return { ...left, ...right };
    }

    if (schema instanceof z.ZodEmail) return faker.internet.email();
    if (schema instanceof z.ZodURL) return faker.internet.url();
    if (schema instanceof z.ZodUUID) return faker.string.uuid();
    if (schema instanceof z.ZodString) {
      return this.generateString(schema);
    };
    if (schema instanceof z.ZodNumber) {
      return this.generateNumber(schema);
    }
    if (schema instanceof z.ZodBoolean) return faker.datatype.boolean();
    if (schema instanceof z.ZodDate) return faker.date.recent();


    if (schema instanceof z.ZodArray) {
      type MaxMinType = z.core.$ZodCheckMinSizeDef | z.core.$ZodCheckMaxSizeDef

      const minMaxList: MaxMinType[] = (schema.def?.checks || []).map(c => (c._zod.def as MaxMinType))
      const min = (minMaxList.find(m => (m as z.core.$ZodCheckMinSizeDef)?.minimum !== undefined) as z.core.$ZodCheckMinSizeDef)?.minimum ?? 1
      const max = (minMaxList.find(m => (m as z.core.$ZodCheckMaxSizeDef)?.maximum !== undefined) as z.core.$ZodCheckMaxSizeDef)?.maximum ?? 1
      const length = faker.number.int({ min, max });

      return Array.from({ length }, () => this.generateMockData(schema.element));
    }

    if (schema instanceof z.ZodObject) {
      const mockData: Record<string, AllType> = {};
      const shape = schema.shape;

      for (const [key, fieldSchema] of Object.entries(shape)) {
        if (fieldSchema.type === 'default') {
          const value = shape[key].def.defaultValue
          if (value) {
            mockData[key] = value
            continue
          }
        }
        mockData[key] = this.generateMockData(fieldSchema as z.core.$ZodType);
      }
      return mockData;
    }

    if (schema instanceof z.ZodEnum) {
      return faker.helpers.arrayElement(schema.options);
    }

    if (schema instanceof z.ZodRecord) {
      const keySchema = schema.keyType;
      const valueSchema = schema.valueType;

      if (keySchema instanceof z.ZodEnum) {
        const options = keySchema.options as string[];
        const propertyCount = options.length
        const selectedKeys = faker.helpers.arrayElements(options, propertyCount);

        return selectedKeys.reduce((record, key) => ({
          ...record,
          [key]: this.generateMockData(valueSchema)
        }), {} as Record<string, AllType>);
      }

      const propertyCount = faker.number.int({ min: 1, max: 3 });

      return Array.from({ length: propertyCount })
        .reduce((record, _, index) => {
          const key = keySchema instanceof z.ZodString
            ? this.generateString(keySchema)
            : keySchema instanceof z.ZodNumber
              ? this.generateNumber(keySchema).toString()
              : `${index}`;

          return {
            ...record as object,
            [key]: this.generateMockData(valueSchema)
          };
        }, {} as Record<string, AllType>);
    }

    if (schema instanceof z.ZodOptional) return this.generateMockData(schema.unwrap());
    if (schema instanceof z.ZodNullable) return this.generateMockData(schema.unwrap());

    if (schema instanceof z.ZodDefault) return this.generateMockData(schema.unwrap());

    if (schema instanceof z.ZodLazy) return this.generateMockData(schema.def.getter());

    if (schema instanceof z.ZodAny || schema instanceof z.ZodUnknown) return this.generateAnyValue();
    if (schema instanceof z.ZodVoid) return undefined;
    if (schema instanceof z.ZodNull) return null;
    if (schema instanceof z.ZodLiteral) return schema.value;


    if (schema instanceof z.ZodPipe) {
      const pipe = this.generateMockData(schema.def.in);
      return pipe
    }

    return null;
  }

  private generateString(schema: z.core.$ZodString): string {
    const value = schema as z._ZodString;

    const { minLength, maxLength, format } = value;

    if (format === 'email') {
      return faker.internet.email();
    }

    if (format === 'regex') {
      type RegexType = z.core.$ZodCheckDef & { pattern: string }
      const regex = (value.def.checks?.find(c => (c._zod.def as RegexType)?.pattern)?._zod.def as RegexType)?.pattern as string
      const randexp = new RandExp(regex);
      return randexp.gen();
    }

    if (format === 'url') {
      return faker.internet.url();
    }

    if (format === 'uuid') {
      return faker.string.uuid();
    }

    if (format === 'ulid') {
      return faker.string.ulid();
    }

    if (format === 'date-time' || format === 'datetime') {
      return faker.date.recent().toISOString();
    }

    const min = 10
    const max = this.getRandomNumber(100, min)
    return faker.string.alpha({
      length: {
        min: minLength ?? min,
        max: maxLength ?? max
      }
    });

  }

  private getRandomNumber = (max: number, sum = 1) => {
    return Math.floor(Math.random() * (max + 1)) + sum;
  }

  private generateNumber(schema: z.ZodNumber): number {

    const value = schema as z._ZodNumber;

    const { minValue, maxValue, format } = value;

    if (!format) {
      const { min, max } = this.getMinMax(minValue, maxValue);
      return faker.number.int({
        min,
        max
      });
    }
    if (format === 'int' || format === 'integer' || format === 'int32' || format === 'int64' || format === 'uint' || format === 'uint32' || format === 'uint64' || format === 'safeint' || format === 'safeinteger') {
      const min = 1
      return faker.number.int({
        min: minValue ?? min,
        max: maxValue ?? this.getRandomNumber(1000, min)
      });
    }

    if (format === 'float' || format === 'double' || format === 'decimal' || format === 'float32' || format === 'float64') {
      const min = 1.5
      return faker.number.float({
        min: minValue ?? min,
        max: maxValue ?? this.getRandomNumber(1000, min)
      });
    }

    const min = 1
    return faker.number.int({
      min: minValue ?? min,
      max: maxValue ?? this.getRandomNumber(1000, min)
    });

  }

  private getMinMax(minValue: number | null, maxValue: number | null) {
    const infinity = [Infinity, -Infinity]
    const isMinInfinity = infinity.some(i => i === minValue)
    const isMaxInfinity = infinity.some(i => i === maxValue)
    const minSafe = this.getRandomNumber(1000)
    const min = isMinInfinity ? minSafe : (minValue || 1);
    const max = isMaxInfinity ? this.getRandomNumber(1000, minSafe) : (maxValue || this.getRandomNumber(1000, minSafe));
    return { min, max };
  }

  private generateAnyValue(): AllType {
    const types = ['string', 'number', 'boolean', 'date', 'array', 'object'] as const;
    const randomType = faker.helpers.arrayElement(types);

    if (randomType === 'string') return faker.lorem.words(2);
    if (randomType === 'number') return faker.number.int(100);
    if (randomType === 'boolean') return faker.datatype.boolean();
    if (randomType === 'date') return faker.date.recent();
    if (randomType === 'array') return Array.from({ length: 2 }, () => faker.lorem.word());
    if (randomType === 'object') return { [faker.lorem.word()]: faker.lorem.words(2) };

    return null;
  }
}