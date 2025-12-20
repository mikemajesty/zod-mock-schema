import { z } from 'zod';
import { ZodMockSchema } from '../zod-mock-schema.js';

enum SortEnum {
  asc = 1,
  desc = -1
}

const PaginationSchema = z.object({
  page: z.union([z.number(), z.string(), z.nan()]).default(1),
  limit: z.union([z.number(), z.string(), z.nan()]).default(10)
})
  .transform((pagination) => {
    let limit = Number(pagination.limit);
    let page = Number(pagination.page);

    if (isNaN(limit)) {
      limit = 10;
    }

    if (isNaN(page)) {
      page = 1;
    }

    return {
      page: page > 0 ? page : 1,
      limit: limit > 0 ? (limit > 100 ? 100 : limit) : 10
    };
  })
  .refine((pagination) => Number.isInteger(pagination.page), {
    path: ['page'],
    message: 'invalidInteger'
  })
  .refine((pagination) => Number.isInteger(pagination.limit), {
    path: ['limit'],
    message: 'invalidInteger'
  });

const SortSchema = z.object({
  sort: z.record(z.string().trim().min(1), z.nativeEnum(SortEnum))
    .nullable()
    .default({})
});

const SearchSchema = z.object({
  search: z.record(
    z.string().trim(),
    z.number().or(z.string()).or(z.array(z.any()))
  )
    .nullable()
    .default({})
});

describe('Complex Intersections with Transform and Refine', () => {
  
  describe('PaginationSchema alone', () => {
    it('should generate valid pagination with transform and refine', () => {
      const mock = new ZodMockSchema(PaginationSchema);
      const result = mock.generate();
      
      expect(result).toBeDefined();
      expect(typeof result.page).toBe('number');
      expect(typeof result.limit).toBe('number');
      expect(Number.isInteger(result.page)).toBe(true);
      expect(Number.isInteger(result.limit)).toBe(true);
      expect(result.page).toBeGreaterThan(0);
      expect(result.limit).toBeGreaterThan(0);
      expect(result.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('SortSchema alone', () => {
    it('should generate valid sort schema', () => {
      const mock = new ZodMockSchema(SortSchema);
      const result = mock.generate();
      
      expect(result).toBeDefined();
      expect(result.sort).toBeDefined();
    });
  });

  describe('SearchSchema alone', () => {
    it('should generate valid search schema', () => {
      const mock = new ZodMockSchema(SearchSchema);
      const result = mock.generate();
      
      expect(result).toBeDefined();
      expect(result.search).toBeDefined();
    });
  });

  describe('Intersection: Pagination + Sort', () => {
    it('should generate valid intersection of pagination and sort', () => {
      const schema = PaginationSchema.and(SortSchema);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBeDefined();
      expect(result.page).toBeDefined();
      expect(result.limit).toBeDefined();
      expect(result.sort).toBeDefined();
      expect(Number.isInteger(result.page)).toBe(true);
      expect(Number.isInteger(result.limit)).toBe(true);
    });
  });

  describe('Full Intersection: Pagination + Sort + Search', () => {
    it('should generate valid triple intersection', () => {
      const schema = PaginationSchema.and(SortSchema).and(SearchSchema);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result).toBeDefined();
      expect(result.page).toBeDefined();
      expect(result.limit).toBeDefined();
      expect(result.sort).toBeDefined();
      expect(result.search).toBeDefined();
      
      expect(Number.isInteger(result.page)).toBe(true);
      expect(Number.isInteger(result.limit)).toBe(true);
      expect(result.page).toBeGreaterThan(0);
      expect(result.limit).toBeGreaterThan(0);
      expect(result.limit).toBeLessThanOrEqual(100);
    });

    it('should respect overrides in complex intersection', () => {
      const schema = PaginationSchema.and(SortSchema).and(SearchSchema);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate({
        overrides: {
          page: 5,
          limit: 25
        }
      });
      
      expect(result.page).toBe(5);
      expect(result.limit).toBe(25);
      expect(result.sort).toBeDefined();
      expect(result.search).toBeDefined();
    });

    it('should generate multiple valid items', () => {
      const schema = PaginationSchema.and(SortSchema).and(SearchSchema);
      const mock = new ZodMockSchema(schema);
      const results = mock.generateMany(3);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.page).toBeDefined();
        expect(result.limit).toBeDefined();
        expect(result.sort).toBeDefined();
        expect(result.search).toBeDefined();
        expect(Number.isInteger(result.page)).toBe(true);
        expect(Number.isInteger(result.limit)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle intersection with defaults', () => {
      const schema = z.object({ 
        id: z.string() 
      }).and(PaginationSchema);
      
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();
      
      expect(result.id).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should handle nested transforms in intersection', () => {
      const schema1 = z.object({
        value: z.string()
      }).transform(obj => ({ ...obj, uppercase: obj.value.toUpperCase() }));
      
      const schema2 = z.object({
        count: z.number()
      }).transform(obj => ({ ...obj, doubled: obj.count * 2 }));
      
      const combined = schema1.and(schema2);
      const mock = new ZodMockSchema(combined);
      const result = mock.generate();
      
      expect(result.value).toBeDefined();
      expect(result.uppercase).toBeDefined();
      expect(result.count).toBeDefined();
      expect(result.doubled).toBe(result.count * 2);
    });
  });

  describe('Refine Validation', () => {
    it('should pass refine validation in intersection', () => {
      const schema = PaginationSchema.and(SortSchema);
      const mock = new ZodMockSchema(schema);
      
      expect(() => mock.generate()).not.toThrow();
    });

    it('should validate transformed values through refine', () => {
      const result = new ZodMockSchema(PaginationSchema).generate();
      
      expect(Number.isInteger(result.page)).toBe(true);
      expect(Number.isInteger(result.limit)).toBe(true);
      
      expect(result.page).toBeGreaterThanOrEqual(1);
      expect(result.limit).toBeGreaterThanOrEqual(10);
      expect(result.limit).toBeLessThanOrEqual(100);
    });
  });
});
