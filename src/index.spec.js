import treeChanges from './index';

describe('tree-changes', () => {
  const A = {
    data: { a: 1 },
    hasData: false,
    items: [{ name: 'test' }],
    nested: {
      status: 'running',
    },
    ratio: 0.45,
    retries: 0,
    status: 'idle',
    stuff: [],
    switch: false,
  };

  const B = {
    data: { a: 1 },
    hasData: true,
    items: [],
    nested: {
      status: 'loaded',
    },
    ratio: 0.4,
    retries: 1,
    status: 'done',
    stuff: [],
  };

  describe('exports', () => {
    it('should export a function', () => {
      expect(typeof treeChanges).toBe('function');
    });

    it('should throw an error without parameters', () => {
      expect(() => treeChanges()).toThrowError('Missing required parameters');
      expect(() => treeChanges(A)).toThrowError('Missing required parameters');
    });

    it('should return all methods', () => {
      const { changed, changedFrom, changedTo, increased, decreased } = treeChanges(A, B);

      expect(typeof changed).toBe('function');
      expect(typeof changedFrom).toBe('function');
      expect(typeof changedTo).toBe('function');
      expect(typeof increased).toBe('function');
      expect(typeof decreased).toBe('function');
    });
  });

  describe('changed', () => {
    it('should identify changes in arrays', () => {
      expect(treeChanges(A.items, B.items).changed()).toBe(true);
      expect(treeChanges(A.stuff, B.stuff).changed()).toBe(false);
    });

    it('should identify changes in objects', () => {
      const { changed } = treeChanges(A, B);

      expect(changed()).toBe(true);
      expect(changed('status')).toBe(true);
      expect(changed('hasData')).toBe(true);
      expect(changed('data')).toBe(false);
      expect(changed('items')).toBe(true);
      expect(changed('nested')).toBe(true);
      expect(changed('nested.status')).toBe(true);
      expect(changed('nested.missing')).toBe(false);
      expect(changed('switch')).toBe(true);
    });
  });

  describe('changedFrom', () => {
    const { changedFrom } = treeChanges(A, B);

    it('should throw an error without `key` parameter', () => {
      expect(() => changedFrom()).toThrowError('Key parameter is required');
    });

    it('should identify changes', () => {
      expect(changedFrom('status')).toBe(false);
      expect(changedFrom('status', 'idle')).toBe(true);
      expect(changedFrom('status', 'idle', 'done')).toBe(true);
      expect(changedFrom('status', ['ready', 'running'], 'done')).toBe(false);
      expect(changedFrom('status', 'idle', ['error', 'ready'])).toBe(false);

      expect(changedFrom('hasData', false)).toBe(true);
      expect(changedFrom('hasData', false, true)).toBe(true);
      expect(changedFrom('hasData', true, false)).toBe(false);

      expect(changedFrom('data', { a: 1 }, {})).toBe(false);
      expect(changedFrom('data', { a: 1 }, true)).toBe(false);
      expect(changedFrom('data', 'a', { a: 1 })).toBe(false);

      expect(changedFrom('nested.status', 'running')).toBe(true);
      expect(changedFrom('nested.status', 'running', 'loaded')).toBe(true);

      expect(changedFrom('switch', false, undefined)).toBe(true);
      expect(changedFrom('switch', false)).toBe(true);
    });
  });

  describe('changedTo', () => {
    const { changedTo } = treeChanges(A, B);

    it('should throw an error without `key` parameter', () => {
      expect(() => changedTo()).toThrowError('Key parameter is required');
    });

    it('should identify changes', () => {
      expect(changedTo('status')).toBe(false);

      expect(changedTo('status', 'idle')).toBe(false);
      expect(changedTo('status', ['ready', 'done'])).toBe(true);

      expect(changedTo('hasData', false)).toBe(false);
      expect(changedTo('hasData', true)).toBe(true);

      expect(changedTo('data', { a: 1 })).toBe(false);
      expect(changedTo('data', '')).toBe(false);

      expect(changedTo('nested.status', 'running')).toBe(false);
      expect(changedTo('nested.status', 'loaded')).toBe(true);

      expect(changedTo('retries', 1)).toBe(true);
    });
  });

  describe('increased', () => {
    const { increased } = treeChanges(A, B);

    it('should throw an error without `key` parameter', () => {
      expect(() => increased()).toThrowError('Key parameter is required');
    });

    it('should identify changes', () => {
      expect(increased('status')).toBe(false);
      expect(increased('hasData')).toBe(false);
      expect(increased('data')).toBe(false);
      expect(increased('ratio')).toBe(false);
      expect(increased('retries')).toBe(true);
    });
  });

  describe('decreased', () => {
    const { decreased } = treeChanges(A, B);

    it('should throw an error without `key` parameter', () => {
      expect(() => decreased()).toThrowError('Key parameter is required');
    });

    it('should identify changes', () => {
      expect(decreased('status')).toBe(false);
      expect(decreased('hasData')).toBe(false);
      expect(decreased('data')).toBe(false);
      expect(decreased('ratio')).toBe(true);
      expect(decreased('retries')).toBe(false);
    });
  });
});
