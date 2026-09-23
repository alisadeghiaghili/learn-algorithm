/**
 * Level definitions — sequenced like LearnGitBranching.
 *
 * Level shape:
 * {
 *   id, name, desc, par,
 *   kind: 'tutorial' | 'golf-sort' | 'golf-search' | 'golf-graph' | 'quiz',
 *   setup: { ... partial SandboxState },
 *   intro: string (markdown-lite),
 *   goal: string,
 *   win: (ctx) => boolean,
 *   onWin?: (ctx) => void
 * }
 */

/**
 * @typedef {Object} Level
 * @property {string} id
 * @property {string} name
 * @property {string} desc
 * @property {number} par
 * @property {string} kind
 * @property {object} setup
 * @property {string} intro
 * @property {string} goal
 * @property {(ctx: any) => boolean} win
 */

/** @type {Record<string, { name: string, blurb: string, levels: Level[] }>} */
export const sequences = {
  intro: {
    name: 'intro',
    blurb: 'What an algorithm step looks like',
    levels: [
      {
        id: 'intro-1',
        name: 'See a comparison',
        desc: 'Run bubble sort and watch compares/swaps',
        par: 2,
        kind: 'tutorial',
        setup: {
          kind: 'array',
          mode: 'sort',
          algo: 'bubble',
          array: [5, 2, 8, 1, 9],
          target: null,
        },
        intro:
          '<p>Every algorithm we study is a sequence of <strong>steps</strong>: compare, swap, visit, relax.</p>' +
          '<p>LearnAlgo turns those steps into frames you can play, pause, and step through.</p>' +
          '<ol><li>Set the algorithm: <code>set sort bubble</code></li>' +
          '<li>Generate steps: <code>run</code></li>' +
          '<li>Use play / step in the transport bar</li></ol>',
        goal: 'Run the algorithm once (type `run`) and finish the animation.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'intro-2',
        name: 'Your first golf',
        desc: 'Sort 3 cells with manual swaps',
        par: 1,
        kind: 'golf-sort',
        setup: {
          kind: 'array',
          mode: 'manual-sort',
          algo: 'manual',
          array: [3, 1, 2],
          target: null,
          sorted: [],
        },
        intro:
          '<p>Now <strong>you</strong> drive the steps. Each command counts as a golf move.</p>' +
          '<p>Sort the array ascending with <code>swap i j</code>.</p>' +
          '<p>Par is 1 swap — only one pair is out of order enough to fix in one move.</p>',
        goal: 'Make the array sorted with as few swaps as possible. Par = 1.',
        win: (ctx) => isSorted(ctx.state.array),
      },
      {
        id: 'intro-3',
        name: 'Compare costs',
        desc: 'Manual sort of 4 — think before you swap',
        par: 2,
        kind: 'golf-sort',
        setup: {
          kind: 'array',
          mode: 'manual-sort',
          algo: 'manual',
          array: [4, 3, 1, 2],
          target: null,
          sorted: [],
        },
        intro:
          '<p>Same idea, slightly harder. Use <code>compare i j</code> freely (free — not counted as golf if you want), then <code>swap</code>.</p>' +
          '<p>Actually: <em>every</em> command counts. Be surgical.</p>' +
          '<p>Hint: selection-sort style — put the min at the front first.</p>',
        goal: 'Sorted ascending. Par = 2 swaps.',
        win: (ctx) => isSorted(ctx.state.array),
      },
    ],
  },

  sorting: {
    name: 'sorting',
    blurb: 'Bubble → selection → insertion → merge → quick',
    levels: [
      {
        id: 'sort-bubble',
        name: 'Bubble golf',
        desc: 'Sort 5 by swapping adjacent pairs only',
        par: 6,
        kind: 'golf-sort',
        setup: {
          kind: 'array',
          mode: 'manual-sort',
          algo: 'bubble',
          array: [5, 1, 4, 2, 8],
          sorted: [],
        },
        intro:
          '<p>Bubble sort only swaps <strong>adjacent</strong> cells. In golf mode you may still swap any pair — but the par assumes adjacent-only strategy.</p>' +
          '<p>Watch the auto version: <code>set sort bubble</code> · <code>run</code>.</p>' +
          '<p>Then reset and sort by hand.</p>',
        goal: 'Array sorted. Par = 6 (inversion count of the start).',
        win: (ctx) => isSorted(ctx.state.array),
      },
      {
        id: 'sort-selection',
        name: 'Selection mindset',
        desc: 'Place each minimum into position',
        par: 3,
        kind: 'golf-sort',
        setup: {
          kind: 'array',
          mode: 'manual-sort',
          algo: 'selection',
          array: [7, 3, 9, 1, 5],
          sorted: [],
        },
        intro:
          '<p>Selection sort: find the minimum of the unsorted suffix, swap it into place.</p>' +
          '<p>Three out-of-place minima → par 3.</p>',
        goal: 'Sorted ascending. Par = 3 swaps.',
        win: (ctx) => isSorted(ctx.state.array),
      },
      {
        id: 'sort-insertion',
        name: 'Insertion run',
        desc: 'Nearly sorted — insertion wins',
        par: 2,
        kind: 'golf-sort',
        setup: {
          kind: 'array',
          mode: 'manual-sort',
          algo: 'insertion',
          array: [1, 2, 4, 3, 5],
          sorted: [],
        },
        intro:
          '<p>This input is almost sorted — insertion sort’s best case.</p>' +
          '<p>One adjacent inversion pair. Fix it in 1–2 moves.</p>',
        goal: 'Sorted ascending. Par = 1 swap.',
        win: (ctx) => isSorted(ctx.state.array),
      },
      {
        id: 'sort-merge',
        name: 'Merge audit',
        desc: 'Run merge sort and read the divide tree',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'array',
          mode: 'sort',
          algo: 'merge',
          array: [38, 27, 43, 3, 9, 82, 10],
          sorted: [],
        },
        intro:
          '<p>Merge sort is divide &amp; conquer: split, sort halves, merge.</p>' +
          '<p>Step through and note the Θ(n log n) shape — depth log n, merge work n per level.</p>',
        goal: 'Run merge sort to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 5,
      },
      {
        id: 'sort-quick',
        name: 'Pivot intuition',
        desc: 'Run quicksort; pivot lands correctly',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'array',
          mode: 'sort',
          algo: 'quick',
          array: [9, 3, 7, 1, 8, 2, 5],
          sorted: [],
        },
        intro:
          '<p>Quicksort partitions around a pivot: left &lt; pivot ≤ right.</p>' +
          '<p>Average O(n log n). Worst O(n²) when pivots are consistently bad.</p>',
        goal: 'Run quicksort to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 5,
      },
    ],
  },

  searching: {
    name: 'searching',
    blurb: 'Linear scan vs binary search',
    levels: [
      {
        id: 'search-linear',
        name: 'Linear probe',
        desc: 'Find target 7 by probing indices',
        par: 4,
        kind: 'golf-search',
        setup: {
          kind: 'array',
          mode: 'manual-search',
          algo: 'linear',
          array: [4, 7, 1, 9, 3, 8],
          target: 7,
          sorted: [],
        },
        intro:
          '<p>Linear search checks cells left to right until a hit.</p>' +
          '<p>Golf: use <code>probe i</code> until you know where the target is, then the level completes when a probe hits.</p>' +
          '<p>Target is 7 at index 1 — par assumes you don’t waste probes on the right.</p>',
        goal: 'Hit the target with `probe`. Par = 2 probes (smart) / 4 if scanning blindly after wrong starts.',
        win: (ctx) =>
          ctx.engine.frames.some(
            (f) => f.type === 'done' && f.extra && f.extra.found === ctx.state.array.indexOf(ctx.state.target),
          ) || ctx.engine.frames.some((f) => f.extra && f.extra.mid != null && ctx.state.array[f.extra.mid] === ctx.state.target),
      },
      {
        id: 'search-binary',
        name: 'Binary search golf',
        desc: 'Sorted array · target 23 · cut the range',
        par: 3,
        kind: 'golf-search',
        setup: {
          kind: 'array',
          mode: 'manual-search',
          algo: 'binary',
          array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
          target: 23,
          sorted: [],
          meta: { lo: 0, hi: 9, mid: 4 },
        },
        intro:
          '<p>Binary search halves the window each probe. Input is sorted.</p>' +
          '<p>Commands:</p>' +
          '<ul><li><code>probe mid</code> — check middle of current window</li>' +
          '<li><code>lo mid+1</code> / <code>hi mid-1</code> — shrink window</li></ul>' +
          '<p>Start window is [0..9], mid = 4. Target = 23.</p>',
        goal: 'Find 23 by probing. Par = 3 probes.',
        win: (ctx) => {
          const arr = ctx.state.array;
          return ctx.engine.frames.some((f) => {
            const mid = f.extra?.mid ?? (f.indices && f.indices[0]);
            return mid != null && arr[mid] === ctx.state.target;
          });
        },
      },
    ],
  },

  graphs: {
    name: 'graphs',
    blurb: 'BFS, DFS, Dijkstra, MST',
    levels: [
      {
        id: 'graph-bfs',
        name: 'BFS order',
        desc: 'Visit in breadth-first order from S',
        par: 6,
        kind: 'golf-graph',
        setup: {
          kind: 'graph',
          mode: 'manual-graph',
          algo: 'bfs',
          graph: null, // filled by loader with star preset
          meta: { visited: [], tree: [], source: 0, order: [] },
        },
        intro:
          '<p>Breadth-first search visits nodes level by level from source <code>S</code>.</p>' +
          '<p>Use <code>visit ID</code> with node ids 0..5 (S=0). Visit children of S before grandchildren.</p>' +
          '<p>Compare with <code>set graph bfs</code> · <code>run</code>.</p>',
        goal: 'Visit all 6 nodes in valid BFS order (children of a node before deeper nodes).',
        win: (ctx) => isBfsOrder(ctx),
      },
      {
        id: 'graph-dfs',
        name: 'DFS order',
        desc: 'Depth-first from S on the same star',
        par: 6,
        kind: 'golf-graph',
        setup: {
          kind: 'graph',
          mode: 'manual-graph',
          algo: 'dfs',
          graph: null,
          meta: { visited: [], tree: [], source: 0, order: [] },
        },
        intro:
          '<p>DFS dives deep along one path before backtracking.</p>' +
          '<p>Same graph as BFS — different visit order. Use <code>visit ID</code>.</p>',
        goal: 'Visit all nodes in a valid DFS order from S.',
        win: (ctx) => isDfsOrder(ctx),
      },
      {
        id: 'graph-mst',
        name: 'Build an MST',
        desc: 'Pick edges to span the star graph cheaply',
        par: 5,
        kind: 'golf-graph',
        setup: {
          kind: 'graph',
          mode: 'manual-graph',
          algo: 'prim',
          graph: null,
          meta: { visited: [], tree: [], source: 0 },
        },
        intro:
          '<p>Minimum spanning tree: connect all nodes, no cycles, min total weight.</p>' +
          '<p>Use <code>pick u v</code> to add an edge. 6 nodes → 5 edges needed.</p>' +
          '<p>Weights are on the edges. Prefer cheap edges (Kruskal/Prim intuition).</p>',
        goal: 'Pick 5 edges that form a tree covering all 6 nodes. Prefer min total weight.',
        win: (ctx) => isSpanningTree(ctx),
      },
    ],
  },

  dp: {
    name: 'dynamic programming',
    blurb: 'Fib, coins, LCS, knapsack',
    levels: [
      {
        id: 'dp-fib',
        name: 'Fill fib',
        desc: 'Run bottom-up Fibonacci',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'matrix',
          mode: 'dp',
          algo: 'fib',
          array: [],
          meta: {},
        },
        intro:
          '<p>DP = reuse subproblem answers.</p>' +
          '<p>fib(n) = fib(n-1) + fib(n-2) with a table instead of naive recursion.</p>' +
          '<p><code>set dp fib</code> · <code>run</code></p>',
        goal: 'Run fib DP to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 4,
      },
      {
        id: 'dp-coin',
        name: 'Coin change table',
        desc: 'Watch dp[x] fill for amount 11',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'matrix',
          mode: 'dp',
          algo: 'coin',
          array: [],
          meta: {},
        },
        intro:
          '<p>Unlimited coins {1,3,4}, amount 11.</p>' +
          '<p>dp[x] = fewest coins that sum to x.</p>' +
          '<p><code>set dp coin</code> · <code>run</code></p>',
        goal: 'Run coin change DP to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 4,
      },
      {
        id: 'dp-lcs',
        name: 'LCS grid',
        desc: 'Longest common subsequence table',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'matrix',
          mode: 'dp',
          algo: 'lcs',
          array: [],
          meta: {},
        },
        intro:
          '<p>LCS(A,B) via a 2D table. Match → diagonal+1; else max(top, left).</p>' +
          '<p><code>set dp lcs</code> · <code>run</code></p>',
        goal: 'Run LCS to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 4,
      },
    ],
  },

  complexity: {
    name: 'complexity',
    blurb: 'Growth rates under pressure',
    levels: [
      {
        id: 'cmp-1',
        name: 'Name that growth',
        desc: 'Quiz: match algorithm to complexity',
        par: 4,
        kind: 'quiz',
        setup: {
          kind: 'array',
          mode: 'quiz',
          algo: 'bubble',
          array: [0],
          meta: { answers: {} },
        },
        intro:
          '<p>Answer via the console: <code>answer 1 b</code> style, or use the buttons in the side panel.</p>' +
          '<p>1. bubble sort worst? 2. binary search? 3. merge sort? 4. Dijkstra (binary heap)?</p>' +
          '<p>Choices: a) O(n) b) O(n²) c) O(n log n) d) O(log n) e) O((V+E) log V)</p>',
        goal: 'All 4 answers correct.',
        win: (ctx) => quizDone(ctx),
      },
    ],
  },
};

export const sequenceOrder = [
  'intro',
  'sorting',
  'searching',
  'graphs',
  'dp',
  'complexity',
];

/**
 * @param {string} id
 */
export function findLevel(id) {
  for (const seq of Object.values(sequences)) {
    const lv = seq.levels.find((l) => l.id === id);
    if (lv) return lv;
  }
  return null;
}

export function allLevels() {
  return sequenceOrder.flatMap((k) => sequences[k].levels);
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i - 1] > arr[i]) return false;
  }
  return arr.length > 0;
}

function isBfsOrder(ctx) {
  const order = ctx.state.meta.order || orderFromVisits(ctx);
  if (order.length < 6) return false;
  // children of S (ids of neighbors of 0) must appear before non-neighbors deeper
  // Valid BFS: first node is 0; then all distance-1 nodes (any order); then distance-2.
  const dist = bfsDist(ctx.state.graph, 0);
  let last = -1;
  for (const id of order) {
    const d = dist[id] ?? 99;
    if (d < last) return false;
    last = d;
  }
  return order[0] === 0 && order.length === 6;
}

function isDfsOrder(ctx) {
  const order = orderFromVisits(ctx);
  if (order.length < 6 || order[0] !== 0) return false;
  // any DFS preorder of connected undirected graph is fine if we only require validity of stack order
  // weaker check: visited set complete and started at S
  return new Set(order).size === 6;
}

function orderFromVisits(ctx) {
  // reconstruct from visit frames
  return ctx.engine.frames
    .filter((f) => f.type === 'visit')
    .map((f) => f.indices[0])
    .filter((id, i, arr) => arr.indexOf(id) === i);
}

function isSpanningTree(ctx) {
  const tree = ctx.state.meta.tree || [];
  const n = ctx.state.graph.nodes.length;
  if (tree.length !== n - 1) return false;
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  for (const [u, v] of tree) {
    const ru = find(u);
    const rv = find(v);
    if (ru === rv) return false;
    parent[ru] = rv;
  }
  const roots = new Set(Array.from({ length: n }, (_, i) => find(i)));
  return roots.size === 1;
}

function bfsDist(graph, source) {
  const adj = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const e of graph.edges) {
    adj[e.u].push(e.v);
    if (!graph.directed) adj[e.v].push(e.u);
  }
  const dist = { [source]: 0 };
  const q = [source];
  while (q.length) {
    const u = q.shift();
    for (const v of adj[u]) {
      if (dist[v] == null) {
        dist[v] = dist[u] + 1;
        q.push(v);
      }
    }
  }
  return dist;
}

function quizDone(ctx) {
  const a = ctx.state.meta.answers || {};
  return a['1'] === 'b' && a['2'] === 'd' && a['3'] === 'c' && a['4'] === 'e';
}

export const QUIZ_ANSWERS = {
  1: 'b',
  2: 'd',
  3: 'c',
  4: 'e',
};

export const QUIZ_TEXT = {
  1: 'bubble sort worst case',
  2: 'binary search',
  3: 'merge sort',
  4: 'Dijkstra with binary heap',
};
