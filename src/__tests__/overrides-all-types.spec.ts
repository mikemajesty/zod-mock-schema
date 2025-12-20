import { z } from 'zod';
import { ZodMockSchema } from '../zod-mock-schema.js';

describe('Overrides for All Zod Types', () => {
  
  describe('Primitive Types', () => {
    it('should override z.string()', () => {
      const schema = z.string();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 'custom-string' });
      
      expect(result).toBe('custom-string');
    });

    it('should override z.number()', () => {
      const schema = z.number();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 42 });
      
      expect(result).toBe(42);
    });

    it('should override z.boolean()', () => {
      const schema = z.boolean();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: true });
      
      expect(result).toBe(true);
    });

    it('should override z.date()', () => {
      const schema = z.date();
      const mock = new ZodMockSchema(schema);
      const customDate = new Date('2024-01-01');
      const result = mock.generate({ overrides: customDate });
      
      expect(result).toEqual(customDate);
    });

    it('should override z.bigint()', () => {
      const schema = z.bigint();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: BigInt(999) });
      
      expect(result).toBe(BigInt(999));
    });

    it('should override z.null()', () => {
      const schema = z.null();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: null });
      
      expect(result).toBe(null);
    });

    it('should override z.literal()', () => {
      const schema = z.literal('fixed-value');
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 'fixed-value' });
      
      expect(result).toBe('fixed-value');
    });
  });

  describe('String Variants', () => {
    it('should override z.email()', () => {
      const schema = z.email();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 'custom@example.com' });
      
      expect(result).toBe('custom@example.com');
    });

    it('should override z.url()', () => {
      const schema = z.url();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 'https://custom.com' });
      
      expect(result).toBe('https://custom.com');
    });

    it('should override z.uuid()', () => {
      const schema = z.uuid();
      const mock = new ZodMockSchema(schema);
      const customUuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = mock.generate({ overrides: customUuid });
      
      expect(result).toBe(customUuid);
    });
  });

  describe('Complex Types', () => {
    it('should override z.array()', () => {
      const schema = z.array(z.string());
      const mock = new ZodMockSchema(schema);
      const customArray = ['a', 'b', 'c'];
      const result = mock.generate({ overrides: customArray });
      
      expect(result).toEqual(customArray);
    });

    it('should override z.object() with partial overrides', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.email()
      });
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ 
        overrides: { 
          name: 'John Doe',
          age: 30
        } 
      });
      
      expect(result.name).toBe('John Doe');
      expect(result.age).toBe(30);
      expect(result.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should override z.object() completely', () => {
      const schema = z.object({
        id: z.string(),
        value: z.number()
      });
      const mock = new ZodMockSchema(schema);
      const customObject = { id: 'custom-id', value: 999 };
      const result = mock.generate({ overrides: customObject });
      
      expect(result).toEqual(customObject);
    });

    it('should override z.tuple()', () => {
      const schema = z.tuple([z.string(), z.number(), z.boolean()]);
      const mock = new ZodMockSchema(schema);
      const customTuple: [string, number, boolean] = ['custom', 42, true];
      const result = mock.generate({ overrides: customTuple });
      
      expect(result).toEqual(customTuple);
    });

    it('should override z.set()', () => {
      const schema = z.set(z.string());
      const mock = new ZodMockSchema(schema);
      const customSet = new Set(['a', 'b', 'c']);
      const result = mock.generate({ overrides: customSet });
      
      expect(result).toEqual(customSet);
    });

    it('should override z.map()', () => {
      const schema = z.map(z.string(), z.number());
      const mock = new ZodMockSchema(schema);
      const customMap = new Map([['key1', 10], ['key2', 20]]);
      const result = mock.generate({ overrides: customMap });
      
      expect(result).toEqual(customMap);
    });

    it('should override z.record() with merge behavior', () => {
      const schema = z.record(z.string(), z.number());
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ 
        overrides: { customKey: 999 } 
      });
      
      expect(result.customKey).toBe(999);
      expect(Object.keys(result).length).toBeGreaterThan(1);
    });

    it('should override z.enum()', () => {
      const schema = z.enum(['option1', 'option2', 'option3']);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 'option2' });
      
      expect(result).toBe('option2');
    });
  });

  describe('Wrapper Types', () => {
    it('should override z.optional()', () => {
      const schema = z.string().optional();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 'custom-optional' });
      
      expect(result).toBe('custom-optional');
    });

    it('should override z.nullable()', () => {
      const schema = z.string().nullable();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 'custom-nullable' });
      
      expect(result).toBe('custom-nullable');
    });

    it('should override z.default()', () => {
      const schema = z.string().default('default-value');
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 'custom-value' });
      
      expect(result).toBe('custom-value');
    });
  });

  describe('Union and Intersection', () => {
    it('should override z.union()', () => {
      const schema = z.union([z.string(), z.number()]);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 'custom-union' });
      
      expect(result).toBe('custom-union');
    });

    it('should override z.intersection()', () => {
      const schema = z.object({ name: z.string() })
        .and(z.object({ age: z.number() }));
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ 
        overrides: { 
          name: 'Custom Name',
          age: 99
        } 
      });
      
      expect(result.name).toBe('Custom Name');
      expect(result.age).toBe(99);
    });

    it('should override z.discriminatedUnion()', () => {
      const schema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('a'), value: z.string() }),
        z.object({ type: z.literal('b'), value: z.number() })
      ]);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ 
        overrides: { type: 'a' as const, value: 'custom' } 
      });
      
      expect(result.type).toBe('a');
      expect(result.value).toBe('custom');
    });
  });

  describe('Edge Cases', () => {
    it('should allow undefined as override value for optional schemas', () => {
      const schema = z.string().optional();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: undefined });
      
      expect(result).toBeUndefined();
    });

    it('should override nested object properties', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.email()
        }),
        settings: z.object({
          theme: z.string()
        })
      });
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ 
        overrides: { 
          user: { 
            name: 'Custom User',
            email: 'custom@test.com' 
          } 
        } 
      });
      
      expect(result.user.name).toBe('Custom User');
      expect(result.user.email).toBe('custom@test.com');
      expect(result.settings.theme).toBeDefined();
    });

    it('should override with transform', () => {
      const schema = z.string().transform(s => s.toUpperCase());
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 'lowercase' });
      
      expect(result).toBe('LOWERCASE');
    });

    it('should override with refine', () => {
      const schema = z.number().refine(n => n > 0, 'Must be positive');
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: 100 });
      
      expect(result).toBe(100);
    });

    it('should fail validation when override breaks refine', () => {
      const schema = z.number().refine(n => n > 0, 'Must be positive');
      const mock = new ZodMockSchema(schema);
      
      expect(() => {
        mock.generate({ overrides: -10 });
      }).toThrow();
    });
  });

  describe('Brazilian Formats Override', () => {
    it('should override CPF format', () => {
      const schema = z.string().meta({ format: 'cpf' });
      const mock = new ZodMockSchema(schema);
      const customCPF = '99999999999';
      const result = mock.generate({ overrides: customCPF });
      
      expect(result).toBe(customCPF);
    });

    it('should override CNPJ format', () => {
      const schema = z.string().meta({ format: 'cnpj' });
      const mock = new ZodMockSchema(schema);
      const customCNPJ = '99999999999999';
      const result = mock.generate({ overrides: customCNPJ });
      
      expect(result).toBe(customCNPJ);
    });
  });

  describe('Multiple Overrides in generateMany', () => {
    it('should apply same override to all generated items', () => {
      const schema = z.string();
      const mock = new ZodMockSchema(schema);
      const results = mock.generateMany(3, { overrides: 'same-value' });
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r === 'same-value')).toBe(true);
    });

    it('should apply object overrides to all items', () => {
      const schema = z.object({
        name: z.string(),
        active: z.boolean()
      });
      const mock = new ZodMockSchema(schema);
      const results = mock.generateMany(3, { 
        overrides: { active: true } 
      });
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.active === true)).toBe(true);
    });
  });
});
