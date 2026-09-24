import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bellmanFord, floydWarshall, topologicalSort, stronglyConnected } from '../src/algorithms/graphsExtra.js';
import { rodCutting, matrixChain } from '../src/algorithms/dpExtra.js';
import { avlInserts } from '../src/algorithms/avl.js';
import { zAlgorithm, suffixArray, freivalds } from '../src/algorithms/stringsExtra.js';
import { cliquesFrom3sat } from '../src/algorithms/npBuild.js';

const dag = {
  directed: true,
  nodes: [0, 1, 2, 3].map((id) => ({ id, label: String.fromCharCode(65 + id), x: 0, y: 0 })),
  edges: [
    { u: 0, v: 1, w: 1 },
    { u: 0, v: 2, w: 1 },
    { u: 1, v: 3, w: 1 },
    { u: 2, v: 3, w: 1 },
  ],
};

describe('graphsExtra', () => {
  it('bellman-ford distances', () => {
    const frames = bellmanFord(dag, 0);
    assert.match(frames.at(-1).message, /distances|negative/);
  });
  it('floyd warshall', () => {
    const frames = floydWarshall(dag);
    assert.equal(frames.at(-1).type, 'done');
  });
  it('topo emits all', () => {
    const frames = topologicalSort(dag);
    assert.equal(frames.at(-1).extra.order.length, 4);
    assert.equal(frames.at(-1).extra.order[0], 0);
  });
  it('scc finds components', () => {
    const frames = stronglyConnected(dag);
    assert.equal(frames.at(-1).extra.comps.length, 4);
  });
});

describe('dpExtra', () => {
  it('rod cutting', () => {
    const frames = rodCutting([1, 5, 8, 9, 10, 17, 17, 20], 8);
    assert.match(frames.at(-1).message, /best revenue = 22/);
  });
  it('matrix chain', () => {
    const frames = matrixChain([10, 30, 5, 60]);
    // classic CLRS example scaled: 10x30 * 30x5 * 5x60 → 1500+3000=4500? actually min is 1500+3000=4500 or 30*5*60+10*30*60=9000+18000
    // best is (10x30*30x5)*(5x60) = 1500 + 3000 = 4500
    assert.match(frames.at(-1).message, /min multiplications = 4500/);
  });
});

describe('avl strings random npbuild', () => {
  it('avl runs and rotates', () => {
    const frames = avlInserts([30, 20, 10, 25, 28, 5, 40]);
    assert.ok(frames.some((f) => f.extra?.rotate));
  });
  it('z-algorithm', () => {
    const frames = zAlgorithm('aabxaab');
    assert.equal(frames.at(-1).type, 'done');
  });
  it('suffix array', () => {
    const frames = suffixArray('banana');
    assert.deepEqual(frames.at(-1).extra.sa, [5, 3, 1, 0, 4, 2]);
  });
  it('freivalds accepts correct product', () => {
    const frames = freivalds([[1, 2], [3, 4]], [[5, 6], [7, 8]], [[19, 22], [43, 50]]);
    assert.equal(frames.at(-1).extra.ok, true);
  });
  it('freivalds rejects wrong product', () => {
    const frames = freivalds([[1, 2], [3, 4]], [[5, 6], [7, 8]], [[0, 0], [0, 0]]);
    assert.equal(frames.at(-1).extra.ok, false);
  });
  it('np gadget builder', () => {
    const frames = cliquesFrom3sat({
      clauses: [
        ['x', 'y', 'z'],
        ['!x', 'y', 'w'],
      ],
    });
    assert.equal(frames.at(-1).extra.k, 2);
    assert.equal(frames.at(-1).extra.nodes.length, 6);
  });
});
