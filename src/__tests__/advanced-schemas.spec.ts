import { z } from 'zod';
import { ZodMockSchema } from '../zod-mock-schema.js';

const AdvancedUserSchema = z.object({
  // Tipos novos
  tags: z.set(z.string()),
  metadata: z.map(z.string(), z.number()),
  coordinates: z.tuple([z.number(), z.number(), z.string()]),
  preferences: z.object({
    notifications: z.boolean(),
    theme: z.string()
  }).readonly(),
  
  // String com constraints melhorados
  name: z.string().min(3).max(50),
  email: z.email(),
  website: z.url(),
  userId: z.uuid(),
  code: z.string().regex(/^[A-Z]{3}-[0-9]{4}$/),
  
  // Number com constraints melhorados
  age: z.number().int().positive().min(18).max(120),
  balance: z.number().nonnegative(),
  score: z.number().min(0).max(100),
  
  // Date com constraints melhorados
  createdAt: z.date().min(new Date('2020-01-01')),
  updatedAt: z.date().max(new Date()),
  eventDate: z.date().min(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)).max(new Date()),
  
  // Default values
  status: z.string().default('active'),
  level: z.number().default(1),
  
  // Discriminated Union
  contact: z.discriminatedUnion('type', [
    z.object({ type: z.literal('email'), address: z.email() }),
    z.object({ type: z.literal('phone'), number: z.string() })
  ]),
  
  // Effects (transform/refine)
  username: z.string().transform((val) => val.toLowerCase()),
  rating: z.number().min(0).max(5)
});

const ComplexSystemSchema = z.object({
  // Set com objetos complexos
  users: z.set(z.object({ id: z.number(), name: z.string() })).min(1),
  
  // Map com tipos complexos
  permissions: z.map(
    z.string(),
    z.object({ read: z.boolean(), write: z.boolean() })
  ),
  
  // Tuple com rest
  logEntry: z.tuple([z.date(), z.string(), z.number()]).rest(z.any()),
  
  // Readonly array
  immutableList: z.array(z.string()).readonly(),
  
  // Multiple discriminated unions
  events: z.array(
    z.discriminatedUnion('eventType', [
      z.object({ eventType: z.literal('login'), timestamp: z.date(), userId: z.string() }),
      z.object({ eventType: z.literal('logout'), timestamp: z.date(), userId: z.string() }),
      z.object({ eventType: z.literal('error'), timestamp: z.date(), message: z.string() })
    ])
  )
});

describe('New Types Support - Advanced Schemas', () => {
  describe('AdvancedUserSchema', () => {
    it('should generate complete user with all new types and improved constraints', () => {
      const result = new ZodMockSchema(AdvancedUserSchema).generate();
      
      // Set validation
      expect(result.tags).toBeInstanceOf(Set);
      expect(result.tags.size).toBeGreaterThan(0);
      
      // Map validation
      expect(result.metadata).toBeInstanceOf(Map);
      expect(result.metadata.size).toBeGreaterThan(0);
      
      // Tuple validation
      expect(Array.isArray(result.coordinates)).toBe(true);
      expect(result.coordinates.length).toBe(3);
      expect(typeof result.coordinates[0]).toBe('number');
      expect(typeof result.coordinates[1]).toBe('number');
      expect(typeof result.coordinates[2]).toBe('string');
      
      // Readonly validation
      expect(result.preferences).toHaveProperty('notifications');
      expect(result.preferences).toHaveProperty('theme');
      
      // String constraints
      expect(result.name.length).toBeGreaterThanOrEqual(3);
      expect(result.name.length).toBeLessThanOrEqual(50);
      expect(result.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(result.website).toMatch(/^https?:\/\//);
      expect(result.userId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(result.code).toMatch(/^[A-Z]{3}-[0-9]{4}$/);
      
      // Number constraints
      expect(result.age).toBeGreaterThanOrEqual(18);
      expect(result.age).toBeLessThanOrEqual(120);
      expect(Number.isInteger(result.age)).toBe(true);
      expect(result.balance).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      
      // Date constraints
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(new Date('2020-01-01').getTime());
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(new Date().getTime());
      expect(result.eventDate).toBeInstanceOf(Date);
      expect(result.eventDate.getTime()).toBeGreaterThanOrEqual(Date.now() - 365 * 24 * 60 * 60 * 1000);
      expect(result.eventDate.getTime()).toBeLessThanOrEqual(Date.now());
      
      // Default values
      expect(result.status).toBe('active');
      expect(result.level).toBe(1);
      
      // Discriminated Union
      expect(result.contact).toHaveProperty('type');
      expect(['email', 'phone']).toContain(result.contact.type);
      
      // Username and rating
      expect(typeof result.username).toBe('string');
      expect(typeof result.rating).toBe('number');
    });

    it('should generate multiple users consistently', () => {
      const users = new ZodMockSchema(AdvancedUserSchema).generateMany(3);
      
      expect(users).toHaveLength(3);
      users.forEach(user => {
        expect(user.age).toBeGreaterThanOrEqual(18);
        expect(user.status).toBe('active');
        expect(user.level).toBe(1);
      });
    });

    it('should respect overrides for simple fields', () => {
      const result = new ZodMockSchema(AdvancedUserSchema).generate({
        overrides: {
          name: 'Custom Name',
          age: 25
        }
      });
      
      expect(result.name).toBe('Custom Name');
      expect(result.age).toBe(25);
      expect(result.status).toBe('active');
    });
  });

  describe('ComplexSystemSchema', () => {
    it('should generate system with complex nested types', () => {
      const result = new ZodMockSchema(ComplexSystemSchema).generate();
      
      // Set with complex objects
      expect(result.users).toBeInstanceOf(Set);
      expect(result.users.size).toBeGreaterThanOrEqual(1);
      result.users.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(typeof user.id).toBe('number');
        expect(typeof user.name).toBe('string');
      });
      
      // Map with complex values
      expect(result.permissions).toBeInstanceOf(Map);
      result.permissions.forEach((value: any, key: any) => {
        expect(typeof key).toBe('string');
        expect(value).toHaveProperty('read');
        expect(value).toHaveProperty('write');
        expect(typeof value.read).toBe('boolean');
        expect(typeof value.write).toBe('boolean');
      });
      
      // Tuple with rest
      expect(Array.isArray(result.logEntry)).toBe(true);
      expect(result.logEntry.length).toBeGreaterThanOrEqual(3);
      expect(result.logEntry[0]).toBeInstanceOf(Date);
      expect(typeof result.logEntry[1]).toBe('string');
      expect(typeof result.logEntry[2]).toBe('number');
      
      // Readonly array
      expect(Array.isArray(result.immutableList)).toBe(true);
      
      // Discriminated union array
      expect(Array.isArray(result.events)).toBe(true);
      result.events.forEach(event => {
        expect(event).toHaveProperty('eventType');
        expect(['login', 'logout', 'error']).toContain(event.eventType);
        expect(event).toHaveProperty('timestamp');
        expect(event.timestamp).toBeInstanceOf(Date);
      });
    });
  });

  describe('Seed Support with New Types', () => {
    it('should generate consistent data when using same seed', () => {
      const SimpleSchema = z.object({
        code: z.string().regex(/^[A-Z]{3}-[0-9]{4}$/)
      });
      
      const result1 = new ZodMockSchema(SimpleSchema).seed(999).generate();
      const result2 = new ZodMockSchema(SimpleSchema).seed(999).generate();
      
      expect(result1.code).toBe(result2.code);
    });
  });
});
