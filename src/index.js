// @flow
import deep from 'deep-diff';

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
      if ((isArray(data[key], nextData[key])) || (isPlainObj(data[key], nextData[key]))) {
        const diff = deep.diff(data[key], nextData[key]);

        return !!diff;
      }

      return data[key] !== nextData[key];
    },
    changedFrom(key: string, previous: TypeInput, actual: TypeInput): boolean {
      return data[key] === previous && nextData[key] === actual;
    },
    changedTo(key: string, actual: TypeInput): boolean {
      return data[key] !== actual && nextData[key] === actual;
    },
    increased(key: string): boolean {
      return isNumber(data[key], nextData[key]) && data[key] < nextData[key];
    },
    decreased(key: string): boolean {
      return isNumber(data[key], nextData[key]) && data[key] > nextData[key];
    },
  };
}
