import { z } from 'zod';
import { MockOptions } from './types';

export declare class ZodSchemaMock<T> {
  readonly faker: any;
  readonly schema: z.ZodSchema<T>;
  
  constructor(schema: z.ZodSchema<T>);
  
  generate<D>(options?: MockOptions<T>): D;
  generateMany<D>(count: number, options?: MockOptions<T>): D[];
}