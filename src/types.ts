import { z } from 'zod';

export type MockOptions<T = any>  ={
  overrides?: Partial<T>;
}

export type ExtractType<T extends z.ZodType<any>> = z.infer<T>;