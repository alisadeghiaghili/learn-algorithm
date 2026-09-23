import { randomArray } from './types.js';

/**
 * Mutable playground state that player commands mutate.
 * Algorithms (auto) work on their own copies and emit frames;
 * manual levels mutate this state and emit a frame per player move.
 */
export class SandboxState {
  constructor() {
    this.kind = 'array'; // array | graph | matrix | tree
    this.array = randomArray(12);
    this.sorted = [];
    this.target = null;
    this.algo = 'bubble';
    this.mode = 'sort'; // sort | search | graph | dp | manual-sort | manual-search
    this.graph = this.defaultGraph();
    this.matrix = null;
    this.meta = {};
  }

  defaultGraph() {
    return {
      directed: false,
      nodes: [
        { id: 0, label: 'A', x: 120, y: 80 },
        { id: 1, label: 'B', x: 280, y: 60 },
        { id: 2, label: 'C', x: 420, y: 120 },
        { id: 3, label: 'D', x: 180, y: 220 },
        { id: 4, label: 'E', x: 360, y: 240 },
        { id: 5, label: 'F', x: 520, y: 200 },
      ],
      edges: [
        { u: 0, v: 1, w: 4 },
        { u: 0, v: 3, w: 2 },
        { u: 1, v: 2, w: 3 },
        { u: 1, v: 3, w: 5 },
        { u: 2, v: 4, w: 1 },
        { u: 2, v: 5, w: 6 },
        { u: 3, v: 4, w: 7 },
        { u: 4, v: 5, w: 2 },
      ],
    };
  }

  snapshot() {
    return structuredClone({
      kind: this.kind,
      array: this.array,
      sorted: this.sorted,
      target: this.target,
      algo: this.algo,
      mode: this.mode,
      graph: this.graph,
      matrix: this.matrix,
      meta: this.meta,
    });
  }

  /**
   * @param {ReturnType<SandboxState['snapshot']>} snap
   */
  restore(snap) {
    this.kind = snap.kind;
    this.array = snap.array;
    this.sorted = snap.sorted;
    this.target = snap.target;
    this.algo = snap.algo;
    this.mode = snap.mode;
    this.graph = snap.graph;
    this.matrix = snap.matrix;
    this.meta = snap.meta;
  }

  randomize(n = 12) {
    this.array = randomArray(Math.max(3, Math.min(24, n)));
    this.sorted = [];
  }

  setArray(values) {
    this.array = values.map((v) => Math.max(0, Math.round(Number(v))));
    this.sorted = this.sorted.filter((i) => i < this.array.length);
  }
}
