// @flow
export default function treeChanges(data: Object, nextData: Object): Object {
  return {
    changedFrom(key: string, previous: string, actual: string): boolean {
      return data[key] === previous && nextData[key] === actual;
    },
    changedTo(key: string, actual: string): boolean {
      return data[key] !== actual && nextData[key] === actual;
    },
    changed(key: string): boolean {
      return data[key] !== nextData[key];
    },
    increased(key: string): boolean {
      return data[key] < nextData[key];
    },
    decreased(key: string): boolean {
      return data[key] > nextData[key];
    },
  };
}
