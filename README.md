# reselectable
-----------------

## API

### createMemoSelector(...inputSelectors | [inputSelectors], resultFunc)

Works like reselect's createSelector by taking an array of selectors, computing their values and passing them as
arguments to `resultFunc`.

Additionally, it passes the previously computed result followed by the previous input values. When `resultFunc`
is executed for the first time or after the `reset` method is executed, it will pass null for these additional values.

```js
import { is } from 'immutable';
import { createMemoSelector } from 'reselectable';

const getPersonWithFriends = people =>
    person => person.update('friends', f => f.map(id => people.get(id)));

const getMergedResult = previous => (item, id) => {
    const prevItem = previous && previous.get(id);
    return is(prevItem, item) ? prevItem : item;
};

const selectPeopleWithFriends = createMemoSelector(
    state => state.get('people'),
    (people, previous) =>
        people.map(getPersonWithFriends(people)).map(getMergedResult(previous))
);

const indexBy = (iterable, searchKey) =>
    iterable.reduce((result, item) => result.set(item.get(searchKey), item), Map());

const selectPeopleList = createMemoSelector(
    selectPeopleWithFriends,
    state => state.get('sort'),
    state => state.get('filter'),
    (people, sort, filter, prevResult, prevPeople, prevSort, prevFilter) => {
        if (people === prevPeople && filter === prevFilter) {
            return prevResult.sortBy(p => p.get(sort));
        }

        const peopleList = people.toList()
            .filter(p => p.get('status') === filter)
            .sortBy(p => p.get(sort));

        if (!prevResult) {
            return peopleList;
        }

        const prevResultById = indexBy(prevResult, 'id');
        return peopleList.map(getMergedResult(prevResultById));
    }
);
```

### createAutoSelector(...inputSelectors | [inputSelectors], resultFunc)

Works like reselect's createSelector by taking an array of selectors, computing their values
and passing them as arguments to `resultFunc`.

The selector attempts to optimize the output of `resultFunc`, to minimize referentially different but
equivalent output when compared to the previous result. The selector supports mixed immutable
and plain javascript objects in the output.

```js
import { is } from 'immutable';
import { createSelector } from 'reselect';
import { createAutoSelector } from 'reselectable';

const getPersonWithFriends = people =>
    person => person.update('friends', f => f.map(id => people.get(id)));

const selectPeopleWithFriends = createAutoSelector(
    state => state.get('people'),
    (people) => people.map(getPersonWithFriends(people))
);

const selectFilteredPeople = createAutoSelector(
    selectPeopleWithFriends,
    state => state.get('filter'),
    (people, filter) => people.filter(p => p.get('status') === filter)
);

const selectPeopleList = createSelector(
    selectFilteredPeople,
    state => state.get('sort'),
    (people, sort) => people.toList().sortBy(p => p.get(sort))
);
```
