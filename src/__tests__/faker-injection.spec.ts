import { z } from 'zod';
import { Faker, pt_BR, es } from '@faker-js/faker';
import { ZodMockSchema } from '../zod-mock-schema';

describe('Faker Injection', () => {
  
  it('should use custom faker instance with different locale', () => {
    const schema = z.object({
      name: z.string(),
      email: z.string()
    });
    
    const customFaker = new Faker({ locale: pt_BR });
    customFaker.seed(12345);
    
    const mock = new ZodMockSchema(schema);
    const result = mock.generate({ faker: customFaker });
    
    expect(result).toBeDefined();
    expect(typeof result.name).toBe('string');
    expect(typeof result.email).toBe('string');
  });

  it('should not affect default faker instance after custom faker usage', () => {
    const schema = z.string();
    const mock = new ZodMockSchema(schema);
    
    mock.seed(999);
    const result1 = mock.generate();
    
    const customFaker = new Faker({ locale: es });
    customFaker.seed(123);
    mock.generate({ faker: customFaker });
    
    mock.seed(999);
    const result2 = mock.generate();
    
    expect(result1).toBe(result2);
  });

  it('should allow parallel test scenarios with different faker instances', () => {
    const schema = z.object({
      value: z.number()
    });
    
    const mock = new ZodMockSchema(schema);
    
    const faker1 = new Faker({ locale: pt_BR });
    faker1.seed(100);
    
    const faker2 = new Faker({ locale: es });
    faker2.seed(200);
    
    const result1 = mock.generate({ faker: faker1 });
    const result2 = mock.generate({ faker: faker2 });
    
    expect(result1.value).not.toBe(result2.value);
  });

  it('should combine faker injection with overrides', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.string()
    });
    
    const customFaker = new Faker({ locale: pt_BR });
    customFaker.seed(555);
    
    const mock = new ZodMockSchema(schema);
    const result = mock.generate({
      faker: customFaker,
      overrides: { age: 30 }
    });
    
    expect(result.age).toBe(30);
    expect(typeof result.name).toBe('string');
    expect(typeof result.email).toBe('string');
  });

  it('should work with generateMany using custom faker', () => {
    const schema = z.object({
      id: z.string()
    });
    
    const customFaker = new Faker({ locale: pt_BR });
    customFaker.seed(777);
    
    const mock = new ZodMockSchema(schema);
    const results = mock.generateMany(3, { faker: customFaker });
    
    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(typeof result.id).toBe('string');
    });
  });

  it('should maintain seed behavior when using injected faker', () => {
    const schema = z.number();
    const mock = new ZodMockSchema(schema);
    
    const customFaker = new Faker({ locale: pt_BR });
    customFaker.seed(888);
    
    const result1 = mock.generate({ faker: customFaker });
    
    customFaker.seed(888);
    const result2 = mock.generate({ faker: customFaker });
    
    expect(result1).toBe(result2);
  });

  it('should use default faker when no custom faker is provided', () => {
    const schema = z.string();
    const mock = new ZodMockSchema(schema);
    
    mock.seed(123);
    const result1 = mock.generate();
    
    mock.seed(123);
    const result2 = mock.generate();
    
    expect(result1).toBe(result2);
  });

  it('should handle nested schemas with custom faker', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        age: z.number()
      }),
      tags: z.array(z.string())
    });
    
    const customFaker = new Faker({ locale: pt_BR });
    customFaker.seed(333);
    
    const mock = new ZodMockSchema(schema);
    const result = mock.generate({ faker: customFaker });
    
    expect(result.user).toBeDefined();
    expect(typeof result.user.name).toBe('string');
    expect(typeof result.user.age).toBe('number');
    expect(Array.isArray(result.tags)).toBe(true);
  });

});
