# Zod Mock Schema

![npm version](https://img.shields.io/npm/v/@mikemajesty/zod-mock-schema.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![TypeScript Ready](https://img.shields.io/badge/TypeScript-Ready-blue.svg)

A powerful and flexible class‑based utility for generating realistic mock data directly from Zod schemas — ideal for testing, prototyping, fixtures, and CI automation.

## ✨ Features

- ✅ Class-based API for full control and extensibility  
- ✅ Faker.js integration for realistic fake data  
- ✅ Type‑safe overrides with full TypeScript support  
- ✅ Deep Zod schema integration with nested object support  
- ✅ Custom formats: **CPF, CNPJ, RG, CEP, phone BR**  
- ✅ Deterministic generation via Faker seeding  
- ✅ Batch creation with `generateMany`  
- ✅ Smart prefixing for unique, identifiable data  
- ✅ Index‑based generation for sequential data  
- ✅ Flexible field customization  
- ✅ Full Zod schema support (Union, Intersection, Record, Lazy, Pipe, etc.)

---

## 📦 Installation

```bash
# npm
npm install @mikemajesty/zod-mock-schema

# yarn
yarn add @mikemajesty/zod-mock-schema

# pnpm
pnpm add @mikemajesty/zod-mock-schema
```

> **Note:** Zod and Faker are peer dependencies.

---

## 🚀 Quick Start

```ts
import { z } from 'zod';
import { ZodMockSchema } from '@mikemajesty/zod-mock-schema';

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().min(18).max(99),
  isActive: z.boolean(),
  createdAt: z.date(),
});

const userMock = new ZodMockSchema(userSchema);

console.log(userMock.generate());
```

---

## 🔧 Basic Usage

### 1. Simple Mock

```ts
const productSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number().positive(),
  inStock: z.boolean(),
  tags: z.array(z.string()),
});

const productMock = new ZodMockSchema(productSchema);
productMock.generate();
```

### 2. Override Properties

```ts
userMock.generate({
  overrides: {
    name: 'Alice Johnson',
    age: 25,
    email: 'alice@company.com',
    createdAt: new Date('2023-01-01'),
  }
});
```

### 3. Generate Multiple Items

```ts
userMock.generateMany(3, {
  overrides: { department: 'Engineering' }
});
```

---

## 🎯 Smart Prefixing System

### Random Prefix Selection

```ts
userMock.generateMany(5, {
  prefix: {
    options: ['USER', 'CLIENT', 'CUSTOMER', 'MEMBER'],
    for: 'username'
  }
});
```

### Index-Based Prefixing

```ts
userMock.generateMany(3, {
  prefix: {
    options: { useIndex: true },
    for: 'email'
  }
});
```

---

## 🧠 Advanced Zod Schema Support

### Complex Zod Types

```ts
const complexSchema = z.object({
  status: z.union([z.literal('active'), z.literal('inactive'), z.literal('pending')]),
  userWithRole: z.object({ name: z.string() }).and(z.object({ role: z.string() })),
  metadata: z.record(z.string()),
  optionalField: z.string().optional(),
  nullableField: z.string().nullable(),
  tags: z.array(z.string()).min(1).max(5),
  score: z.number().default(0),
  nested: z.lazy(() => complexSchema.optional()),
});

const complexMock = new ZodMockSchema(complexSchema);
complexMock.generate();
```

---

## 🇧🇷 Custom Brazilian Formats

```ts
const brazilSchema = z.object({
  cpf: z.string().meta({ format: 'cpf' }),
  cnpj: z.string().meta({ format: 'cnpj' }),
  rg: z.string().meta({ format: 'rg' }),
  phone: z.string().meta({ format: 'phoneBR' }),
  cep: z.string().meta({ format: 'cep' }),
});

new ZodMockSchema(brazilSchema).generate();
```

---

## 🛒 E-commerce Example

```ts
const orderSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })),
  total: z.number().positive(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered']),
  createdAt: z.date(),
  metadata: z.record(z.any()).optional(),
});

const orderMock = new ZodMockSchema(orderSchema);

orderMock.generateMany(5, {
  overrides: {
    status: 'processing',
    total: 1399.97,
  },
  prefix: {
    options: { useIndex: true },
    for: 'id'
  }
});
```

---

## 🏭 Factory Pattern

```ts
export class UserFactory {
  private mock = new ZodMockSchema(userSchema);

  create(overrides?: Partial<User>) {
    return this.mock.generate({ overrides });
  }

  createMany(count: number, options?: MockManyOptions<User>) {
    return this.mock.generateMany(count, options);
  }

  createAdmins(count: number) {
    return this.mock.generateMany(count, {
      overrides: { role: 'admin' },
      prefix: {
        options: ['ADM', 'ADMIN'],
        for: 'username'
      }
    });
  }
}
```

---

## 🧪 Testing Patterns

### Deterministic Tests

```ts
faker.seed(123);
const user = userMock.generate();
```

### Integration Testing

```ts
describe('User Service', () => {
  const userMock = new ZodMockSchema(userSchema);

  test('should create multiple unique users', () => {
    const users = userMock.generateMany(5, {
      prefix: {
        options: { useIndex: true },
        for: 'email'
      }
    });

    const emails = users.map(u => u.email);
    expect(new Set(emails).size).toBe(5);
  });
});
```

---

## 📘 API Reference

### new ZodMockSchema(schema)

Creates a mock generator for the given Zod schema.

### Methods

#### `generate(options?: MockOptions<T>): T`  
Generates a single mock object.

#### `generateMany(count: number, options?: MockManyOptions<T>): T[]`  
Generates multiple mock objects.

---

## 🔄 Supported Zod Types

✓ String · Number · Boolean · Date · Array  
✓ Object · Union · Intersection · Enum  
✓ Record · Optional · Nullable · Default  
✓ Lazy · Literal · Any · Unknown  
✓ Void · Null · Pipe

---

## 🧹 Best Practices

- Reuse mock instances  
- Use overrides for business rules  
- Centralize factories  
- Use prefixing for unique data  
- Seed Faker for deterministic tests  

---

## 📄 License

MIT © Mike Majesty