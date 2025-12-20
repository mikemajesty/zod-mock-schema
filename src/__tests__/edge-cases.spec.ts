import { z } from 'zod';
import { ZodMockSchema } from '../zod-mock-schema.js';

describe('Edge Cases', () => {
  describe('Numeric Edge Cases', () => {

    it('should handle zero-based ranges', () => {
      const schema = z.number().min(0).max(0);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBe(0);
    });

    it('should handle decimal precision without explicit format', () => {
      const schema = z.number().min(0.1).max(0.9);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBeGreaterThanOrEqual(0.1);
      expect(result).toBeLessThanOrEqual(0.9);
      expect(typeof result).toBe('number');
    });

    it('should handle very large numbers', () => {
      const schema = z.number().min(1e10).max(1e12);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBeGreaterThanOrEqual(1e10);
      expect(result).toBeLessThanOrEqual(1e12);
    });

    it('should handle integer ranges', () => {
      const schema = z.number().int().min(10).max(20);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(20);
    });

    it('should handle negative number ranges', () => {
      const schema = z.number().min(-100).max(-10);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBeGreaterThanOrEqual(-100);
      expect(result).toBeLessThanOrEqual(-10);
    });
  });

  describe('String Edge Cases', () => {
    it('should handle zero-length strings', () => {
      const schema = z.string().min(0).max(0);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBe('');
    });

    it('should handle very long strings', () => {
      const schema = z.string().min(1000).max(1000);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.length).toBe(1000);
    });


    it('should handle large arrays', () => {
      const schema = z.array(z.number()).min(100).max(100);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toHaveLength(100);
    });
  });

  describe('Date Edge Cases', () => {
    it('should handle dates in the past', () => {
      const pastDate = new Date('2000-01-01');
      const schema = z.date().max(pastDate);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.getTime()).toBeLessThanOrEqual(pastDate.getTime());
    });

    it('should handle dates in the future', () => {
      const futureDate = new Date('2030-01-01');
      const schema = z.date().min(futureDate);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.getTime()).toBeGreaterThanOrEqual(futureDate.getTime());
    });

    it('should handle narrow date ranges', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-02');
      const schema = z.date().min(start).max(end);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
    });
  });

  describe('Set Edge Cases', () => {
    it('should handle empty sets', () => {
      const schema = z.set(z.number()).min(0).max(0);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.size).toBe(0);
    });

    it('should handle sets with primitives', () => {
      const schema = z.set(z.number()).min(5).max(5);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.size).toBe(5);
      expect(result).toBeInstanceOf(Set);
    });

    it('should attempt to generate unique values for sets', () => {
      const schema = z.set(z.number().min(1).max(10)).min(5).max(5);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.size).toBeGreaterThan(0);
      expect(result.size).toBeLessThanOrEqual(5);
    });
  });

  describe('BigInt Edge Cases', () => {
    it('should handle negative bigints', () => {
      const schema = z.bigint().min(BigInt(-1000)).max(BigInt(-100));
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBeGreaterThanOrEqual(BigInt(-1000));
      expect(result).toBeLessThanOrEqual(BigInt(-100));
    });

    it('should handle very large bigints', () => {
      const schema = z.bigint().min(BigInt(10000)).max(BigInt(99999));
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBeGreaterThanOrEqual(BigInt(10000));
      expect(result).toBeLessThanOrEqual(BigInt(99999));
    });
  });

  describe('Complex Nesting Edge Cases', () => {
    it('should handle deeply nested objects', () => {
      const schema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.object({
              level4: z.object({
                value: z.string()
              })
            })
          })
        })
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.level1.level2.level3.level4.value).toBeDefined();
      expect(typeof result.level1.level2.level3.level4.value).toBe('string');
    });

    it('should handle arrays of arrays', () => {
      const schema = z.array(z.array(z.number()));
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(Array.isArray(result)).toBe(true);
      expect(Array.isArray(result[0])).toBe(true);
    });

    it('should handle optional chains', () => {
      const schema = z.object({
        a: z.string().optional(),
        b: z.number().nullable(),
        c: z.boolean().optional().nullable()
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBeDefined();
    });
  });

  describe('Special Values', () => {
    it('should handle ZodNaN', () => {
      const schema = z.nan();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(Number.isNaN(result)).toBe(true);
    });

    it('should handle ZodNull', () => {
      const schema = z.null();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBeNull();
    });

    it('should handle ZodVoid', () => {
      const schema = z.void();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBeUndefined();
    });

    it('should handle ZodLiteral with various types', () => {
      const stringLiteral = z.literal('exact');
      const numberLiteral = z.literal(42);
      const boolLiteral = z.literal(true);
      
      expect(new ZodMockSchema(stringLiteral).generate()).toBe('exact');
      expect(new ZodMockSchema(numberLiteral).generate()).toBe(42);
      expect(new ZodMockSchema(boolLiteral).generate()).toBe(true);
    });
  });

  describe('Record Edge Cases', () => {
    it('should handle empty records with enum keys', () => {
      const schema = z.record(z.enum(['a', 'b']), z.string());
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(typeof result).toBe('object');
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should handle records with string keys', () => {
      const schema = z.record(z.string(), z.string());
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(typeof result).toBe('object');
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });
  });
});
