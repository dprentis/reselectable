import { List, Map, is, Iterable } from 'immutable';
import { isEqual, isArray, isObject, map, reduce, every } from 'lodash';
import { createSelector } from 'reselect';

// selector wrapper to provide the transform function
// with the previous output in an extra last input parameter
// the reset method allows to clear the previous value
// in special use cases eg. unit tests
export const createMemoSelector = (...args) => {
    let prevIn, prevOut;

    const transFn = args.pop();
    const transprevFn = (...newIn) => {
        prevOut = transFn(...newIn, prevOut, ...prevIn);
        prevIn = newIn;

        return prevOut;
    };

    const selector = createSelector(...args.concat(transprevFn));
    selector.reset = () => {
        prevOut = null;
        prevIn = Array.apply(null, Array(args.length)).map(() => null);
    };

    selector.reset();
    return selector;
};

const processImmutableWith = (fn, prev) => (item, key) => fn(prev.get(key), item);
const processPlainWith = (fn, prev) => (item, key) => fn(prev[key], item);

// returns true if and only if all properties of next and its sub-properties
// are either equal to (===) corresponding properties of prev
// or are different (neither 'is' or 'isEqual' is true)
const doTakeNext = (prev, next) => {
    if (prev === next || !isObject(prev) || !isObject(next)) {
        return true;
    }

    if (Iterable.isIterable(prev) && Iterable.isIterable(next)) {
        return !is(prev, next) ? next.every(processImmutableWith(doTakeNext, prev)) : false;
    }

    if (!Iterable.isIterable(prev) && !Iterable.isIterable(next)) {
        return !isEqual(prev, next) ? every(next, processPlainWith(doTakeNext, prev)) : false;
    }

    return true;
};

const buildResult = (prev, next) => {
    if (doTakeNext(prev, next)) {
        return next;
    }

    if (Iterable.isIterable(prev) && Iterable.isIterable(next)) {
        if (is(prev, next)) {
            return prev;
        }

        if (List.isList(next) || Map.isMap(next)) {
            return next.map(processImmutableWith(buildResult, prev));
        }

        // must convert Record to Map, to be able to map properties
        // https://github.com/facebook/immutable-js/issues/268
        // https://github.com/facebook/immutable-js/issues/410
        return (next.toMap()).map(processImmutableWith(buildResult, prev));
    }

    if (!Iterable.isIterable(prev) && !Iterable.isIterable(next)) {
        if (isEqual(prev, next)) {
            return prev;
        }

        if (isArray(prev) && isArray(next)) {
            return map(next, processPlainWith(buildResult, prev));
        }

        if (isObject(prev) && isObject(next)) {
            return reduce(next, (result, item, key) => ({
                ...result,
                [key]: processPlainWith(buildResult, prev)(item, key)
            }), {});
        }
    }

    return next;
};

// selector wrapper, which normalizes the transform function's output
// to minimise reference changes between subsequent outputs
export const createAutoSelector = (...args) => {
    const transFn = args.pop();
    const prevOutIdx = isArray(args[0]) ? 1 : args.length;
    const transDiffFn = (...newArgs) => buildResult(newArgs[prevOutIdx], transFn(...newArgs));

    return createMemoSelector(...args.concat(transDiffFn));
};
