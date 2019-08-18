import treeChanges from '../src';

describe('tree-changes', () => {
  const A = {
    data: { a: 1 },
    hasData: false,
    items: [{ name: 'testing' }, { name: 'QA' }],
    ratio: 0.45,
    retries: 0,
    sort: {
      data: [{ type: 'asc' }, { type: 'desc' }],
      status: 'running',
    },
    status: 'idle',
    stuff: [],
    switch: false,
    versions: ['0.1', 0.5, 1, { id: '1.1.0' }],
  };

  const B = {
    data: { a: 1 },
    hasData: true,
    items: [{ name: 'building' }, { name: 'QA' }],
    ratio: 0.4,
    retries: 1,
    sort: {
      data: [{ type: 'desc' }, { type: 'asc' }],
      status: 'loaded',
    },
    status: 'done',
    stuff: [],
    versions: ['0.1', 0.6, 0.9, { id: '2.0.0' }],
  };

  describe('exports', () => {
    it('should export a function', () => {
      expect(typeof treeChanges).toBe('function');
    });

    it('should throw an error without parameters', () => {
      // @ts-ignore
      expect(() => treeChanges()).toThrowError('Missing required parameters');
      // @ts-ignore
      expect(() => treeChanges(A)).toThrowError('Missing required parameters');
    });

    it('should have all methods', () => {
      const { changed, changedFrom, changedTo, increased, decreased } = treeChanges(A, B);

      expect(typeof changed).toBe('function');
      expect(typeof changedFrom).toBe('function');
      expect(typeof changedTo).toBe('function');
      expect(typeof increased).toBe('function');
      expect(typeof decreased).toBe('function');
    });
  });

  describe('changed', () => {
    it('with arrays', () => {
      expect(treeChanges(A.items, B.items).changed()).toBe(true);
      expect(treeChanges(A.stuff, B.stuff).changed()).toBe(false);

      expect(treeChanges(A.versions, B.versions).changed()).toBe(true);
      expect(treeChanges(A.versions, B.versions).changed(0)).toBe(false);
      expect(treeChanges(A.versions, B.versions).changed(1)).toBe(true);
      expect(treeChanges(A.versions, B.versions).changed('3.id')).toBe(true);
    });

    it('with objects', () => {
      const { changed } = treeChanges(A, B);

      expect(changed()).toBe(true);
      expect(changed('status')).toBe(true);
      expect(changed('hasData')).toBe(true);
      expect(changed('data')).toBe(false);
      expect(changed('items')).toBe(true);
      expect(changed('items.0.name')).toBe(true);
      expect(changed('items.1.name')).toBe(false);
      expect(changed('sort')).toBe(true);
      expect(changed('sort.status')).toBe(true);
      expect(changed('sort.missing')).toBe(false);
      expect(changed('sort.data.0.type')).toBe(true);
      expect(changed('switch')).toBe(true);
    });
  });

  describe('changedFrom', () => {
    it('should throw an error without `key` parameter', () => {
      const { changedFrom } = treeChanges(A, B);

      // @ts-ignore
      expect(() => changedFrom()).toThrowError('Key parameter is required');
    });

    it('with arrays', () => {
      const { changedFrom } = treeChanges(A.versions, B.versions);

      expect(changedFrom(1, 0.5)).toBe(true);
      expect(changedFrom(1, 0.6)).toBe(false);
      expect(changedFrom(1, 0.5, 0.6)).toBe(true);
      expect(changedFrom(2, 1, 0.9)).toBe(true);
      expect(changedFrom('3.id', '1.1.0', '2.0.0')).toBe(true);
    });

    it('with objects', () => {
      const { changedFrom } = treeChanges(A, B);

      // @ts-ignore
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

      expect(changedFrom('sort.status', 'running')).toBe(true);
      expect(changedFrom('sort.status', 'running', 'loaded')).toBe(true);

      expect(changedFrom('sort.data.0.type', 'asc')).toBe(true);
      expect(changedFrom('sort.data.0.type', 'asc', 'desc')).toBe(true);

      expect(changedFrom('switch', false, undefined)).toBe(true);
      expect(changedFrom('switch', false)).toBe(true);
    });
  });

  describe('changedTo', () => {
    it('should throw an error without `key` parameter', () => {
      const { changedTo } = treeChanges(A, B);

      // @ts-ignore
      expect(() => changedTo()).toThrowError('Key parameter is required');
    });

    it('with arrays', () => {
      const { changedTo } = treeChanges(A.versions, B.versions);

      expect(changedTo(0, '0.1')).toBe(false);
      expect(changedTo(1, 0.6)).toBe(true);
      expect(changedTo(1, 0.5)).toBe(false);
      expect(changedTo(2, 0.9)).toBe(true);
      expect(changedTo('3.id', '2.0.0')).toBe(true);
    });

    it('with objects', () => {
      const { changedTo } = treeChanges(A, B);

      // @ts-ignore
      expect(changedTo('status')).toBe(false);

      expect(changedTo('status', 'idle')).toBe(false);
      expect(changedTo('status', ['ready', 'done'])).toBe(true);

      expect(changedTo('hasData', false)).toBe(false);
      expect(changedTo('hasData', true)).toBe(true);

      expect(changedTo('data', { a: 1 })).toBe(false);
      expect(changedTo('data', '')).toBe(false);

      expect(changedTo('sort.status', 'running')).toBe(false);
      expect(changedTo('sort.status', 'loaded')).toBe(true);

      expect(changedTo('sort.data.0.type', 'desc')).toBe(true);
      expect(changedTo('sort.data.1.type', 'asc')).toBe(true);

      expect(changedTo('retries', 1)).toBe(true);
    });
  });

  describe('increased', () => {
    it('should throw an error without `key` parameter', () => {
      const { increased } = treeChanges(A, B);

      // @ts-ignore
      expect(() => increased()).toThrowError('Key parameter is required');
    });

    it('with arrays', () => {
      const { increased } = treeChanges(A.versions, B.versions);

      expect(increased(0)).toBe(false);
      expect(increased(1)).toBe(true);
      expect(increased(2)).toBe(false);
      expect(increased(3)).toBe(false);
    });

    it('with objects', () => {
      const { increased } = treeChanges(A, B);

      expect(increased('status')).toBe(false);
      expect(increased('hasData')).toBe(false);
      expect(increased('data')).toBe(false);
      expect(increased('ratio')).toBe(false);
      expect(increased('retries')).toBe(true);
    });
  });

  describe('decreased', () => {
    it('should throw an error without `key` parameter', () => {
      const { decreased } = treeChanges(A, B);

      // @ts-ignore
      expect(() => decreased()).toThrowError('Key parameter is required');
    });

    it('with arrays', () => {
      const { decreased } = treeChanges(A.versions, B.versions);

      expect(decreased(0)).toBe(false);
      expect(decreased(1)).toBe(false);
      expect(decreased(2)).toBe(true);
      expect(decreased(3)).toBe(false);
    });

    it('with objects', () => {
      const { decreased } = treeChanges(A, B);

      expect(decreased('status')).toBe(false);
      expect(decreased('hasData')).toBe(false);
      expect(decreased('data')).toBe(false);
      expect(decreased('ratio')).toBe(true);
      expect(decreased('retries')).toBe(false);
    });
  });
});
