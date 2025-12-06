import { faker } from '@faker-js/faker';
import { z } from 'zod';
import { MockManyOptions, MockOptions } from './types';
/**
 * A mock data generator based on Zod schemas.
 * 
 * This class provides methods to generate realistic mock data that conforms to
 * specified Zod schemas, useful for testing, development, and prototyping.
 */
export declare class ZodMockSchema<T> {
  /**
   * The Faker.js instance used for generating realistic fake data.
  //  * @type {Faker}
   */
  readonly faker: typeof faker;
  
  /**
   * The Zod schema that defines the structure and validation rules for generated data.
   * @type {z.ZodSchema<T>}
   */
  readonly schema: z.ZodSchema<T>;
  
  /**
   * Creates a new instance of ZodMockSchema.
   * 
   * @param {z.ZodSchema<T>} schema - The Zod schema to use for data generation and validation.
   * @example
   * const userSchema = z.object({
   *   name: z.string(),
   *   email: z.string().email()
   * });
   * const userMock = new ZodMockSchema(userSchema);
   */
  constructor(schema: z.ZodSchema<Partial<T>>);
  
  /**
   * Generates a single mock data object based on the configured Zod schema.
   * 
   * @template D - The type of data to generate (must extend the schema type T).
   * @param {MockOptions<T>} [options] - Configuration options for customizing the generated data.
   * @returns {D} A mock data object that conforms to the Zod schema.
   * @example
   * const user = userMock.generate({
   *   overrides: { name: 'Custom Name' }
   * });
   */
  generate<D extends T>(options?: MockOptions<Partial<T>>): D;
  
  /**
   * Generates multiple mock data objects based on the configured Zod schema.
   * 
   * @template D - The type of data to generate (must extend the schema type T).
   * @param {number} count - The number of mock objects to generate.
   * @param {MockManyOptions<T>} [options] - Configuration options for customizing the generated data.
   * @returns {D[]} An array of mock data objects that conform to the Zod schema.
   * @example
   * const users = userMock.generateMany(5, {
   *   overrides: { active: true }
   * });
   */
  generateMany<D extends T>(count: number, options?: MockManyOptions<Partial<T>>): D[];
  
  /**
   * Gets mock data for Brazilian-specific formats.
   * 
   * @returns {Object} An object containing valid Brazilian data:
   * - `cpf`: Valid Brazilian CPF number
   * - `cnpj`: Valid Brazilian CNPJ number
   * - `rg`: Valid Brazilian RG number
   * - `phoneBR`: Valid Brazilian phone number
   * - `cep`: Valid Brazilian postal code
   * @example
   * const brData = userMock.getBralizilianMockedData();
   * console.log(brData.cpf); // "123.456.789-09"
   */
  getBralizilianMockedData(): {
    cpf: string;
    cnpj: string;
    rg: string;
    phoneBR: string;
    cep: string;
  };
}