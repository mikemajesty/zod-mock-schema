import { z } from 'zod';
import { ZodMockSchema } from '../zod-mock-schema';

describe('Brazilian Formats', () => {
  describe('CPF Format', () => {
    it('should generate valid CPF when using meta format', () => {
      const schema = z.string().meta({ format: 'cpf' });
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{11}$/);
    });

    it('should generate multiple different CPFs', () => {
      const schema = z.string().meta({ format: 'cpf' });
      const mock = new ZodMockSchema(schema);
      
      const results = Array.from({ length: 10 }, () => mock.generate());
      const uniqueResults = new Set(results);
      
      expect(uniqueResults.size).toBeGreaterThan(1);
    });

    it('should work in complex objects', () => {
      const schema = z.object({
        name: z.string(),
        cpf: z.string().meta({ format: 'cpf' }),
        age: z.number()
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.cpf).toMatch(/^\d{11}$/);
    });
  });

  describe('CNPJ Format', () => {
    it('should generate valid CNPJ when using meta format', () => {
      const schema = z.string().meta({ format: 'cnpj' });
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{14}$/);
    });

    it('should generate multiple different CNPJs', () => {
      const schema = z.string().meta({ format: 'cnpj' });
      const mock = new ZodMockSchema(schema);
      
      const results = Array.from({ length: 10 }, () => mock.generate());
      const uniqueResults = new Set(results);
      
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  describe('RG Format', () => {
    it('should generate valid RG when using meta format', () => {
      const schema = z.string().meta({ format: 'rg' });
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{9}$/);
    });

    it('should generate multiple different RGs', () => {
      const schema = z.string().meta({ format: 'rg' });
      const mock = new ZodMockSchema(schema);
      
      const results = Array.from({ length: 10 }, () => mock.generate());
      const uniqueResults = new Set(results);
      
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  describe('Brazilian Phone Format', () => {
    it('should generate valid Brazilian phone when using meta format', () => {
      const schema = z.string().meta({ format: 'phoneBR' });
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{11}$/);
    });

    it('should generate multiple different phone numbers', () => {
      const schema = z.string().meta({ format: 'phoneBR' });
      const mock = new ZodMockSchema(schema);
      
      const results = Array.from({ length: 10 }, () => mock.generate());
      const uniqueResults = new Set(results);
      
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  describe('CEP Format', () => {
    it('should generate valid CEP when using meta format', () => {
      const schema = z.string().meta({ format: 'cep' });
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{8}$/);
    });

    it('should generate multiple different CEPs', () => {
      const schema = z.string().meta({ format: 'cep' });
      const mock = new ZodMockSchema(schema);
      
      const results = Array.from({ length: 10 }, () => mock.generate());
      const uniqueResults = new Set(results);
      
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  describe('Complete Brazilian Person Schema', () => {
    const BrazilianPersonSchema = z.object({
      name: z.string().min(3).max(100),
      cpf: z.string().meta({ format: 'cpf' }),
      rg: z.string().meta({ format: 'rg' }),
      phone: z.string().meta({ format: 'phoneBR' }),
      address: z.object({
        street: z.string(),
        number: z.string(),
        complement: z.string().optional(),
        neighborhood: z.string(),
        city: z.string(),
        state: z.string().length(2),
        cep: z.string().meta({ format: 'cep' })
      }),
      company: z.object({
        name: z.string(),
        cnpj: z.string().meta({ format: 'cnpj' }),
        phone: z.string().meta({ format: 'phoneBR' })
      }).optional()
    });

    it('should generate complete Brazilian person data', () => {
      const mock = new ZodMockSchema(BrazilianPersonSchema);
      const result = mock.generate();
      
      expect(result.cpf).toMatch(/^\d{11}$/);
      expect(result.rg).toMatch(/^\d{9}$/);
      expect(result.phone).toMatch(/^\d{11}$/);
      expect(result.address.cep).toMatch(/^\d{8}$/);
    });

    it('should generate multiple different people', () => {
      const mock = new ZodMockSchema(BrazilianPersonSchema);
      const results = mock.generateMany(5);
      
      expect(results).toHaveLength(5);
      
      const cpfs = results.map(r => r.cpf);
      const uniqueCpfs = new Set(cpfs);
      expect(uniqueCpfs.size).toBeGreaterThan(1);
    });

    it('should respect overrides with Brazilian formats', () => {
      const mock = new ZodMockSchema(BrazilianPersonSchema);
      const customCpf = '12345678909';
      
      const result = mock.generate({
        overrides: {
          cpf: customCpf,
          name: 'João Silva'
        }
      });
      
      expect(result.cpf).toBe(customCpf);
      expect(result.name).toBe('João Silva');
      expect(result.rg).toMatch(/^\d{9}$/);
    });
  });

  describe('Mixed Formats Schema', () => {
    it('should handle mix of Brazilian and international formats', () => {
      const schema = z.object({
        cpf: z.string().meta({ format: 'cpf' }),
        email: z.email(),
        uuid: z.uuid(),
        url: z.url(),
        phone: z.string().meta({ format: 'phoneBR' }),
        cep: z.string().meta({ format: 'cep' })
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.cpf).toMatch(/^\d{11}$/);
      expect(result.email).toContain('@');
      expect(result.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(result.url).toMatch(/^https?:\/\//);
      expect(result.phone).toMatch(/^\d{11}$/);
      expect(result.cep).toMatch(/^\d{8}$/);
    });
  });

  describe('Brazilian Formats in Arrays', () => {
    it('should generate arrays of CPFs', () => {
      const schema = z.array(z.string().meta({ format: 'cpf' })).min(3).max(3);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toHaveLength(3);
      result.forEach(cpf => {
        expect(cpf).toMatch(/^\d{11}$/);
      });
    });

    it('should generate arrays of mixed Brazilian formats', () => {
      const schema = z.array(
        z.object({
          type: z.enum(['cpf', 'cnpj']),
          value: z.string()
        })
      );
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Seed Consistency with Brazilian Formats', () => {
    it('should generate same Brazilian data with same seed', () => {
      const schema = z.object({
        cpf: z.string().meta({ format: 'cpf' }),
        cnpj: z.string().meta({ format: 'cnpj' }),
        cep: z.string().meta({ format: 'cep' })
      });
      
      const mock1 = new ZodMockSchema(schema);
      mock1.seed(12345);
      const result1 = mock1.generate();
      
      const mock2 = new ZodMockSchema(schema);
      mock2.seed(12345);
      const result2 = mock2.generate();
      
      expect(result1.cpf).toBe(result2.cpf);
      expect(result1.cnpj).toBe(result2.cnpj);
      expect(result1.cep).toBe(result2.cep);
    });
  });
});
