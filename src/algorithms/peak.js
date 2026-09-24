/**
 * Educational FFT / polynomial multiplication + matroid greedy + approximation.
 * Re-exports real RB and real FFT/suffix-tree from dedicated modules.
 */

import { redBlackInserts } from './redBlack.js';
import { polyMultiplyFft } from './fft.js';
import { suffixTreeMatch } from './suffixTree.js';

export { redBlackInserts, polyMultiplyFft, suffixTreeMatch };

/**
 * Naive polynomial multiply (ground-truth reference).
 * @param {number[]} a @param {number[]} b
 */
export function polyMultiply(a = [1, 2, 3], b = [4, 5, 6]) {
  return polyMultiplyFft(a, b);
}

/**
 * Greedy on a matroid (uniform matroid U_{k,n} = independent sets of size ≤ k).
 * Elements with weights; greedy picks max weight keeping independence.
 * @param {number[]} weights
 * @param {number} k
 */
export function matroidGreedy(weights = [8, 6, 5, 4, 3], k = 3) {
  const frames = [];
  const items = weights.map((w, id) => ({ id, w, chosen: false }));
  frames.push({
    type: 'info',
    message: `matroid greedy · U_{${k},${weights.length}} · sort by weight desc`,
    extra: { kind: 'matroid', items: items.map((x) => ({ ...x })), k, chosen: [] },
  });
  items.sort((x, y) => y.w - x.w);
  const chosen = [];
  for (const it of items) {
    frames.push({
      type: 'compare',
      message: `consider w=${it.w} · |chosen|=${chosen.length}/${k}`,
      extra: {
        kind: 'matroid',
        items: items.map((x) => ({ ...x, chosen: chosen.includes(x.id) })),
        k,
        chosen: chosen.slice(),
      },
    });
    if (chosen.length < k) {
      // hereditary + exchange: any set of size ≤ k is independent in uniform matroid
      it.chosen = true;
      chosen.push(it.id);
      frames.push({
        type: 'set',
        message: `take w=${it.w}`,
        extra: {
          kind: 'matroid',
          items: items.map((x) => ({ ...x, chosen: chosen.includes(x.id) })),
          k,
          chosen: chosen.slice(),
        },
      });
    } else {
      frames.push({
        type: 'info',
        message: `reject w=${it.w} (would break independence)`,
        extra: {
          kind: 'matroid',
          items: items.map((x) => ({ ...x, chosen: chosen.includes(x.id) })),
          k,
          chosen: chosen.slice(),
        },
      });
    }
  }
  const total = chosen.reduce((s, id) => s + weights[id], 0);
  frames.push({
    type: 'done',
    message: `basis weight = ${total} · greedy optimal on matroids`,
    extra: {
      kind: 'matroid',
      items: items.map((x) => ({ ...x, chosen: chosen.includes(x.id) })),
      k,
      chosen: chosen.slice(),
      total,
    },
  });
  return frames;
}

/**
 * Vertex cover 2-approx via maximal matching.
 * @param {any} graph
 */
export function vertexCover2Approx(graph) {
  const frames = [];
  const edges = graph.edges.map((e) => ({ ...e }));
  const covered = new Set();
  const matching = [];
  frames.push({
    type: 'info',
    message: `vertex cover 2-approx · maximal matching · O(E)`,
    extra: { kind: 'vc', covered: [], matching: [], nodes: graph.nodes, edges },
  });

  for (const e of edges) {
    if (covered.has(e.u) || covered.has(e.v)) continue;
    matching.push([e.u, e.v]);
    covered.add(e.u);
    covered.add(e.v);
    frames.push({
      type: 'relax',
      indices: [e.u, e.v],
      message: `match ${e.u}–${e.v} · add both endpoints`,
      extra: {
        kind: 'vc',
        covered: [...covered],
        matching: matching.map((m) => m.slice()),
        nodes: graph.nodes,
        edges,
      },
    });
  }

  frames.push({
    type: 'done',
    message: `cover size ${covered.size} ≤ 2·OPT · matching size ${matching.length} = lower bound OPT`,
    extra: {
      kind: 'vc',
      covered: [...covered],
      matching: matching.map((m) => m.slice()),
      nodes: graph.nodes,
      edges,
      approx: 2,
    },
  });
  return frames;
}

export const PEAK = {
  polyMultiply: polyMultiplyFft,
  matroidGreedy,
  vertexCover2Approx,
  redBlackInserts,
  suffixTreeMatch,
};
