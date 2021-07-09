import {
  canHaveLength,
  checkEquality,
  compareNumbers,
  compareValues,
  getIterables,
  hasEntry,
  hasExtraKeys,
  hasValue,
  includesOrEqualsTo,
  isSameType,
  nested,
} from '../src/helpers';

const left = {
  conditions: {
    isNewUser: true,
  },
  data: [],
  hasData: false,
  hobbies: ['games'],
  messages: [
    { id: 1, message: 'hello' },
    { id: 2, message: 'hey' },
    { id: 3, message: 'sup?' },
  ],
  name: '',
  options: {},
  ratio: 0.8,
  retries: 0,
  settings: {
    firstName: 'John',
    lastName: 'Doe',
  },
  status: 'idle',
  version: 1,
};

const right = {
  conditions: {},
  data: [{ a: 1 }],
  hasData: true,
  hobbies: ['games', 'movies'],
  messages: [
    { id: 2, message: 'hey' },
    { id: 3, message: 'sup?' },
  ],
  name: 'John',
  options: {
    ui: {
      color: '#333',
      tags: ['simple', 'clean'],
    },
    updatedAt: 1234567890,
  },
  ratio: 0.4,
  retries: 1,
  settings: {
    firstName: 'John',
    lastName: 'Doe',
    age: 32,
    achievements: ['free-gift'],
  },
  status: 'done',
  version: '1.1',
};

describe('canHaveLength', () => {
  it('should match', () => {
    expect(canHaveLength('0', '')).toBe(true);
    expect(canHaveLength([0], [])).toBe(true);
    expect(canHaveLength({}, { a: 1 })).toBe(true);

    expect(canHaveLength(1, 0)).toBe(false);
    expect(canHaveLength(1, {})).toBe(false);
  });
});

describe('checkEquality', () => {
  it.each([
    // Numbers
    ['ratio', 0.4, true],
    ['retries', 1, true],
    ['retries', '1', false],

    // Objects
    // [{ color: '#333' }, 'options.ui', true],
    ['options', { updatedAt: 1234567890 }, true],
    ['messages', { id: 3, message: 'sup?' }, false],

    // Arrays
    ['data', [{ a: 1 }], true],

    // String
    ['status', 'idle', false],
    ['status', 'done', true],
    ['name', '', false],
    ['name', 'John', true],
  ])('%s with %p should be %p', (key, value, expected) => {
    // @ts-ignore
    expect(checkEquality(left[key], right[key], value)).toBe(expected);
  });

  it('should return false if input are not the same type', () => {
    expect(checkEquality(left.data, right.settings, 0.8)).toBe(false);
  });

  it('should return true if the left side is undefined', () => {
    // @ts-ignore
    expect(checkEquality(undefined, right.settings, 0.8)).toBe(false);
  });
});

describe('compareNumbers', () => {
  describe('increased', () => {
    it.each([
      ['retries', true, 'retries', undefined, undefined],
      ['data', false, 'data', undefined, undefined],
      ['options', false, 'options', undefined, undefined],
      ['ratio', false, 'ratio', undefined, undefined],
      ['status', false, 'stats', undefined, undefined],
      ['retries with 1', true, 'retries', 1, undefined],
      ['retries with 0.9', false, 'retries', 0.9, undefined],
      ['retries with 10', false, 'retries', 10, undefined],
      ['retries with 1 and 0', true, 'retries', 1, 0],
      ['retries with 1 and 0.1', false, 'retries', 1, 0.1],
      ['retries with 1 and 10', false, 'retries', 1, 10],
    ])('%p should be %p', (_, expected, key, actual, previous) => {
      expect(compareNumbers(left, right, { key, actual, previous, type: 'increased' })).toBe(
        expected,
      );
    });
  });

  describe('decreased', () => {
    it.each([
      ['ratio', true, 'ratio', undefined, undefined],
      ['data', false, 'data', undefined, undefined],
      ['options', false, 'options', undefined, undefined],
      ['retries', false, 'retries', undefined, undefined],
      ['stats', false, 'stats', undefined, undefined],
      ['ratio with 0.4', true, 'ratio', 0.4, undefined],
      ['ratio with 0.9', false, 'ratio', 0.9, undefined],
      ['ratio with 10', false, 'ratio', 10, undefined],
      ['ratio with 0.4 and 0.8', true, 'ratio', 0.4, 0.8],
      ['ratio with 0.4 and 0.1', false, 'ratio', 0.4, 0.1],
      ['ratio with 0.4 and 10', false, 'ratio', 0.4, 10],
    ])('%p', (_, expected, key, actual, previous) => {
      expect(compareNumbers(left, right, { key, actual, previous, type: 'decreased' })).toBe(
        expected,
      );
    });
  });
});

describe('compareValues', () => {
  describe('added', () => {
    it.each([
      ['data', true, 'data', undefined],
      ['data with { a: 1 }', true, 'data', { a: 1 }],
      ['data with [{ a: 1 }]', true, 'data', [{ a: 1 }]],
      ['data with { b: 2 }', false, 'data', { b: 2 }],
      ['hobbies with movies', true, 'hobbies', 'movies'],
      ['hobbies with cooking', false, 'hobbies', 'cooking'],
      ['messages', false, 'messages', undefined],
      ['ratio', false, 'ratio', undefined],
      ['settings', true, 'settings', undefined],
      ['settings with { age: 32 }', true, 'settings', { age: 32 }],
      ['settings with ["free-gift"]', true, 'settings', ['free-gift']],
    ])('%p should be %p', (_, expected, key, value) => {
      expect(compareValues(left, right, { key, type: 'added', value })).toBe(expected);
    });
  });

  describe('removed', () => {
    it.each([
      ['conditions', true, 'conditions', undefined],
      [
        'conditions with value',
        true,
        'conditions',
        {
          isNewUser: true,
        },
      ],
      [
        'conditions with unknown value',
        false,
        'conditions',
        {
          isOldUser: true,
        },
      ],
      ['data', false, 'data', undefined],
      ['hobbies', false, 'hobbies', undefined],
      ['messages', true, 'messages', undefined],
      ['messages', true, 'messages', { id: 1, message: 'hello' }],
      ['ratio', false, 'ratio', undefined],
      ['settings', false, 'settings', undefined],
    ])('%p should be %p', (_, expected, key, value) => {
      expect(compareValues(left, right, { key, type: 'removed', value })).toBe(expected);
    });
  });
});

describe('getIterables', () => {
  it('should get iterables', () => {
    expect(getIterables(left, right, { key: 'data' })).toMatchSnapshot();
    expect(getIterables(left, right, { key: 'options' })).toMatchSnapshot();
    expect(getIterables(left, right, { key: 'status' })).toMatchSnapshot();
  });

  it('should throw for invalid types', () => {
    // @ts-ignore
    expect(() => getIterables(left.version, right.version, { key: 'version' })).toThrow(
      'Inputs have different types',
    );

    // @ts-ignore
    expect(() => getIterables(left.ratio, right.ratio)).toThrow("Inputs don't have length");
  });
});

describe('hasEntry', () => {
  it('should match', () => {
    expect(Object.entries(left.messages).some(hasEntry({ id: 1, message: 'hello' }))).toBe(true);
    expect(Object.entries(left.messages).some(hasEntry([{ id: 1, message: 'hello' }]))).toBe(true);
    expect(Object.entries(left.hobbies).some(hasEntry('games'))).toBe(true);
    expect(Object.entries(right.hobbies).some(hasEntry(['movies']))).toBe(true);

    expect(Object.entries(left.hobbies).some(hasEntry(['movies']))).toBe(false);
    expect(Object.entries(left.messages).some(hasEntry({ id: 1, message: 'hey' }))).toBe(false);
    expect(Object.entries(left.messages).some(hasEntry({ id: 1, message: 'hey' }))).toBe(false);
  });
});

describe('hasExtraKeys', () => {
  it('should match', () => {
    expect(hasExtraKeys(Object.keys(left.settings), Object.keys(right.settings))).toBe(true);
    expect(hasExtraKeys(Object.keys(right.settings), Object.keys(left.settings))).toBe(false);
  });
});

describe('hasValue', () => {
  it('should match', () => {
    expect(left.messages.some(hasValue({ id: 1, message: 'hello' }))).toBe(true);
    expect(left.messages.some(hasValue({ id: 1, message: 'hey' }))).toBe(false);
  });
});

describe('includesOrEqualsTo', () => {
  it('should match', () => {
    expect(
      includesOrEqualsTo(
        {
          firstName: 'John',
          lastName: 'Doe',
        },
        left.settings,
      ),
    ).toBe(true);
    expect(includesOrEqualsTo([[{ a: 1 }]], right.data)).toBe(true);
    expect(includesOrEqualsTo(0.8, left.ratio)).toBe(true);

    expect(includesOrEqualsTo(0.4, left.ratio)).toBe(false);
    expect(includesOrEqualsTo([{ id: 1, message: 'hello' }], left.messages)).toBe(false);
  });
});

describe('isSameType', () => {
  it('should compare types', () => {
    expect(isSameType('0', '1')).toBe(true);
    expect(isSameType([1], [])).toBe(true);
    expect(isSameType({}, { a: 1 })).toBe(true);
    expect(isSameType(0, 1)).toBe(true);

    expect(isSameType('0', [])).toBe(false);
    expect(isSameType({}, [])).toBe(false);
    expect(isSameType(1, {})).toBe(false);
    expect(isSameType('0', 1)).toBe(false);
  });
});

describe('nested', () => {
  it('should get the correct data', () => {
    expect(nested(right, 'status')).toBe('done');
    expect(nested(right, 'options.ui')).toEqual({ color: '#333', tags: ['simple', 'clean'] });
    expect(nested(right, 'options.ui.tags.0')).toBe('simple');
    expect(nested(right.options.ui.tags, 1)).toBe('clean');
    expect(nested(right, 'options.updatedAt')).toBe(1234567890);

    expect(nested(right.options.ui.tags)).toEqual(['simple', 'clean']);

    // @ts-ignore
    expect(nested(right.status, 1)).toBe('done');
  });
});
