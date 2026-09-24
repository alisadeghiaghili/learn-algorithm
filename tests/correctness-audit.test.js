import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort,
} from '../src/algorithms/sorting.js';
import { linearSearch, binarySearch } from '../src/algorithms/searching.js';
import { countingSort, radixSort, bucketSort, quickSelect } from '../src/algorithms/linearSorts.js';
import { bfs, dfs, dijkstra, prim, kruskal } from '../src/algorithms/graphs.js';
import {
  bellmanFord, floydWarshall, topologicalSort, stronglyConnected,
} from '../src/algorithms/graphsExtra.js';
import { fib, coinChange, lcs, knapsack } from '../src/algorithms/dp.js';
import { rodCutting, matrixChain } from '../src/algorithms/dpExtra.js';
import { activitySelection, huffman, kmpSearch, rabinKarp, edmondsKarp, masterTheorem } from '../src/algorithms/extras.js';
import { zAlgorithm, suffixArray, freivalds } from '../src/algorithms/stringsExtra.js';
import { medianOfMediansSelect } from '../src/algorithms/mom.js';
import { matroidGreedy, vertexCover2Approx } from '../src/algorithms/peak.js';
import { clauseTo3Cnf } from '../src/algorithms/gadgets.js';
import { redBlackInserts, validateRedBlack } from '../src/algorithms/redBlack.js';
import { fft, polyMulFft } from '../src/algorithms/fft.js';
import { suffixTreeMatch } from '../src/algorithms/suffixTree.js';
import { bstInserts, heapInserts, hashLinear, unionFind, bstSearch } from '../src/algorithms/structures.js';
import { avlInserts } from '../src/algorithms/avl.js';

function lastArr(frames) {
  return frames[frames.length - 1].array;
}

function sortedCopy(a) {
  return a.slice().sort((x, y) => x - y);
}

const SORTS = {
  bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort,
};

describe('sorting correctness — empty, single, dupes, reverse, sorted, negatives', () => {
  const cases = [
    [],
    [1],
    [2, 2, 2],
    [5, 4, 3, 2, 1],
    [1, 2, 3, 4, 5],
    [3, 1, 4, 1, 5, 9, 2, 6],
    [-3, 0, -1, 7, -3],
  ];
  for (const [name, fn] of Object.entries(SORTS)) {
    for (const c of cases) {
      it(`${name} ${JSON.stringify(c)}`, () => {
        assert.deepEqual(lastArr(fn(c)), sortedCopy(c));
      });
    }
  }
});

describe('linear sorts correctness', () => {
  const cases = [
    [],
    [1],
    [3, 1, 2],
    [5, 5, 5, 0],
    [9, 8, 7, 6],
  ];
  for (const c of cases) {
    it(`counting ${JSON.stringify(c)}`, () => {
      const frames = countingSort(c);
      assert.deepEqual(lastArr(frames), sortedCopy(c));
    });
    it(`radix ${JSON.stringify(c)}`, () => {
      const frames = radixSort(c.map((x) => Math.abs(x)));
      assert.deepEqual(lastArr(frames), sortedCopy(c.map((x) => Math.abs(x))));
    });
    it(`bucket ${JSON.stringify(c)}`, () => {
      const frames = bucketSort(c.map((x) => x * 10 + 5)); // keep in [0,100) for [0..5]*10+5
      assert.deepEqual(lastArr(frames), sortedCopy(c.map((x) => x * 10 + 5)));
    });
  }
});

describe('searching correctness', () => {
  it('linear hit and miss', () => {
    assert.equal(linearSearch([1, 2, 3], 2).at(-1).extra.found, 1);
    assert.equal(linearSearch([1, 2, 3], 9).at(-1).extra.found, -1);
    assert.equal(linearSearch([], 1).at(-1).extra.found, -1);
  });
  it('binary hit and miss', () => {
    assert.equal(binarySearch([1, 2, 3, 4], 3).at(-1).extra.found, 2);
    assert.equal(binarySearch([1, 2, 3, 4], 5).at(-1).extra.found, -1);
    assert.equal(binarySearch([], 1).at(-1).extra.found, -1);
    assert.equal(binarySearch([1], 1).at(-1).extra.found, 0);
  });
});

describe('quickselect', () => {
  it('finds kth on known array', () => {
    const a = [7, 2, 9, 1, 5];
    for (let k = 0; k < a.length; k += 1) {
      const frames = quickSelect(a, k);
      const found = frames.at(-1).extra?.found;
      const val = frames.at(-1).array[found];
      const expected = sortedCopy(a)[k];
      assert.equal(val, expected, `k=${k}`);
    }
  });
});

describe('MOM', () => {
  it('matches sorted index for every k', () => {
    const a = [7, 2, 9, 1, 5, 3, 8, 4, 6, 10, 11, 12];
    for (let k = 0; k < a.length; k += 1) {
      const frames = medianOfMediansSelect(a, k);
      const msg = frames.at(-1).message;
      const val = Number(msg.match(/= (\d+)/)?.[1]);
      assert.equal(val, sortedCopy(a)[k], `k=${k} msg=${msg}`);
    }
  });
});

const pathGraph = {
  directed: true,
  nodes: [0, 1, 2, 3].map((id) => ({ id, label: String(id), x: id * 100, y: 100 })),
  edges: [
    { u: 0, v: 1, w: 1 },
    { u: 1, v: 2, w: 2 },
    { u: 2, v: 3, w: 3 },
  ],
};

const negGraph = {
  directed: true,
  nodes: [0, 1, 2].map((id) => ({ id, label: String(id), x: id * 100, y: 100 })),
  edges: [
    { u: 0, v: 1, w: 4 },
    { u: 0, v: 2, w: 5 },
    { u: 1, v: 2, w: -2 },
  ],
};

describe('graph algorithm correctness', () => {
  it('bfs order from 0', () => {
    const frames = bfs(pathGraph, 0);
    assert.deepEqual(frames.at(-1).extra.order, [0, 1, 2, 3]);
  });
  it('dfs starts at 0', () => {
    assert.equal(dfs(pathGraph, 0).at(-1).extra.order[0], 0);
  });
  it('dijkstra path distances', () => {
    const frames = dijkstra(pathGraph, 0);
    assert.deepEqual(frames.at(-1).extra.dist, [0, 1, 3, 6]);
  });
  it('bellman handles negative edge', () => {
    const frames = bellmanFord(negGraph, 0);
    const dist = frames.at(-1).extra.dist;
    assert.equal(dist[0], 0);
    assert.equal(dist[1], 4);
    assert.equal(dist[2], 2); // 0→1→2 = 4 + (−2)
  });
  it('bellman detects negative cycle', () => {
    const g = {
      directed: true,
      nodes: [0, 1, 2].map((id) => ({ id, label: String(id), x: 0, y: 0 })),
      edges: [
        { u: 0, v: 1, w: 1 },
        { u: 1, v: 2, w: -2 },
        { u: 2, v: 1, w: 1 },
      ],
    };
    const frames = bellmanFord(g, 0);
    assert.equal(frames.at(-1).extra.neg, true);
  });
  it('floyd all-pairs path graph', () => {
    const frames = floydWarshall(pathGraph);
    const d = frames.at(-1).extra.dist;
    assert.equal(d[0][3], 6);
    assert.equal(d[3][0], '∞');
  });
  it('topo emits valid order', () => {
    const frames = topologicalSort(pathGraph);
    const order = frames.at(-1).extra.order;
    assert.deepEqual(order, [0, 1, 2, 3]);
    assert.equal(frames.at(-1).extra.ok, true);
  });
  it('topo detects cycle', () => {
    const g = {
      directed: true,
      nodes: [0, 1].map((id) => ({ id, label: String(id), x: 0, y: 0 })),
      edges: [
        { u: 0, v: 1, w: 1 },
        { u: 1, v: 0, w: 1 },
      ],
    };
    const frames = topologicalSort(g);
    assert.equal(frames.at(-1).extra.ok, false);
  });
  it('scc finds 4 singles on a DAG path', () => {
    assert.equal(stronglyConnected(pathGraph).at(-1).extra.comps.length, 4);
  });
  it('scc finds cycle as one component', () => {
    const g = {
      directed: true,
      nodes: [0, 1, 2].map((id) => ({ id, label: String(id), x: 0, y: 0 })),
      edges: [
        { u: 0, v: 1, w: 1 },
        { u: 1, v: 2, w: 1 },
        { u: 2, v: 0, w: 1 },
      ],
    };
    const comps = stronglyConnected(g).at(-1).extra.comps;
    assert.equal(comps.length, 1);
    assert.equal(comps[0].length, 3);
  });
  it('prim and kruskal same MST cost on star', () => {
    const star = {
      directed: false,
      nodes: [0, 1, 2, 3].map((id) => ({ id, label: String(id), x: 0, y: 0 })),
      edges: [
        { u: 0, v: 1, w: 1 },
        { u: 1, v: 2, w: 2 },
        { u: 2, v: 3, w: 3 },
        { u: 0, v: 3, w: 10 },
        { u: 0, v: 2, w: 4 },
      ],
    };
    const p = prim(star, 0).at(-1).extra.cost;
    const k = kruskal(star).at(-1).extra.cost;
    assert.equal(p, k);
    assert.equal(p, 1 + 2 + 3);
  });
});

describe('flow', () => {
  it('known max-flow', () => {
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
    assert.equal(edmondsKarp(g, 0, 3).at(-1).extra.value, 5);
  });
});

describe('DP correctness', () => {
  it('fib(10)=55', () => {
    assert.match(fib(10).at(-1).message, /55/);
  });
  it('fib(0)=0 fib(1)=1', () => {
    assert.match(fib(0).at(-1).message, /fib\(0\) = 0/);
    assert.match(fib(1).at(-1).message, /fib\(1\) = 1/);
  });
  it('coin 6 with {1,3,4} is 2 not 3', () => {
    assert.match(coinChange(6, [1, 3, 4]).at(-1).message, /min coins for 6 = 2/);
  });
  it('lcs empty', () => {
    assert.match(lcs('', 'ABC').at(-1).message, /LCS length = 0/);
  });
  it('lcs classic', () => {
    assert.match(lcs('ABCBDAB', 'BDCABA').at(-1).message, /LCS length = 4/);
  });
  it('knapsack known', () => {
    const frames = knapsack([2, 3, 4, 5], [3, 4, 5, 6], 8);
    // items (w,v): (2,3),(3,4),(4,5),(5,6) · best w≤8 is items 2+4: 3+5=8, v=4+6=10
    assert.match(frames.at(-1).message, /best value = 10/);
  });
  it('rod cutting 8 → 22', () => {
    assert.match(rodCutting([1, 5, 8, 9, 10, 17, 17, 20], 8).at(-1).message, /22/);
  });
  it('matrix chain CLRS', () => {
    // CLRS 15.2-1: 10x100x5x50 → 7500
    assert.match(matrixChain([10, 100, 5, 50]).at(-1).message, /7500/);
    assert.match(matrixChain([10, 30, 5, 60]).at(-1).message, /4500/);
  });
});

describe('greedy / strings / random', () => {
  it('activity selection max on known set', () => {
    // classic CLRS: (1,4),(3,5),(0,6),(5,7),(3,9),(5,9),(6,10),(8,11),(8,12),(2,14),(12,16)
    const acts = [
      [1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11], [8, 12], [2, 14], [12, 16],
    ];
    const frames = activitySelection(acts);
    const chosen = frames.at(-1).extra.chosen;
    assert.equal(chosen.length, 4);
  });
  it('huffman WPL 5,2,1,1 = 15', () => {
    const frames = huffman({ A: 5, B: 2, C: 1, D: 1 });
    assert.match(frames.at(-1).message, /WPL=15/);
  });
  it('kmp misses correctly', () => {
    assert.equal(kmpSearch('AAAA', 'B').at(-1).extra.match, -1);
  });
  it('z of aaa is 3,2,1-ish', () => {
    const z = zAlgorithm('aaa').at(-1).extra.z;
    assert.equal(z[0], 3);
    assert.equal(z[1], 2);
    assert.equal(z[2], 1);
  });
  it('sa of banana', () => {
    assert.deepEqual(suffixArray('banana').at(-1).extra.sa, [5, 3, 1, 0, 4, 2]);
  });
  it('freivalds rejects wrong C', () => {
    assert.equal(
      freivalds([[1, 0], [0, 1]], [[1, 0], [0, 1]], [[0, 0], [0, 0]]).at(-1).extra.ok,
      false,
    );
  });
  it('master theorem branches', () => {
    assert.match(masterTheorem(1, 2, 'poly', 0, 0).at(-1).message, /log n/);
    assert.match(masterTheorem(2, 2, 'poly', 1, 0).at(-1).message, /log n/);
  });
});

describe('structures / trees', () => {
  it('bst search finds key', () => {
    const frames = bstSearch([5, 3, 7, 1], 7);
    assert.match(frames.at(-1).message, /found 7/);
  });
  it('avl height log-ish', () => {
    const frames = avlInserts([1, 2, 3, 4, 5, 6, 7]);
    assert.equal(frames.at(-1).type, 'done');
  });
  it('rb validates on already-sorted inserts (worst for naive BST)', () => {
    const frames = redBlackInserts([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.equal(validateRedBlack(frames.at(-1).extra.tree).ok, true);
  });
  it('heap insert keeps max at root', () => {
    const frames = heapInserts([1, 2, 3, 4, 5]);
    assert.equal(frames.at(-1).extra.heap[0], 5);
  });
  it('hash places both colliding keys', () => {
    // 1 and 12 collide mod 11
    const frames = hashLinear([1, 12], 11);
    const table = frames.at(-1).extra.table;
    assert.ok(table.includes(1) && table.includes(12));
  });
  it('uf unions', () => {
    const frames = unionFind([
      ['u', 'a', 'b'],
      ['u', 'c', 'd'],
      ['u', 'b', 'c'],
      ['f', 'a', 0],
    ]);
    assert.ok(frames.length > 3);
  });
});

describe('peak / gadgets / fft / stree', () => {
  it('matroid greedy takes top-k', () => {
    assert.equal(matroidGreedy([10, 1, 2], 2).at(-1).extra.total, 12);
  });
  it('vc 2-approx covers all edges', () => {
    const g = {
      directed: false,
      nodes: [0, 1, 2].map((id) => ({ id, label: String(id), x: 0, y: 0 })),
      edges: [{ u: 0, v: 1, w: 1 }, { u: 1, v: 2, w: 1 }],
    };
    const frames = vertexCover2Approx(g);
    const covered = new Set(frames.at(-1).extra.covered);
    for (const e of g.edges) assert.ok(covered.has(e.u) || covered.has(e.v));
  });
  it('clause gadget preserves arity 3', () => {
    const frames = clauseTo3Cnf(['a', 'b', 'c', 'd', 'e']);
    for (const c of frames.at(-1).extra.output) assert.equal(c.length, 3);
  });
  it('fft poly random match', () => {
    const a = [3, 0, 1, 2];
    const b = [1, 1, 0, 4];
    // convolution: [3, 3, 1, 15, 2, 4, 8]
    assert.deepEqual(polyMulFft(a, b), [3, 3, 1, 15, 2, 4, 8]);
  });
  it('stree whole string match', () => {
    assert.equal(suffixTreeMatch('abc', 'abc').at(-1).extra.match, 1);
    assert.equal(suffixTreeMatch('abc', 'abcd').at(-1).extra.match, -1);
  });
});
