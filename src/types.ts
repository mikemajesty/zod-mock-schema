import { z } from 'zod';
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
}

/**
 * Configuration options for generating multiple mock data objects.
 * Extends MockOptions with additional configuration capabilities.
 * 
 * @template T - The type of data being generated.
 */
export type MockManyOptions<T = any> = {
  /**
   * Partial object containing property overrides for all generated data objects.
   * 
   * @example
   * ```typescript
   * const options: MockManyOptions<User> = {
   *   overrides: { companyId: 'comp_123', status: 'active' }
   * };
   * ```
   */
  overrides?: Partial<T>;
}

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
 * Recursive type representing all possible values that can be generated.
 * Used internally for mock data generation.
 * 
 * @internal
 */
export type AllType = 
  | string 
  | number 
  | boolean 
  | Date 
  | null 
  | undefined 
  | Record<string, unknown> 
  | any 
  | AllType[];

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

/**
 * Interface defining the public API of ZodMockSchema.
 * This separates the implementation from the public contract.
 */
export interface ZodMockSchemaInterface<T> {
  /**
   * Generates a single mock data object based on the Zod schema.
   * 
   * @template D - The output type (must extend T)
   * @param overrides - Optional configuration with property overrides
   * @returns A mock data object that conforms to the schema
   * 
   * @example
   * ```typescript
   * const data = mock.generate();
   * const customData = mock.generate({ overrides: { name: 'John' } });
   * ```
   */
  generate<D extends T>(overrides?: MockOptions<Partial<T>>): D;
  
  /**
   * Generates multiple mock data objects.
   * 
   * @template D - The output type (must extend T)
   * @param count - Number of objects to generate
   * @param options - Configuration options for generation
   * @returns An array of mock data objects
   * 
   * @example
   * ```typescript
   * const items = mock.generateMany(10);
   * const itemsWithOverrides = mock.generateMany(5, {
   *   overrides: { status: 'active' }
   * });
   * ```
   */
  generateMany<D extends Partial<T>>(count: number, options?: MockManyOptions<Partial<T>>): D[];
  
  /**
   * Gets mock data for Brazilian-specific formats.
   * Useful for generating valid Brazilian documents and contacts.
   * 
   * @returns Object with valid Brazilian data:
   * - `cpf`: Brazilian CPF (Cadastro de Pessoas Físicas)
   * - `cnpj`: Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica)
   * - `rg`: Brazilian RG (Registro Geral)
   * - `phoneBR`: Brazilian phone number
   * - `cep`: Brazilian postal code
   * 
   * @example
   * ```typescript
   * const brData = mock.getBralizilianMockedData();
   * console.log(brData.cpf); // "123.456.789-09"
   * ```
   */
  getBralizilianMockedData(): {
    cpf: string;
    cnpj: string;
    rg: string;
    phoneBR: string;
    cep: string;
  };
}