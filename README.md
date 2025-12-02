# Zod Mock Schema

![npm
version](https://img.shields.io/npm/v/@mikemajesty/zod-mock-schema.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![TypeScript
Ready](https://img.shields.io/badge/TypeScript-Ready-blue.svg)

A powerful and flexible **class‑based utility** for generating realistic
mock data directly from **Zod schemas** --- ideal for testing,
prototyping, fixtures, and CI automation.

------------------------------------------------------------------------

## ✨ Features

-   ✅ **Class-based API** for full control and extensibility\
-   ✅ **Faker.js integration**\
-   ✅ **Type‑safe overrides**\
-   ✅ **Deep Zod schema integration**\
-   ✅ **Custom formats**: CPF, CNPJ, RG, CEP, phone BR\
-   ✅ **Deterministic generation** via Faker seeding\
-   ✅ **Batch creation** with `createMany`

------------------------------------------------------------------------

## 📦 Installation

``` bash
# npm
npm install @mikemajesty/zod-mock-schema zod @faker-js/faker

# yarn
yarn add @mikemajesty/zod-mock-schema zod @faker-js/faker

# pnpm
pnpm add @mikemajesty/zod-mock-schema zod @faker-js/faker
```

> **Note:** Zod and Faker are peer dependencies.

------------------------------------------------------------------------

## 🚀 Quick Start

``` ts
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

------------------------------------------------------------------------

## 🔧 Basic Usage

### 1. Simple Mock

``` ts
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

### 2. Override Any Property

``` ts
userMock.generate({
  name: 'Alice Johnson',
  age: 25,
  email: 'alice@company.com',
  createdAt: new Date('2023-01-01'),
});
```

### 3. Generate Multiple Items

``` ts
userMock.createMany(3, {
  department: 'Engineering',
});
```

------------------------------------------------------------------------

## 🧠 Advanced Usage

### Nested Overrides

``` ts
companyMock.generate({
  name: 'Tech Innovations',
  address: {
    city: 'San Francisco'
  },
});
```

### Using Faker Directly

``` ts
userMock.generate({
  name: userMock.faker.person.fullName(),
  profile: {
    bio: userMock.faker.lorem.paragraph(),
  },
});
```

### Custom Formats

``` ts
const brazilSchema = z.object({
  cpf: z.string().meta({ format: 'cpf' }),
  cep: z.string().meta({ format: 'cep' }),
});
```

------------------------------------------------------------------------

## 🛒 Complex Example (E-commerce)

``` ts
const orderMock = new ZodMockSchema(orderSchema);

orderMock.generate({
  status: 'processing',
  total: 1399.97,
});
```

------------------------------------------------------------------------

## 🧪 Testing Patterns

### Factory Pattern

``` ts
export class UserFactory {
  private mock = new ZodMockSchema(userSchema);

  create(overrides) {
    return this.mock.generate(overrides);
  }

  createMany(n, overrides) {
    return this.mock.createMany(n, overrides);
  }
}
```

### Deterministic Tests

``` ts
faker.seed(123);
```

------------------------------------------------------------------------

## 📘 API Reference

### `new ZodMockSchema(schema)`

### **Methods**

#### `generate(overrides?)`

Generate one typed mock object.

#### `createMany(count, overrides?)`

Generate an array of typed mocks.

------------------------------------------------------------------------

## 🧹 Best Practices

-   Reuse mock instances for performance\
-   Use overrides for business‑specific scenarios\
-   Centralize factories for cleaner tests

------------------------------------------------------------------------

## 📄 License

MIT © Mike Majesty

------------------------------------------------------------------------

If this library helps you --- ⭐ **give it a star on GitHub!**