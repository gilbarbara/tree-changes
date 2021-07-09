import treeChanges from '../src';

describe('tree-changes', () => {
  const A = {
    data: { a: 1 },
    hasData: false,
    items: [{ name: 'testing' }, { name: 'QA' }],
    matrix: [[0, 1]],
    messages: [{ title: 'Hello' }],
    missing: 'username',
    notifications: [],
    options: {},
    pristine: true,
    prizes: ['trophy'],
    ratio: 0.45,
    retries: 0,
    sort: {
      data: [{ type: 'asc' }, { type: 'desc' }],
      status: 'running',
    },
    status: 'idle',
    stuff: [],
    switch: false,
    tasks: { test: 'do it', passed: [190292] },
    username: '',
    versions: ['0.1', 0.5, 1, { id: '1.1.0' }, { id: '2.0.0' }],
    visits: [1607208821],
  };

  const B = {
    data: { a: 1, b: 2 },
    features: {
      controls: true,
    },
    hasData: true,
    items: [{ name: 'building' }, { name: 'QA' }, { name: 'deploy' }],
    matrix: [
      [0, 1],
      [2, 3],
    ],
    messages: [],
    missing: '',
    new: [{ id: 12 }, { id: 13 }],
    notifications: ['Viewed profile'],
    options: { a: 1 },
    ratio: 0.4,
    retries: 1,
    sort: {
      data: [{ type: 'desc' }, { type: 'asc' }],
      status: 'loaded',
    },
    status: 'ready',
    stuff: [],
    sudo: true,
    tasks: { passed: [190292, 192019] },
    username: 'john',
    versions: ['0.1', 0.6, 0.9, { id: '2.0.0' }],
    visits: [1607208821, 1607223055],
  };

  describe('basic', () => {
    it('should throw without all parameters', () => {
      // @ts-ignore
      expect(() => treeChanges()).toThrow('Missing required parameters');
      // @ts-ignore
      expect(() => treeChanges(A)).toThrow('Missing required parameters');
    });

    it('should throw with invalid parameters', () => {
      // @ts-ignore
      expect(() => treeChanges(A.missing, B.missing)).toThrow('Expected plain objects or array');
      // @ts-ignore
      expect(() => treeChanges(A.hasData, B.hasData)).toThrow('Expected plain objects or array');
    });
  });

  describe('added', () => {
    it('with arrays', () => {
      const { added } = treeChanges(A.visits, B.visits);

      expect(added()).toBe(true);
      expect(added('0')).toBe(false);
      expect(added(0)).toBe(false);
      expect(added(1)).toBe(true);
    });

    it('with objects', () => {
      const { added } = treeChanges(A, B);

      expect(added()).toBe(true);
      expect(added('data')).toBe(true);
      expect(added('features')).toBe(true);
      expect(added('items')).toBe(true);
      expect(added('sudo')).toBe(true);

      expect(added('ratio')).toBe(false);
      expect(added('status')).toBe(false);
      expect(added('stuff')).toBe(false);

      // @ts-ignore
      expect(added('invalid')).toBe(false);
    });

    it('with the `value` parameter', () => {
      const { added } = treeChanges(A, B);

      expect(added(undefined, { new: [{ id: 12 }, { id: 13 }] })).toBe(true);
      expect(added(undefined, { new: [{ id: 12 }] })).toBe(false);

      expect(added(undefined, [{ id: 12 }, { id: 13 }])).toBe(true);
      expect(added(undefined, [{ id: 12 }])).toBe(true);

      expect(added('data', { b: 2 })).toBe(true);
      expect(added('data', { a: 1 })).toBe(false);

      expect(added('features', { controls: true })).toBe(true);
      expect(added('features', { controls: false })).toBe(false);

      expect(added('matrix', [2, 3])).toBe(true);
      expect(
        added('matrix', [
          [0, 1],
          [2, 3],
        ]),
      ).toBe(false);
      expect(added('matrix', [0, 1])).toBe(false);

      expect(added('options')).toBe(true);
      expect(added('options', { a: 2 })).toBe(false);

      expect(added('status')).toBe(false);
      expect(added('status', 'ready')).toBe(false);

      expect(added('tasks', [190292, 192019])).toBe(false);
      expect(added('tasks', { test: 'do it' })).toBe(false);

      expect(added('versions', 0.6)).toBe(true);
      expect(added('versions', '0.1')).toBe(false);

      // @ts-ignore
      expect(added('invalid', '0.1')).toBe(false);
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
      expect(changed('data')).toBe(true);
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

  describe('changed with `actual` parameter', () => {
    it('with arrays', () => {
      const { changed } = treeChanges(A.versions, B.versions);

      expect(changed(0, '0.1')).toBe(false);
      expect(changed(1, 0.6)).toBe(true);
      expect(changed(1, 0.5)).toBe(false);
      expect(changed(2, 0.9)).toBe(true);
      expect(changed('3.id', '2.0.0')).toBe(true);
    });

    it('with objects', () => {
      const { changed } = treeChanges(A, B);

      expect(changed('status', 'idle')).toBe(false);
      expect(changed('status', ['ready', 'done'])).toBe(true);

      expect(changed('hasData', false)).toBe(false);
      expect(changed('hasData', true)).toBe(true);

      expect(changed('data', { a: 1, b: 2 })).toBe(true);
      expect(changed('data', { a: 1 })).toBe(false);
      expect(changed('data', '')).toBe(false);

      expect(changed('sort.status', 'running')).toBe(false);
      expect(changed('sort.status', 'loaded')).toBe(true);

      expect(changed('sort.data.0.type', 'desc')).toBe(true);
      expect(changed('sort.data.1.type', 'asc')).toBe(true);

      expect(changed('retries', 1)).toBe(true);
    });
  });

  describe('changed with `actual` and `previous`', () => {
    it('with arrays', () => {
      const { changed } = treeChanges(A.versions, B.versions);

      expect(changed(1, 0.5)).toBe(false);
      expect(changed(1, 0.6)).toBe(true);
      expect(changed(1, 0.6, 0.5)).toBe(true);
      expect(changed(2, 0.9, 1)).toBe(true);
      expect(changed('3.id', '2.0.0', '1.1.0')).toBe(true);
    });

    it('with objects', () => {
      const { changed } = treeChanges(A, B);

      expect(changed('status', 'ready', 'idle')).toBe(true);
      expect(changed('status', 'ready', ['ready', 'running'])).toBe(false);
      expect(changed('status', ['error', 'done'], 'idle')).toBe(false);

      expect(changed('hasData', true, false)).toBe(true);
      expect(changed('hasData', false, true)).toBe(false);

      expect(changed('data', { a: 1, b: 2 }, { a: 1 })).toBe(true);
      expect(changed('data', {}, { a: 1 })).toBe(false);
      expect(changed('data', true, { a: 1 })).toBe(false);
      expect(changed('data', { a: 1 }, 'a')).toBe(false);
      expect(changed('sort.status', 'loaded', 'running')).toBe(true);
      expect(changed('sort.data.0.type', 'desc', 'asc')).toBe(true);

      expect(changed('switch', undefined, false)).toBe(true);
    });
  });

  describe('changedFrom', () => {
    it('should handle calls without the `key` parameter', () => {
      const { changedFrom } = treeChanges(A, B);

      // @ts-ignore
      expect(changedFrom()).toBe(false);
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
      expect(changedFrom('status', 'idle', 'ready')).toBe(true);
      expect(changedFrom('status', ['ready', 'running'], 'ready')).toBe(false);
      expect(changedFrom('status', 'idle', ['error', 'done'])).toBe(false);

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
    it('should handle calls without the `key` parameter', () => {
      const { changedTo } = treeChanges(A, B);

      // @ts-ignore
      expect(changedTo()).toBe(false);
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

  describe('decreased', () => {
    it('should handle calls without the `key` parameter', () => {
      const { decreased } = treeChanges(A, B);

      // @ts-ignore
      expect(decreased()).toBe(false);
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

  describe('emptied', () => {
    it('with arrays', () => {
      const { emptied } = treeChanges(A.messages, B.messages);

      // @ts-ignore
      expect(emptied()).toBe(true);
    });

    it('with objects', () => {
      const { emptied } = treeChanges(A, B);

      expect(emptied('messages')).toBe(true);

      expect(emptied('notifications')).toBe(false);
      expect(emptied('options')).toBe(false);
      expect(emptied()).toBe(false);
      expect(emptied('data')).toBe(false);
      expect(emptied('items')).toBe(false);
      expect(emptied('ratio')).toBe(false);
      expect(emptied('status')).toBe(false);
      expect(emptied('stuff')).toBe(false);
    });
  });

  describe('filled', () => {
    it('with arrays', () => {
      const { filled } = treeChanges(A.notifications, B.notifications);

      // @ts-ignore
      expect(filled()).toBe(true);
    });

    it('with objects', () => {
      const { filled } = treeChanges(A, B);

      expect(filled('notifications')).toBe(true);
      expect(filled('options')).toBe(true);
      expect(filled('username')).toBe(true);

      expect(filled()).toBe(false);
      expect(filled('data')).toBe(false);
      expect(filled('items')).toBe(false);
      expect(filled('ratio')).toBe(false);
      expect(filled('status')).toBe(false);
      expect(filled('stuff')).toBe(false);
    });
  });

  describe('increased', () => {
    it('should handle calls without the `key` parameter', () => {
      const { increased } = treeChanges(A, B);

      // @ts-ignore
      expect(increased()).toBe(false);
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

      expect(increased('hasData')).toBe(false);
      expect(increased('ratio')).toBe(false);
      expect(increased('retries')).toBe(true);
    });
  });

  describe('removed', () => {
    it('with arrays', () => {
      const { removed } = treeChanges(A.versions, B.versions);

      expect(removed()).toBe(true);
      expect(removed(0)).toBe(false);
      expect(removed('0')).toBe(false);
      expect(removed(4)).toBe(true);
    });

    it('with objects', () => {
      const { removed } = treeChanges(A, B);

      expect(removed()).toBe(true);
      expect(removed('prizes')).toBe(true);
      expect(removed('switch')).toBe(true);
      expect(removed('tasks')).toBe(true);
      expect(removed('versions')).toBe(true);

      expect(removed('hasData')).toBe(false);
      expect(removed('ratio')).toBe(false);
      expect(removed('status')).toBe(false);
      expect(removed('stuff')).toBe(false);

      // @ts-ignore
      expect(removed('invalid')).toBe(false);
    });

    it('with the `value` parameter', () => {
      const { removed } = treeChanges(A, B);

      expect(removed('switch', false)).toBe(true);
      expect(removed('tasks', { test: 'do it' })).toBe(true);

      expect(removed('versions', { id: '1.1.0' })).toBe(true);
      expect(removed('versions', 1)).toBe(true);
      expect(removed('versions', 0.5)).toBe(true);

      expect(removed('versions', 0.6)).toBe(false);
      expect(removed('versions', 0.9)).toBe(false);
      expect(removed('versions', { id: '2.0.0' })).toBe(false);

      expect(removed('tasks', { test: 'do it' })).toBe(true);

      // @ts-ignore
      expect(removed('invalid', { id: '1.1.0' })).toBe(false);
    });
  });
});
