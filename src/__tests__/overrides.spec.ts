import { z } from 'zod';
import { ZodMockSchema } from '../zod-mock-schema';

describe('Overrides', () => {
  describe('Simple Overrides', () => {
    it('should override string fields', () => {
      const schema = z.object({
        name: z.string(),
        email: z.email()
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({
        overrides: {
          name: 'Custom Name',
          email: 'custom@example.com'
        }
      });
      
      expect(result.name).toBe('Custom Name');
      expect(result.email).toBe('custom@example.com');
    });

    it('should override number fields', () => {
      const schema = z.object({
        age: z.number(),
        score: z.number().min(0).max(100)
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({
        overrides: {
          age: 42,
          score: 95
        }
      });
      
      expect(result.age).toBe(42);
      expect(result.score).toBe(95);
    });

    it('should override boolean fields', () => {
      const schema = z.object({
        active: z.boolean(),
        verified: z.boolean()
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({
        overrides: {
          active: true,
          verified: false
        }
      });
      
      expect(result.active).toBe(true);
      expect(result.verified).toBe(false);
    });

    it('should override date fields', () => {
      const customDate = new Date('2024-01-01');
      const schema = z.object({
        createdAt: z.date(),
        updatedAt: z.date()
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({
        overrides: {
          createdAt: customDate
        }
      });
      
      expect(result.createdAt).toBe(customDate);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Nested Object Overrides', () => {
    it('should override nested object properties', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.email(),
          profile: z.object({
            bio: z.string(),
            age: z.number()
          })
        })
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({
        overrides: {
          user: {
            name: 'John Doe',
            email: 'john@example.com',
            profile: {
              bio: 'Software Engineer',
              age: 30
            }
          }
        }
      });
      
      expect(result.user.name).toBe('John Doe');
      expect(result.user.email).toBe('john@example.com');
      expect(result.user.profile.bio).toBe('Software Engineer');
      expect(result.user.profile.age).toBe(30);
    });

    it('should override all properties when providing nested object', () => {
      const schema = z.object({
        settings: z.object({
          theme: z.string(),
          language: z.string(),
          notifications: z.boolean()
        })
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({
        overrides: {
          settings: {
            theme: 'dark',
            language: 'en',
            notifications: true
          }
        }
      });
      
      expect(result.settings.theme).toBe('dark');
      expect(result.settings.language).toBe('en');
      expect(result.settings.notifications).toBe(true);
    });
  });

  describe('Array Overrides', () => {
    it('should override entire arrays', () => {
      const schema = z.object({
        tags: z.array(z.string()),
        scores: z.array(z.number())
      });
      
      const mock = new ZodMockSchema(schema);
      const customTags = ['tag1', 'tag2', 'tag3'];
      const customScores = [10, 20, 30];
      
      const result = mock.generate({
        overrides: {
          tags: customTags,
          scores: customScores
        }
      });
      
      expect(result.tags).toEqual(customTags);
      expect(result.scores).toEqual(customScores);
    });

    it('should override arrays of objects', () => {
      const schema = z.object({
        users: z.array(z.object({
          id: z.number(),
          name: z.string()
        }))
      });
      
      const mock = new ZodMockSchema(schema);
      const customUsers = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ];
      
      const result = mock.generate({
        overrides: {
          users: customUsers
        }
      });
      
      expect(result.users).toEqual(customUsers);
    });
  });

  describe('Optional and Nullable Overrides', () => {
    it('should override optional fields', () => {
      const schema = z.object({
        name: z.string(),
        nickname: z.string().optional()
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({
        overrides: {
          nickname: 'Johnny'
        }
      });
      
      expect(result.nickname).toBe('Johnny');
    });

    it('should override nullable fields', () => {
      const schema = z.object({
        name: z.string(),
        middleName: z.string().nullable()
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({
        overrides: {
          middleName: 'Custom'
        }
      });
      
      expect(result.middleName).toBe('Custom');
    });

    it('should set nullable fields to null via override', () => {
      const schema = z.object({
        name: z.string(),
        middleName: z.string().nullable()
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({
        overrides: {
          middleName: null
        }
      });
      
      expect(result.middleName).toBeNull();
    });
  });

  describe('Complex Schema Overrides', () => {
    const ComplexSchema = z.object({
      id: z.string().uuid(),
      user: z.object({
        name: z.string(),
        email: z.string().email(),
        age: z.number().int().positive(),
        addresses: z.array(z.object({
          street: z.string(),
          city: z.string(),
          zipCode: z.string()
        }))
      }),
      tags: z.array(z.string()),
      metadata: z.record(z.string(), z.any()),
      createdAt: z.date(),
      isActive: z.boolean()
    });

    it('should handle complex partial overrides', () => {
      const mock = new ZodMockSchema(ComplexSchema);
      const customId = '550e8400-e29b-41d4-a716-446655440000';
      const customDate = new Date('2024-01-01');
      
      const result = mock.generate({
        overrides: {
          id: customId,
          createdAt: customDate,
          isActive: true
        }
      });
      
      expect(result.id).toBe(customId);
      expect(result.createdAt).toBe(customDate);
      expect(result.isActive).toBe(true);
      expect(result.user.name).toBeDefined();
      expect(result.user.email).toBeDefined();
      expect(result.user.age).toBeGreaterThan(0);
    });

    it('should override entire nested user object', () => {
      const mock = new ZodMockSchema(ComplexSchema);
      const customUser = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 30,
        addresses: [
          { street: '123 Main St', city: 'New York', zipCode: '10001' },
          { street: '456 Oak Ave', city: 'Boston', zipCode: '02101' }
        ]
      };
      
      const result = mock.generate({
        overrides: {
          user: customUser
        }
      });
      
      expect(result.user).toEqual(customUser);
    });
  });

  describe('Override Validation', () => {
    it('should validate overridden values against schema', () => {
      const schema = z.object({
        age: z.number().min(18).max(100),
        email: z.email()
      });
      
      const mock = new ZodMockSchema(schema);
      
      expect(() => {
        mock.generate({
          overrides: {
            age: 150
          }
        });
      }).toThrow();
    });

    it('should validate email format in overrides', () => {
      const schema = z.object({
        email: z.email()
      });
      
      const mock = new ZodMockSchema(schema);
      
      expect(() => {
        mock.generate({
          overrides: {
            email: 'invalid-email'
          }
        });
      }).toThrow();
    });
  });

  describe('generateMany with Overrides', () => {
    it('should apply same overrides to all generated items', () => {
      const schema = z.object({
        name: z.string(),
        category: z.string(),
        active: z.boolean()
      });
      
      const mock = new ZodMockSchema(schema);
      const results = mock.generateMany(5, {
        overrides: {
          category: 'Premium',
          active: true
        }
      });
      
      expect(results).toHaveLength(5);
      results.forEach(item => {
        expect(item.category).toBe('Premium');
        expect(item.active).toBe(true);
        expect(item.name).toBeDefined();
      });
    });

    it('should generate different values for non-overridden fields', () => {
      const schema = z.object({
        id: z.uuid(),
        category: z.string()
      });
      
      const mock = new ZodMockSchema(schema);
      const results = mock.generateMany(5, {
        overrides: {
          category: 'Fixed'
        }
      });
      
      const ids = results.map(r => r.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(5);
      results.forEach(item => {
        expect(item.category).toBe('Fixed');
      });
    });
  });

  describe('Empty Overrides', () => {
    it('should work with empty overrides object', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({ overrides: {} });
      
      expect(result.name).toBeDefined();
      expect(result.age).toBeDefined();
    });

    it('should work without overrides parameter', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.name).toBeDefined();
      expect(result.age).toBeDefined();
    });
  });
});
