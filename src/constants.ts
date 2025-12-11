export class Constants {
  // Type identifiers
  static readonly TYPE_STRING = 'string';
  static readonly TYPE_NUMBER = 'number';
  static readonly TYPE_OBJECT = 'object';
  static readonly TYPE_FUNCTION = 'function';

  // Default size constraints for collections
  static readonly DEFAULT_SET_MIN_SIZE = 1;
  static readonly DEFAULT_SET_MAX_SIZE = 5;
  static readonly DEFAULT_MAP_SIZE = 2;
  static readonly DEFAULT_ARRAY_MIN_LENGTH = 1;
  static readonly DEFAULT_ARRAY_MAX_LENGTH = 1;
  static readonly DEFAULT_RECORD_MIN_PROPERTIES = 1;
  static readonly DEFAULT_RECORD_MAX_PROPERTIES = 3;

  // Default numeric constraints
  static readonly DEFAULT_BIGINT_MIN = BigInt(1);
  static readonly DEFAULT_BIGINT_MAX = BigInt(1000);
  static readonly DEFAULT_INT_MIN = 1;
  static readonly DEFAULT_INT_MAX = 1000;
  static readonly DEFAULT_FLOAT_MIN = 0;
  static readonly DEFAULT_FLOAT_MAX = 100;

  // Default string constraints
  static readonly DEFAULT_STRING_MIN_LENGTH = 5;
  static readonly DEFAULT_STRING_MAX_LENGTH = 20;

  // Default tuple constraints
  static readonly DEFAULT_TUPLE_REST_MIN = 0;
  static readonly DEFAULT_TUPLE_REST_MAX = 2;

  // Default constraints for Any type generation
  static readonly DEFAULT_ANY_WORDS_COUNT = 2;
  static readonly DEFAULT_ANY_NUMBER_MAX = 100;
  static readonly DEFAULT_ANY_ARRAY_LENGTH = 2;

  // Brazilian format mock data
  static readonly BRAZILIAN_MOCK_DATA = {
    cpf: [
      "12345678909",
      "52998224725",
      "11144477735",
      "86473782905",
      "40723177808"
    ],
    cnpj: [
      "11222333000181",
      "60676960000106",
      "06990590000123",
      "33112511000130",
      "00111222000189"
    ],
    rg: [
      "238192611",
      "110209394",
      "202455518",
      "437062053",
      "207022689"
    ],
    phoneBR: [
      "11987654321",
      "21998765432",
      "31991234567",
      "41992345678",
      "51993456789"
    ],
    cep: [
      "01001000",
      "20040010",
      "30130010",
      "80010000",
      "90010000"
    ]
  } as const;

  // Format identifiers for schema validation
  static readonly FORMAT_CPF = 'cpf';
  static readonly FORMAT_CNPJ = 'cnpj';
  static readonly FORMAT_RG = 'rg';
  static readonly FORMAT_PHONE_BR = 'phoneBR';
  static readonly FORMAT_CEP = 'cep';
  static readonly FORMAT_EMAIL = 'email';
  static readonly FORMAT_REGEX = 'regex';
  static readonly FORMAT_URL = 'url';
  static readonly FORMAT_UUID = 'uuid';
  static readonly FORMAT_ULID = 'ulid';

  // Float format identifiers
  static readonly FLOAT_FORMATS = [
    'float',
    'double',
    'decimal',
    'float32',
    'float64'
  ] as const;

  // Zod effect type identifiers
  static readonly EFFECT_TYPE_TRANSFORM = 'transform';

  // Zod type name identifiers
  static readonly ZOD_TYPE_EFFECTS = 'ZodEffects';
}

