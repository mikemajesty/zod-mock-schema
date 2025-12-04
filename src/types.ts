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
   * { overrides: { name: 'Custom Name', age: 30 } }
   */
  overrides?: Partial<T>;
}

/**
 * Configuration type indicating that the index should be used as a prefix.
 * When this type is used, the iteration index will be appended to the field value.
 */
export type UseIndexType = {
  /**
   * Flag indicating that the iteration index should be used.
   * When set to true, the index will be concatenated to the field value.
   */
  useIndex: true;
}

/**
 * Type representing an array of string options to be used as prefixes.
 * One option will be randomly selected for each generated item.
 */
export type UseOptionsType = string[];

/**
 * Configuration for applying prefixes to specific fields in generated data.
 * 
 * @template T - The type of data being generated.
 */
export type PrefixType<T> = {
  /**
   * The prefix configuration, which can be either:
   * - An array of strings: One will be randomly selected for each item
   * - A UseIndexType object: The iteration index will be used
   */
  options: UseOptionsType | UseIndexType;
  
  /**
   * The field name to which the prefix should be applied.
   * Must be a key of the generated data type T.
   */
  for: keyof T;
}

/**
 * Configuration options for generating multiple mock data objects.
 * Extends MockOptions with additional prefix configuration capabilities.
 * 
 * @template T - The type of data being generated.
 */
export type MockManyOptions<T = any> = {
  /**
   * Partial object containing property overrides for all generated data objects.
   */
  overrides?: Partial<T>;
  
  /**
   * Configuration for applying prefixes to specific fields in the generated data.
   * Allows for creating unique, identifiable values across multiple generated items.
   */
  prefix?: PrefixType<T>;
}

/**
 * Utility type to extract the TypeScript type from a Zod schema.
 * 
 * @template T - A Zod schema type.
 * @returns The inferred TypeScript type from the Zod schema.
 * @example
 * const userSchema = z.object({ name: z.string() });
 * type User = ExtractType<typeof userSchema>; // { name: string }
 */
export type ExtractType<T extends z.ZodType<any>> = z.infer<T>;