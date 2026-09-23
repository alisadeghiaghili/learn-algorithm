import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
} from '../src/algorithms/sorting.js';
import { linearSearch, binarySearch } from '../src/algorithms/searching.js';
import { bfs, dfs, dijkstra, prim, kruskal } from '../src/algorithms/graphs.js';
import { fib, coinChange, lcs } from '../src/algorithms/dp.js';
import { parseCommand } from '../src/engine/commands.js';

const SAMPLE = [5, 2, 8, 1, 9, 3];

function finalArray(frames) {
  return frames[frames.length - 1].array;
}

describe('sorting', () => {
  for (const [name, fn] of Object.entries({
    bubbleSort,
    selectionSort,
    insertionSort,
    mergeSort,
    quickSort,
    heapSort,
  })) {
    it(`${name} sorts`, () => {
      const frames = fn(SAMPLE);
      assert.deepEqual(finalArray(frames), [...SAMPLE].sort((a, b) => a - b));
      assert.equal(frames.at(-1).type, 'done');
    });

    it(`${name} empty and single`, () => {
      assert.deepEqual(finalArray(fn([])), []);
      assert.deepEqual(finalArray(fn([1])), [1]);
    });
  }
});

describe('searching', () => {
  it('linear finds target', () => {
    const frames = linearSearch([4, 7, 1], 7);
    assert.equal(frames.at(-1).extra.found, 1);
  });

  it('binary finds target in sorted', () => {
    const frames = binarySearch([2, 5, 8, 12, 16, 23, 38], 23);
    assert.equal(frames.at(-1).extra.found, 5);
  });

  it('binary misses', () => {
    const frames = binarySearch([2, 5, 8], 4);
    assert.equal(frames.at(-1).extra.found, -1);
  });
});

const star = {
  directed: false,
  nodes: [0, 1, 2, 3, 4, 5].map((id) => ({ id, label: String(id), x: 0, y: 0 })),
  edges: [
    { u: 0, v: 1, w: 2 },
    { u: 0, v: 2, w: 4 },
    { u: 0, v: 3, w: 1 },
    { u: 1, v: 3, w: 2 },
  ],
};

describe('graphs', () => {
  it('bfs visits all reachable', () => {
    const frames = bfs(star, 0);
    const order = frames.at(-1).extra.order;
    assert.equal(order[0], 0);
    assert.equal(order.length, 4);
  });

  it('dfs starts at source', () => {
    const frames = dfs(star, 0);
    assert.equal(frames.at(-1).extra.order[0], 0);
  });

  it('dijkstra relaxes distances', () => {
    const frames = dijkstra(star, 0);
    const dist = frames.at(-1).extra.dist;
    assert.equal(dist[0], 0);
    assert.equal(dist[1], 2);
    assert.equal(dist[3], 1);
  });

  it('prim builds tree n-1 edges', () => {
    const frames = prim(star, 0);
    assert.equal(frames.at(-1).extra.tree.length, 3);
  });

  it('kruskal builds tree', () => {
    const frames = kruskal(star);
    // connected component {0,1,2,3} → 3 edges; nodes 4–5 are isolated
    assert.equal(frames.at(-1).extra.tree.length, 3);
    // edges sorted: 0-3 (1), 0-1 (2), reject 1-3 (cycle), 0-2 (4) → cost 7
    assert.equal(frames.at(-1).extra.cost, 7);
  });
});

describe('dp', () => {
  it('fib', () => {
    const frames = fib(8);
    assert.match(frames.at(-1).message, /fib\(8\) = 21/);
  });

  it('coin change amount 11 coins 1,3,4 → 3', () => {
    const frames = coinChange(11, [1, 3, 4]);
    assert.match(frames.at(-1).message, /min coins for 11 = 3/);
  });

  it('lcs ABCBDAB / BDCABA → 4', () => {
    const frames = lcs('ABCBDAB', 'BDCABA');
    assert.match(frames.at(-1).message, /LCS length = 4/);
  });
});

describe('commands', () => {
  it('parses', () => {
    assert.deepEqual(parseCommand('set sort quick'), {
      name: 'set',
      args: ['sort', 'quick'],
    });
  });
});
