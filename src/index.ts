import * as equal from 'fast-deep-equal';
import is from 'is-lite';
import {
  hasExtraKeys,
  compareNumbers,
  compareValues,
  getIterables,
  includesOrEqualsTo,
  nested,
} from './helpers';

import { Data, KeyType, TreeChanges, Value } from './types';

export default function treeChanges<P extends Data, D extends Data, K = KeyType<P, D>>(
  previousData: P,
  data: D,
): TreeChanges<K> {
  if ([previousData, data].some(is.nullOrUndefined)) {
    throw new Error('Missing required parameters');
  }

  if (![previousData, data].every(d => is.plainObject(d) || is.array(d))) {
    throw new Error('Expected plain objects or array');
  }

  const added = (key?: K, value?: Value): boolean => {
    try {
      const left = nested(previousData, key);
      const right = nested(data, key);

      if (!is.nullOrUndefined(value)) {
        if (is.defined(left)) {
          // check if nested data matches
          if (is.array(right) || is.plainObject(right)) {
            return compareValues(left, right, value);
          }
        } else {
          return equal(right, value);
        }

        return false;
      }

      if ([left, right].every(is.array)) {
        return !right.every((d: any) => left.indexOf(d) >= 0);
      }

      if ([left, right].every(is.plainObject)) {
        return hasExtraKeys(Object.keys(left), Object.keys(right));
      }

      return (
        ![left, right].every(d => is.primitive(d) && is.defined(d)) &&
        !is.defined(left) &&
        is.defined(right)
      );
    } catch {
      return false;
    }
  };

  const changed = (key?: K | string, actual?: Value, previous?: Value): boolean => {
    try {
      const left = nested(previousData, key);
      const right = nested(data, key);
      const hasActual = is.defined(actual);
      const hasPrevious = is.defined(previous);

      if (hasActual || hasPrevious) {
        const leftComparator = hasPrevious
          ? includesOrEqualsTo(previous, left)
          : !includesOrEqualsTo(actual, left);
        const rightComparator = includesOrEqualsTo(actual, right);

        return leftComparator && rightComparator;
      }

      if ([left, right].every(is.array) || [left, right].every(is.plainObject)) {
        return !equal(left, right);
      }

      return left !== right;
    } catch (error) {
      return false;
    }
  };

  const changedFrom = (key: K | string, previous: Value, actual?: Value): boolean => {
    if (!is.defined(key)) {
      return false;
    }

    try {
      const left = nested(previousData, key);
      const right = nested(data, key);
      const hasActual = is.defined(actual);

      return (
        includesOrEqualsTo(previous, left) &&
        (hasActual ? includesOrEqualsTo(actual, right) : !hasActual)
      );
    } catch {
      return false;
    }
  };

  /**
   * @deprecated
   * Use "changed" instead
   */
  const changedTo = (key: K | string, actual: Value): boolean => {
    if (!is.defined(key)) {
      return false;
    }

    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('`changedTo` is deprecated! Replace it with `change`');
    }

    return changed(key, actual);
  };

  const decreased = (key: K, actual?: Value, previous?: Value): boolean => {
    if (!is.defined(key)) {
      return false;
    }

    try {
      return compareNumbers(previousData, data, { key, actual, previous, type: 'decreased' });
    } catch {
      return false;
    }
  };

  const emptied = (key?: K): boolean => {
    try {
      const [left, right] = getIterables(previousData, data, { key });
      return !!left.length && !right.length;
    } catch {
      return false;
    }
  };

  const filled = (key?: K): boolean => {
    try {
      const [left, right] = getIterables(previousData, data, { key });

      return !left.length && !!right.length;
    } catch {
      return false;
    }
  };

  const increased = (key: K, actual?: Value, previous?: Value): boolean => {
    if (!is.defined(key)) {
      return false;
    }

    try {
      return compareNumbers(previousData, data, { key, actual, previous, type: 'increased' });
    } catch {
      return false;
    }
  };

  const removed = (key?: K, value?: Value): boolean => {
    try {
      const left = nested(previousData, key);
      const right = nested(data, key);

      if (!is.nullOrUndefined(value)) {
        if (is.defined(right)) {
          // check if nested data matches
          /* istanbul ignore else */
          if (is.array(left) || is.plainObject(left)) {
            return compareValues(right, left, value);
          }
        } else {
          return equal(left, value);
        }

        return false;
      }

      if ([left, right].every(is.array)) {
        return !right.every((d: any) => left.indexOf(d) >= 0);
      }

      if ([left, right].every(is.plainObject)) {
        return hasExtraKeys(Object.keys(right), Object.keys(left));
      }

      return (
        ![left, right].every(d => is.primitive(d) && is.defined(d)) &&
        is.defined(left) &&
        !is.defined(right)
      );
    } catch {
      return false;
    }
  };

  return { added, changed, changedFrom, changedTo, decreased, emptied, filled, increased, removed };
}
