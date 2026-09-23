import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { countingSort, radixSort, bucketSort, quickSelect } from '../src/algorithms/linearSorts.js';
import { bstInserts, heapInserts, hashLinear, unionFind } from '../src/algorithms/structures.js';
import { activitySelection, huffman, kmpSearch, rabinKarp, edmondsKarp, npReduction, masterTheorem } from '../src/algorithms/extras.js';

const SAMPLE = [5, 2, 8, 1, 9, 3];

function finalArray(frames) {
  return frames[frames.length - 1].array;
}

describe('linear sorts', () => {
  it('counting sorts', () => {
    assert.deepEqual(finalArray(countingSort(SAMPLE)), [...SAMPLE].sort((a, b) => a - b));
  });
  it('radix sorts', () => {
    assert.deepEqual(finalArray(radixSort([170, 45, 75, 90, 802, 24, 2, 66])), [2, 24, 45, 66, 75, 90, 170, 802]);
  });
  it('bucket sorts', () => {
    assert.deepEqual(finalArray(bucketSort(SAMPLE)), [...SAMPLE].sort((a, b) => a - b));
  });
  it('quickselect finds kth', () => {
    const frames = quickSelect(SAMPLE, 2);
    const found = frames.at(-1).extra?.found;
    assert.ok(found != null);
  });
});

describe('structures', () => {
  it('bst inserts', () => {
    const frames = bstInserts([5, 3, 7]);
    assert.equal(frames.at(-1).type, 'done');
  });
  it('heap inserts', () => {
    const frames = heapInserts([20, 15, 8]);
    assert.equal(frames.at(-1).extra.heap[0], 20);
  });
  it('hash fills', () => {
    const frames = hashLinear([1, 12], 11);
    assert.equal(frames.at(-1).type, 'done');
  });
  it('union find unions', () => {
    const frames = unionFind([
      ['u', 'a', 'b'],
      ['f', 'a', 0],
    ]);
    assert.ok(frames.length >= 2);
  });
});

describe('greedy strings flow np dc', () => {
  it('activity selection', () => {
    const frames = activitySelection([
      [1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11],
    ]);
    assert.equal(frames.at(-1).type, 'done');
  });
  it('huffman', () => {
    const frames = huffman({ A: 5, B: 2, C: 1, D: 1 });
    assert.equal(frames.at(-1).type, 'done');
  });
  it('kmp finds match', () => {
    const frames = kmpSearch('AABAABAAB', 'AAB');
    assert.equal(frames.at(-1).extra.match, 0);
  });
  it('rk finds match', () => {
    const frames = rabinKarp('AABAACAADAABAABA', 'AABA');
    assert.ok(frames.at(-1).extra.match >= 0);
  });
  it('edmonds-karp computes flow', () => {
    const g = {
      directed: true,
      nodes: [0, 1, 2, 3].map((id) => ({ id, label: String(id), x: 0, y: 0 })),
      edges: [
        { u: 0, v: 1, w: 3 },
        { u: 0, v: 2, w: 2 },
        { u: 1, v: 3, w: 2 },
        { u: 2, v: 3, w: 3 },
        { u: 1, v: 2, w: 1 },
      ],
    };
    const frames = edmondsKarp(g, 0, 3);
    assert.equal(frames.at(-1).extra.value, 5);
  });
  it('np reduction packs', () => {
    const frames = npReduction('3sat-clique');
    assert.ok(frames.length >= 5);
    assert.equal(frames.at(-1).type, 'done');
  });
  it('master theorem case 1', () => {
    const frames = masterTheorem(4, 2, 'poly', 1, 0);
    assert.match(frames.at(-1).message, /case 1/);
  });
});
