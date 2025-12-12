import { z } from 'zod';
import { Faker } from '@faker-js/faker';

// Public Zod v4 types for checks
export type ZodCheck = z.core.$ZodCheck;
export type ZodCheckMinLength = z.core.$ZodCheckMinLength;
export type ZodCheckMaxLength = z.core.$ZodCheckMaxLength;
export type ZodCheckMinSize = z.core.$ZodCheckMinSize;
export type ZodCheckMaxSize = z.core.$ZodCheckMaxSize;
export type ZodCheckRegex = z.core.$ZodCheckRegex;
export type ZodCheckRegexDef = z.core.$ZodCheckRegexDef;
export type ZodCheckMinLengthDef = z.core.$ZodCheckMinLengthDef;
export type ZodCheckMaxLengthDef = z.core.$ZodCheckMaxLengthDef;
export type ZodCheckMinSizeDef = z.core.$ZodCheckMinSizeDef;
export type ZodCheckMaxSizeDef = z.core.$ZodCheckMaxSizeDef;

export type BrazilianFormat = 'cpf' | 'cnpj' | 'rg' | 'phoneBR' | 'cep';

export type MockValue = string | number | boolean | Date | null | undefined | Record<string, unknown> | any | MockValue[];

// Internal types for runtime properties not typed in z.core
export type ZodStringWithPublicProps = {
  minLength: number | null;
  maxLength: number | null;
  format: string | null;
  def: { checks?: ZodCheck[] };
};

export type ZodNumberWithPublicProps = {
  minValue: number | null;
  maxValue: number | null;
  format: string | null;
};

/**
 * Configuration options for generating a single mock data object.
 * 
 * @template T - The type of data being generated.
 */
export type MockOptions<T = any> = {
  /**
   * Partial object containing property overrides for the generated data.
   * These values will replace the default generated values for specified properties.
   * 
   * @example
   * ```typescript
   * const options: MockOptions<User> = {
   *   overrides: { name: 'Custom Name', age: 30 }
   * };
   * ```
   */
  overrides?: Partial<T>;
  
  /**
   * Custom Faker instance to use for mock generation.
   * Useful for custom locales, parallel tests, or advanced Faker configuration.
   * 
   * @example
   * ```typescript
   * import { Faker, pt_BR } from '@faker-js/faker';
   * const customFaker = new Faker({ locale: pt_BR });
   * const options: MockOptions<User> = {
   *   faker: customFaker
   * };
   * ```
   */
  faker?: Faker;
}

/**
 * Configuration options for generating multiple mock data objects.
 * Extends MockOptions to inherit override and faker injection capabilities.
 * 
 * @template T - The type of data being generated.
 */
export type MockManyOptions<T = any> = MockOptions<T>;

/**
 * Utility type to extract the TypeScript type from a Zod schema.
 * 
 * @template T - A Zod schema type.
 * @returns The inferred TypeScript type from the Zod schema.
 * 
 * @example
 * ```typescript
 * const userSchema = z.object({ 
 *   name: z.string(),
 *   age: z.number() 
 * });
 * 
 * type User = ExtractType<typeof userSchema>;
 * // Result: { name: string; age: number; }
 * 
 * const mock = new ZodMockSchema(userSchema);
 * const data: User = mock.generate();
 * ```
 */
export type ExtractType<T extends z.ZodType<any>> = z.infer<T>;

/**
 * Main class for generating mock data based on Zod schemas.
 * Supports all Zod types with built-in generators for Brazilian formats.
 * 
 * @template T - The type inferred from the Zod schema
 * 
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { ZodMockSchema } from './zod-mock-schema';
 * 
 * const schema = z.object({
 *   id: z.string().uuid(),
 *   name: z.string(),
 *   email: z.string().email(),
 *   cpf: z.string().meta({ format: 'cpf' })
 * });
 * 
 * const mock = new ZodMockSchema(schema);
 * const data = mock.generate();
 * const multiple = mock.generateMany(5);
 * ```
 */
export interface ZodMockSchema<T> {
  /**
   * Faker.js instance for generating random data.
   * Accessible for custom data generation if needed.
   * 
   * @example
   * ```typescript
   * const mock = new ZodMockSchema(schema);
   * const randomEmail = mock.faker.internet.email();
   * ```
   */
  faker: typeof import('@faker-js/faker').faker;
  
  /**
   * The Zod schema used for mock data generation.
   */
  readonly schema: z.ZodSchema<T>;
}