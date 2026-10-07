import { z } from 'zod';
import { ZodMockSchema } from '../zod-mock-schema.js';

describe('Factory', () => {
  const schema = z.object({
    id: z.uuid(),
    name: z.string()
  });

  class User {
    constructor(
      readonly id: string,
      readonly name: string
    ) {}

    get displayName(): string {
      return this.name.toUpperCase();
    }
  }

  it('should return the factory result after schema validation', () => {
    const mock = new ZodMockSchema(schema);
    const user: User = mock.generate({
      overrides: { name: 'Mike' },
      factory: data => new User(data.id, data.name)
    });

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe('Mike');
    expect(user.displayName).toBe('MIKE');
  });

  it('should apply the factory to every generated item', () => {
    const mock = new ZodMockSchema(schema);
    const users: User[] = mock.generateMany(3, {
      factory: data => new User(data.id, data.name)
    });

    expect(users).toHaveLength(3);
    users.forEach(user => expect(user).toBeInstanceOf(User));
  });

  it('should preserve the current return type without a factory', () => {
    const mock = new ZodMockSchema(schema);
    const user: z.infer<typeof schema> = mock.generate({
      overrides: { name: 'Mike' }
    });

    expect(user).not.toBeInstanceOf(User);
    expect(user.name).toBe('Mike');
  });
});
