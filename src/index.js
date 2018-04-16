// @flow
import deep from 'deep-diff';
import nested from 'nested-property';

type TypeInput = string | boolean | number;

function isPlainObj(...args: any): boolean {
  return args.every(d => {
    const prototype = Object.getPrototypeOf(d);

    return Object.prototype.toString.call(d)
      .slice(8, -1) === 'Object' && (prototype === null || prototype === Object.getPrototypeOf({}));
  });
}

function isArray(...args: any): boolean {
  return args.every(d => Array.isArray(d));
}

function isNumber(...args: any): boolean {
  return args.every(d => typeof d === 'number');
}

export default function treeChanges(data: Object, nextData: Object): Object {
  return {
    changed(key: string): boolean {
      if ((isArray(nested.get(data, key), nested.get(nextData, key))) || (isPlainObj(nested.get(data, key), nested.get(nextData, key)))) {
        const diff = deep.diff(nested.get(data, key), nested.get(nextData, key));

        return !!diff;
      }

      return nested.get(data, key) !== nested.get(nextData, key);
    },
    changedFrom(key: string, previous: TypeInput, actual?: TypeInput): boolean {
      const useActual = typeof previous !== 'undefined' && typeof actual !== 'undefined';

      return nested.get(data, key) === previous && (useActual ? nested.get(nextData, key) === actual : !useActual);
    },
    changedTo(key: string, actual: TypeInput): boolean {
      return nested.get(data, key) !== actual && nested.get(nextData, key) === actual;
    },
    increased(key: string): boolean {
      return isNumber(nested.get(data, key), nested.get(nextData, key)) && nested.get(data, key) < nested.get(nextData, key);
    },
    decreased(key: string): boolean {
      return isNumber(nested.get(data, key), nested.get(nextData, key)) && nested.get(data, key) > nested.get(nextData, key);
    },
  };
}
