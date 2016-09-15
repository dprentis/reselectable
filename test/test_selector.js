// TODO: Add test for React Redux connect function

import chai from 'chai'
import { Map, List, Record } from 'immutable';
import { createDiffSelector } from '../src/index';

const expect = chai.expect;

describe('DiffSelector', () => {
    describe('createDiffSelector', () => {
        let inputs;
        let selector;
        let first;
        let second;

        beforeEach(() => {
            inputs = ['A', 'B', 'C', 'D'].map(prop => state => state.get(prop));
        });

        describe('Map', () => {
            beforeEach(() => {
                selector = createDiffSelector(
                    inputs[0],
                    inputs[1],
                    inputs[2],
                    inputs[3],
                    (a, b, c, d) => Map({ a, b, c, d })
                );
            });

            it('returns same reference if results have equivaent simple properties', () => {
                first = selector(Map({ A: 1, B: '1', C: null, D: undefined }));
                expect(selector(Map({ A: 1, B: '1', C: null, D: undefined }))).to.equal(first);
            });

            it('returns same reference if results have equivalent iterable properties', () => {
                first = selector(Map({ A: Map({ E: 1 }), B: Map({ F: '1' }), C: Map({ G: null }), D: Map({ H: undefined }) }));
                expect(selector(Map({ A: Map({ E: 1 }), B: Map({ F: '1' }), C: Map({ G: null }), D: Map({ H: undefined }) }))).to.equal(first);
            });

            it('returns same references to equivalent subobjects', () => {
                first = selector(Map({ A: Map({ E: 2 }), B: Map({ F: 3 }), C: List([1, 2]), D: { E: 5 } }));
                second = selector(Map({ A: Map({ E: 2 }), B: Map({ F: 4 }), C: List([1, 2]), D: { E: 5 } }));

                expect(first).not.to.equal(second);
                expect(first.get('a')).to.equal(second.get('a'));
                expect(first.get('b')).not.to.equal(second.get('b'));
                expect(first.get('c')).to.equal(second.get('c'));
                expect(first.get('d')).to.equal(second.get('d'));
                expect(first.getIn(['a', 'E'])).to.equal(second.getIn(['a', 'E']));
            });
        });

        describe('List', () => {
            beforeEach(() => {
                selector = createDiffSelector(
                    inputs[0],
                    inputs[1],
                    inputs[2],
                    inputs[3],
                    (a, b, c, d) => List([a, b, c, d])
                );
            });

            it('returns same reference if results have equivaent simple properties', () => {
                first = selector(Map({ A: 1, B: '1', C: null, D: undefined }));
                expect(selector(Map({ A: 1, B: '1', C: null, D: undefined }))).to.equal(first);
            });

            it('returns same reference if results have equivalent iterable properties', () => {
                first = selector(Map({ A: Map({ E: 1 }), B: Map({ F: '1' }), C: Map({ G: null }), D: Map({ H: undefined }) }));
                expect(selector(Map({ A: Map({ E: 1 }), B: Map({ F: '1' }), C: Map({ G: null }), D: Map({ H: undefined }) }))).to.equal(first);
            });

            it('returns same references to equivalent submaps', () => {
                first = selector(Map({ A: Map({ E: 2 }), B: Map({ F: 3 }), C: List([1, 2]), D: { E: 5 } }));
                second = selector(Map({ A: Map({ E: 2 }), B: Map({ F: 4 }), C: List([1, 2]), D: { E: 5 } }));

                expect(first).not.to.equal(second);
                expect(first.get(0)).to.equal(second.get(0));
                expect(first.get(1)).not.to.equal(second.get(1));
                expect(first.get(2)).to.equal(second.get(2));
                expect(first.get(3)).to.equal(second.get(3));
                expect(first.getIn([0, 'E'])).to.equal(second.getIn([0, 'E']));
            });
        });

        describe('Record', () => {
            beforeEach(() => {
                const Item = Record({ a: null, b: null, c: null, d: null });
                selector = createDiffSelector(
                    inputs[0],
                    inputs[1],
                    inputs[2],
                    inputs[3],
                    (a, b, c, d) => new Item({ a, b, c, d })
                );
            });

            it('returns same reference if results have equivaent simple properties', () => {
                first = selector(Map({ A: 1, B: '1', C: null, D: undefined }));
                expect(selector(Map({ A: 1, B: '1', C: null, D: undefined }))).to.equal(first);
            });

            it('returns same reference if results have equivalent iterable properties', () => {
                first = selector(Map({ A: Map({ E: 1 }), B: Map({ F: '1' }), C: Map({ G: null }), D: Map({ H: undefined }) }));
                expect(selector(Map({ A: Map({ E: 1 }), B: Map({ F: '1' }), C: Map({ G: null }), D: Map({ H: undefined }) }))).to.equal(first);
            });

            it('returns same references to equivalent subobjects', () => {
                first = selector(Map({ A: Map({ E: 2 }), B: Map({ F: 3 }), C: List([1, 2]), D: { E: 5 } }));
                second = selector(Map({ A: Map({ E: 2 }), B: Map({ F: 4 }), C: List([1, 2]), D: { E: 5 } }));

                expect(first).not.to.equal(second);
                expect(first.get('a')).to.equal(second.get('a'));
                expect(first.get('b')).not.to.equal(second.get('b'));
                expect(first.get('c')).to.equal(second.get('c'));
                expect(first.get('d')).to.equal(second.get('d'));
                expect(first.getIn(['a', 'E'])).to.equal(second.getIn(['a', 'E']));
            });
        });

        describe('Plain object', () => {
            beforeEach(() => {
                selector = createDiffSelector(
                    inputs[0],
                    inputs[1],
                    inputs[2],
                    inputs[3],
                    (a, b, c, d) => ({ a, b, c, d })
                );
            });

            it('returns same reference if results have equivaent simple properties', () => {
                first = selector(Map({ A: 1, B: '1', C: null, D: undefined }));
                expect(selector(Map({ A: 1, B: '1', C: null, D: undefined }))).to.equal(first);
            });

            it('returns same reference if results have equivalent iterable properties', () => {
                first = selector(Map({ A: Map({ E: 1 }), B: Map({ F: '1' }), C: Map({ G: null }), D: Map({ H: undefined }) }));
                expect(selector(Map({ A: Map({ E: 1 }), B: Map({ F: '1' }), C: Map({ G: null }), D: Map({ H: undefined }) }))).to.equal(first);
            });

            it('returns same references to equivalent subobjects', () => {
                first = selector(Map({ A: Map({ E: 2 }), B: Map({ F: 3 }), C: List([1, 2]), D: { E: 5 } }));
                second = selector(Map({ A: Map({ E: 2 }), B: Map({ F: 4 }), C: List([1, 2]), D: { E: 5 } }));

                expect(first).not.to.equal(second);
                expect(first.a).to.equal(second.a);
                expect(first.b).not.to.equal(second.b);
                expect(first.c).to.equal(second.c);
                expect(first.d).to.equal(second.d);
                expect(first.a.E).to.equal(second.a.E);
            });
        });
    });
});
