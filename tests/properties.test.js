import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  propertyCheckSorts,
  propertyCheckDistances,
  propertyCheckFft,
  propertyCheckMst,
  propertyCheckRb,
  propertyCheckSuffixTree,
  prng,
  randomArray,
} from '../src/testing/properties.js';

import {
  bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort,
} from '../src/algorithms/sorting.js';
import { countingSort, radixSort } from '../src/algorithms/linearSorts.js';
import { dijkstra, prim, kruskal } from '../src/algorithms/graphs.js';
import { bellmanFord } from '../src/algorithms/graphsExtra.js';
import { polyMulFft } from '../src/algorithms/fft.js';
import { redBlackInserts, validateRedBlack } from '../src/algorithms/redBlack.js';
import { suffixTreeMatch } from '../src/algorithms/suffixTree.js';
import { workedProblems, selfCheckWorked } from '../src/curriculum/worked.js';

function naiveMul(a, b) {
  const n = a.length + b.length - 1;
  const out = Array(n).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) out[i + j] += a[i] * b[j];
  }
  return out;
}

describe('property: sorts on random inputs', () => {
  it('all comparison + linear sorts match reference', () => {
    const failures = propertyCheckSorts({
      bubbleSort,
      selectionSort,
      insertionSort,
      mergeSort,
      quickSort,
      heapSort,
      countingSort,
      radixSort: (a) => radixSort(a.map((x) => x)), // now handles negatives
    });
    assert.deepEqual(failures, []);
  });
});

describe('property: Dijkstra = Bellman-Ford on non-neg graphs', () => {
  it('agree on 25 random digraphs', () => {
    const failures = propertyCheckDistances(dijkstra, bellmanFord);
    assert.deepEqual(failures, []);
  });
});

describe('property: FFT = naive convolution', () => {
  it('30 random poly pairs', () => {
    const failures = propertyCheckFft(polyMulFft, naiveMul);
    assert.deepEqual(failures, []);
  });
});

describe('property: Prim cost = Kruskal cost', () => {
  it('25 random undirected graphs', () => {
    const failures = propertyCheckMst(prim, kruskal);
    assert.deepEqual(failures, []);
  });
});

describe('property: red-black invariants under random inserts', () => {
  it('30 random key sequences', () => {
    const failures = propertyCheckRb(redBlackInserts, validateRedBlack);
    assert.deepEqual(failures, []);
  });
});

describe('property: suffix tree agrees with includes', () => {
  it('40 random text/pat over {a,b,c}', () => {
    const failures = propertyCheckSuffixTree(suffixTreeMatch);
    assert.deepEqual(failures, []);
  });
});

describe('worked problem set', () => {
  it('has ≥10 problems with solutions', () => {
    assert.ok(workedProblems.length >= 10);
    for (const p of workedProblems) {
      assert.ok(p.problem && p.solution && p.steps.length >= 2, p.id);
    }
  });

  it('selfCheck catches key numbers', () => {
    const p = workedProblems.find((x) => x.id === 'wp-sort-inv');
    const r = selfCheckWorked(p, 'There are 5 inversions and merge sort n log n counts them');
    assert.equal(r.ok, true);
    const bad = selfCheckWorked(p, 'sorts are fast');
    assert.equal(bad.ok, false);
  });

  it('covers main units', () => {
    const units = new Set(workedProblems.map((p) => p.unit));
    for (const u of ['sorting', 'graphs', 'dp', 'np', 'greedy', 'dc', 'structures', 'searching']) {
      assert.ok(units.has(u), u);
    }
  });
});

describe('prng is deterministic', () => {
  it('same seed same stream', () => {
    const a = prng(1);
    const b = prng(1);
    assert.equal(a(), b());
    assert.equal(a(), b());
    assert.deepEqual(randomArray(5, prng(3)), randomArray(5, prng(3)));
  });
});
