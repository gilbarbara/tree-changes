import deep from 'deep-diff';
// @ts-ignore
import nested from 'nested-property';

interface IObject {
  [key: string]: any;
}

export type TypeInput = string | boolean | number | string[] | boolean[] | number[] | IObject;

export type IData = IObject | IObject[];

export interface ITreeChanges {
  changed: (key?: string) => boolean;
  changedFrom: (key: string, previous: TypeInput, actual?: TypeInput) => boolean;
  changedTo: (key: string, actual: TypeInput) => boolean;
  increased: (key: string) => boolean;
  decreased: (key: string) => boolean;
}

function isPlainObj(...args: any): boolean {
  return args.every((d:any) => {
    if (!d) {
      return false;
    }
    const prototype = Object.getPrototypeOf(d);

    return Object.prototype.toString.call(d)
      .slice(8, -1) === 'Object' && (prototype === null || prototype === Object.getPrototypeOf({}));
  });
}

function isArray(...args: any): boolean {
  return args.every((d: any) => Array.isArray(d));
}

function isNumber(...args: any): boolean {
  return args.every((d: any) => typeof d === 'number');
}

export default function treeChanges(data: IData, nextData: IData): ITreeChanges {
  if (!data || !nextData) {
    throw new Error('Missing required parameters');
  }

  return {
    changed(key?: string): boolean {
      const left = nested.get(data, key);
      const right = nested.get(nextData, key);

      if ((isArray(left, right)) || (isPlainObj(left, right))) {
        const diff = deep.diff(left, right);

        return !!diff;
      }

      return left !== right;
    },
    changedFrom(key: string, previous: TypeInput, actual?: TypeInput): boolean {
      if (!key) {
        throw new Error('Key parameter is required');
      }

      const useActual = typeof previous !== 'undefined' && typeof actual !== 'undefined';
      const left = nested.get(data, key);
      const right = nested.get(nextData, key);
      const leftComparator = Array.isArray(previous) ? previous.indexOf(left as never) >= 0 : left === previous;
      const rightComparator = Array.isArray(actual) ? actual.indexOf(right as never) >= 0 : right === actual;

      return leftComparator && (useActual ? rightComparator : !useActual);
    },
    changedTo(key: string, actual: TypeInput): boolean {
      if (!key) {
        throw new Error('Key parameter is required');
      }

      const left = nested.get(data, key);
      const right = nested.get(nextData, key);
      const leftComparator = Array.isArray(actual) ? actual.indexOf(left as never) < 0 : left !== actual;
      const rightComparator = Array.isArray(actual) ? actual.indexOf(right as never) >= 0 : right === actual;

      return leftComparator && rightComparator;
    },
    increased(key: string): boolean {
      if (!key) {
        throw new Error('Key parameter is required');
      }

      return isNumber(nested.get(data, key), nested.get(nextData, key)) && nested.get(data, key) < nested.get(nextData, key);
    },
    decreased(key: string): boolean {
      if (!key) {
        throw new Error('Key parameter is required');
      }

      return isNumber(nested.get(data, key), nested.get(nextData, key)) && nested.get(data, key) > nested.get(nextData, key);
    },
  };
}
