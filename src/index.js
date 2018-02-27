// @flow
type TypeInput = string | boolean | number;

function isNumber(...args: any): boolean {
  return args.every(d => typeof d === 'number');
}

export default function treeChanges(data: Object, nextData: Object): Object {
  return {
    changed(key: string): boolean {
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
