import { z } from 'zod';
import { ZodMockSchema } from '../zod-mock-schema.js';

describe('Unsupported Schema Types', () => {
  it('should throw informative error for unsupported types', () => {
    // Criando um schema com tipo que teoricamente não suportamos
    // (todos os tipos atuais são suportados, mas isso testa o fallback)
    const mockSchema = {} as any;
    mockSchema._def = { typeName: 'ZodCustomUnsupportedType' };
    
    const mock = new ZodMockSchema(mockSchema);
    
    expect(() => mock.generate()).toThrow('Unsupported Zod type: ZodCustomUnsupportedType');
    expect(() => mock.generate()).toThrow('This schema type is not currently supported');
    expect(() => mock.generate()).toThrow('please open an issue');
    expect(() => mock.generate()).toThrow('https://github.com/mikemajesty/zod-mock-schema/issues');
  });

  it('should provide helpful error message format', () => {
    const unsupportedSchema = {} as any;
    unsupportedSchema._def = { typeName: 'ZodFutureType' };
    
    const mock = new ZodMockSchema(unsupportedSchema);
    
    try {
      mock.generate();
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toContain('ZodFutureType');
      expect(error.message).toContain('not currently supported');
      expect(error.message).toContain('github.com');
    }
  });
});
