import { ZodMockSchema } from '../zod-mock-schema.js';
import z from 'zod';


const Identifiable = z.object({
  id: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable(),
  version: z.number().int().positive().default(1),
});

const Auditable = z.object({
  createdBy: z.uuid(),
  updatedBy: z.uuid().optional(),
  deletedBy: z.uuid().optional().nullable(),
  auditLog: z.array(
    z.object({
      timestamp: z.date(),
      action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'RESTORE']),
      userId: z.uuid(),
      changes: z.record(z.string(), z.any()).optional(),
    })
  ).max(100).optional(),
});

const ContactInfo = z.object({
  email: z.email(),
  phone: z.string().regex(/^\d{10,11}$/),
  alternativePhone: z.string().regex(/^\d{10,11}$/).optional(),
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.enum(['parent', 'spouse', 'child', 'sibling', 'friend', 'other']),
    phone: z.string().regex(/^\d{10,11}$/),
    priority: z.number().min(1).max(3),
  }).optional(),
});

const Address = z.object({
  street: z.string().min(3),
  number: z.string(),
  complement: z.string().optional(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string().length(2).regex(/^[A-Z]{2}$/),
  cep: z.string().regex(/^\d{8}$/),
  country: z.string().default('BR'),
  isPrimary: z.boolean().default(true),
  type: z.enum(['home', 'work', 'billing', 'shipping']),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

const Geolocatable = z.object({
  addresses: z.array(Address).min(1).max(5),
  timezone: z.string().optional(),
  locale: z.string().default('pt-BR'),
});

// Schemas financeiros complexos
const BankAccount = z.object({
  bankCode: z.string().regex(/^\d{3}$/),
  agency: z.string().regex(/^\d{4,5}$/),
  account: z.string().regex(/^\d{6,12}$/),
  digit: z.string().regex(/^[0-9X]$/),
  type: z.enum(['checking', 'savings', 'salary', 'payment']),
  isPrimary: z.boolean(),
  verifiedAt: z.date().optional(),
});

const FinancialInfo = z.object({
  bankAccounts: z.array(BankAccount).max(3),
  creditScore: z.number().min(0).max(1000).optional(),
  incomeRange: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
  taxId: z.string().regex(/^\d{11}$|^\d{14}$/).optional(),
  paymentMethods: z.array(
    z.enum(['credit_card', 'debit_card', 'pix', 'boleto', 'bank_transfer'])
  ).min(1),
});

const Course = z.object({
  id: z.string().regex(/^CRS\d{8}$/),
  name: z.string(),
  code: z.string().regex(/^[A-Z]{3}\d{3}$/),
  credits: z.number().int().min(1).max(12),
  professorId: z.uuid().optional(),
  schedule: z.object({
    days: z.array(
      z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])
    ).min(1).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    room: z.string().optional(),
  }),
  status: z.enum(['active', 'inactive', 'completed', 'cancelled']),
});

const AcademicRecord = z.object({
  enrollmentId: z.string().regex(/^ENR\d{10}$/),
  semester: z.string().regex(/^\d{4}\.[12]$/),
  gpa: z.number().min(0).max(10).optional(),
  totalCredits: z.number().int().min(0),
  courses: z.array(
    z.object({
      course: Course,
      grade: z.number().min(0).max(10).optional(),
      status: z.enum(['enrolled', 'approved', 'failed', 'dropped']),
      attendance: z.number().min(0).max(100).optional(),
    })
  ).max(10),
});

const StudentRole = z.object({
  type: z.literal('student'),
  studentId: z.string().regex(/^STU\d{8}$/),
  enrollmentDate: z.date(),
  graduationDate: z.date().optional(),
  academicRecord: AcademicRecord,
  scholarships: z.array(
    z.object({
      id: z.string().regex(/^SCH\d{6}$/),
      type: z.enum(['merit', 'need', 'athletic', 'research']),
      amount: z.number().positive(),
      startDate: z.date(),
      endDate: z.date(),
      renewable: z.boolean(),
    })
  ).max(3).optional(),
  campus: z.enum(['main', 'north', 'south', 'online']),
});

const TeacherRole = z.object({
  type: z.literal('teacher'),
  employeeId: z.string().regex(/^TCH\d{8}$/),
  hireDate: z.date(),
  department: z.enum([
    'computer_science', 'mathematics', 'physics', 'chemistry',
    'biology', 'engineering', 'business', 'arts', 'law', 'medicine'
  ]),
  title: z.enum(['assistant', 'associate', 'full', 'adjunct', 'visiting']),
  salary: z.object({
    base: z.number().positive(),
    currency: z.string().default('BRL'),
    paymentSchedule: z.enum(['monthly', 'biweekly', 'weekly']),
    benefits: z.array(
      z.enum(['health', 'dental', 'vision', 'retirement', 'tuition'])
    ).optional(),
  }),
  officeHours: z.array(
    z.object({
      day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
      location: z.string(),
      mode: z.enum(['in_person', 'virtual', 'hybrid']),
    })
  ).max(5).optional(),
  coursesTeaching: z.array(
    z.object({
      course: Course,
      semester: z.string().regex(/^\d{4}\.[12]$/),
      section: z.string().regex(/^[A-Z]$/),
    })
  ).max(4),
});

const AdminRole = z.object({
  type: z.literal('admin'),
  employeeId: z.string().regex(/^ADM\d{8}$/),
  hireDate: z.date(),
  department: z.enum([
    'human_resources', 'information_technology', 'finance',
    'operations', 'admissions', 'student_affairs', 'facilities'
  ]),
  level: z.number().min(1).max(10),
  permissions: z.array(
    z.object({
      resource: z.enum([
        'users', 'courses', 'enrollments', 'grades', 'payments',
        'reports', 'settings', 'audit_logs', 'notifications'
      ]),
      actions: z.array(
        z.enum(['read', 'create', 'update', 'delete', 'approve', 'export'])
      ).min(1),
      scope: z.enum(['global', 'department', 'personal']),
    })
  ).min(1),
  reportsTo: z.uuid().optional(),
  managedDepartments: z.array(z.string()).optional(),
});

const StaffRole = z.object({
  type: z.literal('staff'),
  employeeId: z.string().regex(/^STF\d{8}$/),
  hireDate: z.date(),
  position: z.enum([
    'librarian', 'technician', 'counselor', 'coordinator',
    'assistant', 'specialist', 'analyst', 'supervisor'
  ]),
  department: z.string(),
  schedule: z.object({
    workHours: z.number().min(20).max(60),
    shift: z.enum(['morning', 'afternoon', 'night', 'flexible']),
    remoteDays: z.array(
      z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
    ).max(3).optional(),
  }),
});

const PersonRole = z.discriminatedUnion('type', [
  StudentRole,
  TeacherRole,
  AdminRole,
  StaffRole,
]);

const IdentityDocument = z.object({
  type: z.literal('id_card'),
  number: z.string().regex(/^[A-Z0-9]{5,20}$/),
  issuingAuthority: z.string(),
  issueDate: z.date(),
  expiryDate: z.date().optional(),
  photoUrl: z.url().optional(),
  verified: z.boolean().default(false),
});

const PassportDocument = z.object({
  type: z.literal('passport'),
  number: z.string().regex(/^[A-Z0-9]{8,12}$/),
  country: z.string().length(3),
  nationality: z.string(),
  issueDate: z.date(),
  expiryDate: z.date(),
  visaInfo: z.array(
    z.object({
      country: z.string().length(3),
      type: z.string(),
      issueDate: z.date(),
      expiryDate: z.date(),
    })
  ).max(5).optional(),
});

const ProfessionalDocument = z.object({
  type: z.literal('professional'),
  number: z.string().regex(/^[A-Z0-9]{5,15}$/),
  category: z.string(),
  council: z.string(),
  state: z.string().length(2),
  validity: z.date(),
});

const Documents = z.array(
  z.union([IdentityDocument, PassportDocument, ProfessionalDocument])
).max(5).optional();

const HealthInfo = z.object({
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.array(z.string()).max(20).optional(),
  medications: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      prescribedBy: z.string().optional(),
    })
  ).max(10).optional(),
  disabilities: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      accommodations: z.array(z.string()).optional(),
    })
  ).max(5).optional(),
  emergencyMedicalContacts: z.array(
    z.object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string().regex(/^\d{10,11}$/),
      priority: z.number().min(1).max(3),
    })
  ).max(3).optional(),
});

const Preferences = z.object({
  notification: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
    digest: z.enum(['daily', 'weekly', 'monthly', 'never']).default('weekly'),
  }),
  privacy: z.object({
    profileVisible: z.boolean().default(true),
    searchable: z.boolean().default(true),
    showEmail: z.boolean().default(false),
    showPhone: z.boolean().default(false),
    dataSharing: z.enum(['none', 'essential', 'all']).default('essential'),
  }),
  language: z.string().default('pt-BR'),
  timeFormat: z.enum(['12h', '24h']).default('24h'),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
});

const StatusHistory = z.array(
  z.object({
    status: z.enum(['active', 'inactive', 'pending', 'suspended', 'graduated', 'terminated']),
    effectiveDate: z.date(),
    reason: z.string().optional(),
    changedBy: z.uuid().optional(),
  })
).min(1);

const StudentMetadata = z.object({
  advisorId: z.uuid().optional(),
  thesisTitle: z.string().optional(),
  researchArea: z.string().optional(),
  publications: z.array(
    z.object({
      title: z.string(),
      year: z.number().int().min(2000).max(2030),
      venue: z.string().optional(),
    })
  ).max(20).optional(),
});

const TeacherMetadata = z.object({
  researchInterests: z.array(z.string()).max(10).optional(),
  publicationsCount: z.number().int().min(0),
  grants: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      fundingAgency: z.string(),
      amount: z.number().positive(),
      period: z.string(),
    })
  ).max(10).optional(),
  officeLocation: z.string(),
});

const AdminMetadata = z.object({
  budgetResponsibility: z.number().positive().optional(),
  teamSize: z.number().int().min(0),
  projects: z.array(
    z.object({
      name: z.string(),
      status: z.enum(['planning', 'active', 'completed', 'cancelled']),
      deadline: z.date().optional(),
    })
  ).max(10).optional(),
});

const Metadata = z.union([
  StudentMetadata,
  TeacherMetadata,
  AdminMetadata,
]);

export const PersonEntitySchema = z.object({
  name: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    middleName: z.string().optional(),
    preferredName: z.string().optional(),
    title: z.enum(['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.']).optional(),
  }),

  demographic: z.object({
    birthDate: z.date(),
    age: z.number().int().min(0).max(120),
    gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']),
    nationality: z.string(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  }),

  officialDocuments: z.object({
    cpf: z.string().regex(/^\d{11}$/),
    rg: z.string().regex(/^\d{7,9}$/),
    pis: z.string().regex(/^\d{11}$/).optional(),
    voterId: z.string().regex(/^\d{12}$/).optional(),
  }),

  role: PersonRole,
  status: z.enum(['active', 'inactive', 'pending', 'suspended', 'graduated', 'terminated']),
  statusHistory: StatusHistory,

  emergencyContacts: z.array(
    z.object({
      name: z.string(),
      phone: z.string().regex(/^\d{10,11}$/),
      relationship: z.enum(['parent', 'spouse', 'child', 'sibling', 'friend', 'other']),
      priority: z.number().min(1).max(3),
      availableHours: z.string().optional(),
    })
  ).min(1).max(5),

  documents: Documents,

  contactInfo: ContactInfo,
  addresses: z.array(Address).min(1).max(3),
  financialInfo: FinancialInfo.optional(),
  healthInfo: HealthInfo.optional(),
  preferences: Preferences,

  roleSpecificMetadata: Metadata.optional(),

  academicHistory: z.array(AcademicRecord).max(10).optional(),

  system: z.object({
    isVerified: z.boolean().default(false),
    verificationLevel: z.number().min(0).max(3).default(0),
    lastLogin: z.date().optional(),
    loginCount: z.number().int().min(0).default(0),
    tags: z.array(z.string()).max(20).optional(),
    flags: z.array(
      z.enum(['high_value', 'at_risk', 'vip', 'fraud_risk', 'legacy'])
    ).optional(),
  }),
}).and(Identifiable).and(Auditable);

describe('PersonEntity with Complex Schema', () => {
  const entityMock = new ZodMockSchema(PersonEntitySchema);

  test('should generate complex mock data', () => {
    const mock = entityMock.generate();

    expect(mock).toBeDefined();
    expect(mock.role).toBeDefined();
    expect(mock.statusHistory).toBeDefined();
    expect(mock.addresses.length).toBeGreaterThan(0);
  });
});

describe('New Zod Types Support', () => {
  describe('ZodSet', () => {
    test('should generate a Set with elements', () => {
      const schema = z.set(z.string());
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBeGreaterThan(0);
    });

    test('should respect min/max size constraints', () => {
      const schema = z.set(z.number()).min(2).max(5);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBeGreaterThanOrEqual(2);
      expect(result.size).toBeLessThanOrEqual(5);
    });
  });

  describe('ZodMap', () => {
    test('should generate a Map with entries', () => {
      const schema = z.map(z.string(), z.number());
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('ZodTuple', () => {
    test('should generate a tuple with correct types', () => {
      const schema = z.tuple([z.string(), z.number(), z.boolean()]);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(typeof result[0]).toBe('string');
      expect(typeof result[1]).toBe('number');
      expect(typeof result[2]).toBe('boolean');
    });

    test('should generate tuple with rest elements', () => {
      const schema = z.tuple([z.string()]).rest(z.number());
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(typeof result[0]).toBe('string');
    });
  });

  describe('ZodFunction', () => {
    test('should generate a function that returns mocked value', () => {
      const schema = z.function();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate() as () => any;

      expect(typeof result).toBe('function');
      expect(result).toBeDefined();
    });
  });

  describe('ZodDiscriminatedUnion', () => {
    test('should generate one of the union options', () => {
      const schema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('a'), value: z.string() }),
        z.object({ type: z.literal('b'), value: z.number() }),
      ]);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(result).toBeDefined();
      expect(['a', 'b']).toContain(result.type);
    });
  });

  describe('ZodBigInt', () => {
    test('should generate a BigInt', () => {
      const schema = z.bigint();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(typeof result).toBe('bigint');
      expect(result).toBeGreaterThan(BigInt(0));
    });
  });

  describe('ZodNaN', () => {
    test('should generate NaN', () => {
      const schema = z.nan();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(Number.isNaN(result)).toBe(true);
    });
  });

  describe('ZodReadonly', () => {
    test('should generate readonly object', () => {
      const schema = z.object({ name: z.string() }).readonly();
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(result).toBeDefined();
      expect(typeof result.name).toBe('string');
    });
  });
});

describe('Improved Constraints', () => {
  describe('String min/max', () => {
    test('should respect min length', () => {
      const schema = z.string().min(10);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(result.length).toBeGreaterThanOrEqual(10);
    });

    test('should respect max length', () => {
      const schema = z.string().max(5);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(result.length).toBeLessThanOrEqual(5);
    });

    test('should respect both min and max', () => {
      const schema = z.string().min(5).max(10);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(result.length).toBeGreaterThanOrEqual(5);
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Date min/max', () => {
    test('should respect date range', () => {
      const minDate = new Date('2025-01-01');
      const maxDate = new Date('2025-12-31');
      const schema = z.date().min(minDate).max(maxDate);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThanOrEqual(minDate.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(maxDate.getTime());
    });
  });

  describe('ZodDefault always uses default value', () => {
    test('should always return the default value', () => {
      const schema = z.string().default('DEFAULT_VALUE');
      const mock = new ZodMockSchema(schema);
      
      // Generate multiple times, should always be the default
      const results = Array.from({ length: 10 }, () => mock.generate());
      
      expect(results.every(r => r === 'DEFAULT_VALUE')).toBe(true);
    });

    test('should work with default numbers', () => {
      const schema = z.number().default(42);
      const mock = new ZodMockSchema(schema);
      const result = mock.generate();

      expect(result).toBe(42);
    });
  });
});

describe('Seed Support', () => {
  test('should generate same data with same seed', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.email(),
    });

    const mock1 = new ZodMockSchema(schema).seed(12345);
    const result1 = mock1.generate();

    const mock2 = new ZodMockSchema(schema).seed(12345);
    const result2 = mock2.generate();

    expect(result1).toEqual(result2);
  });

  test('should generate different data with different seeds', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const mock1 = new ZodMockSchema(schema).seed(111);
    const result1 = mock1.generate();

    const mock2 = new ZodMockSchema(schema).seed(222);
    const result2 = mock2.generate();

    expect(result1).not.toEqual(result2);
  });

  test('should support array seed', () => {
    const schema = z.string();
    const mock = new ZodMockSchema(schema).seed([1, 2, 3]);
    const result = mock.generate();

    expect(typeof result).toBe('string');
  });
});