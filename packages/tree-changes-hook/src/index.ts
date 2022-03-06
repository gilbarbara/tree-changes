import { useEffect, useRef } from 'react';
import equal from '@gilbarbara/deep-equal';
import treeChanges, { Data, KeyType, TreeChanges } from 'tree-changes';

export default function useTreeChanges<T extends Data>(value: T) {
  const previousValue = useRef(value);
  const isEqual = equal(previousValue.current, value);
  const previousIsEqual = useRef(isEqual);
  const instance = useRef<TreeChanges<KeyType<T, typeof previousValue.current>>>(
    treeChanges(previousValue.current, value),
  );

  useEffect(() => {
    previousValue.current = value;
  });

  if (previousIsEqual.current !== isEqual || !isEqual) {
    previousIsEqual.current = isEqual;
    instance.current = treeChanges(previousValue.current, value);
  }

  return instance.current;
}

// eslint-disable-next-line unicorn/prefer-export-from
export { treeChanges };
export * from 'tree-changes';
