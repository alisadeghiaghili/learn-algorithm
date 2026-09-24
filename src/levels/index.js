/**
 * Level definitions — full algorithms curriculum, LGB-style sequenced challenges.
 *
 * Level shape:
 * {
 *   id, name, desc, par,
 *   kind: 'tutorial' | 'golf-sort' | 'golf-search' | 'golf-graph' | 'quiz' | 'theory-run' | 'analysis',
 *   setup: { ... partial SandboxState },
 *   intro: string (html),
 *   goal: string,
 *   win: (ctx) => boolean,
 * }
 */

/** @type {Record<string, { name: string, blurb: string, levels: any[] }>} */
export const sequences = {
  intro: {
    name: 'intro',
    blurb: 'Step model, first golf, complexity intuition',
    levels: [
      {
        id: 'intro-1',
        name: 'See a comparison',
        desc: 'Run bubble sort and watch compares/swaps',
        par: 2,
        kind: 'tutorial',
        setup: { kind: 'array', mode: 'sort', algo: 'bubble', array: [5, 2, 8, 1, 9], target: null },
        intro:
          '<p>Every algorithm is a sequence of <strong>steps</strong>: compare, swap, visit, relax.</p>' +
          '<ol><li><code>set sort bubble</code></li><li><code>run</code></li><li>play / step</li></ol>',
        goal: 'Run the algorithm once (`run`) and finish the animation.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'intro-2',
        name: 'Your first golf',
        desc: 'Sort 3 cells with manual swaps',
        par: 1,
        kind: 'golf-sort',
        setup: { kind: 'array', mode: 'manual-sort', algo: 'manual', array: [3, 1, 2], target: null, sorted: [] },
        intro:
          '<p>You drive the steps. Each command counts as a golf move.</p>' +
          '<p>Sort ascending with <code>swap i j</code>. Par = 1.</p>',
        goal: 'Sorted with as few swaps as possible. Par = 1.',
        win: (ctx) => isSorted(ctx.state.array),
      },
      {
        id: 'intro-3',
        name: 'Compare costs',
        desc: 'Manual sort of 4 — think before you swap',
        par: 2,
        kind: 'golf-sort',
        setup: { kind: 'array', mode: 'manual-sort', algo: 'manual', array: [4, 3, 1, 2], target: null, sorted: [] },
        intro:
          '<p>Selection-sort mindset: put the min at the front first.</p><p>Par = 2 swaps.</p>',
        goal: 'Sorted ascending. Par = 2 swaps.',
        win: (ctx) => isSorted(ctx.state.array),
      },
      {
        id: 'intro-4',
        name: 'Name that growth',
        desc: 'Asymptotics quiz (O / Θ / classes)',
        par: 3,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'asym', array: [0], meta: { answers: {} } },
        intro:
          '<p>Read <code>lesson asymptotics</code> first.</p>' +
          '<p>Answer with <code>answer 1 b</code> (choice letter).</p>' +
          '<ol><li>3n²+n log n+5 is … a) O(n) b) O(n²) c) O(n² log n) d) O(n³)</li>' +
          '<li>log(n!) is … a) Θ(log n) b) Θ(n) c) Θ(n log n) d) Θ(n²)</li>' +
          '<li>f=O(g), g=O(h) ⇒ f=… a) O(h) b) Ω(h) c) Θ(h) d) none</li></ol>',
        goal: 'All 3 correct. Answers: 1=b, 2=c, 3=a',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'c' && a['3'] === 'a';
        },
      },
    ],
  },

  asymptotics: {
    name: 'asymptotics & recurrences',
    blurb: 'Big-O, Master Theorem, substitution',
    levels: [
      {
        id: 'asym-1',
        name: 'Master Theorem I',
        desc: 'Classify 4T(n/2)+Θ(n)',
        par: 1,
        kind: 'theory-run',
        setup: {
          kind: 'matrix', mode: 'theory', algo: 'master', array: [],
          meta: { a: 4, b: 2, fPower: 1, logPow: 0 },
        },
        intro:
          '<p><code>lesson recurrences</code></p><p>Run the Master Theorem evaluator: <code>run</code>.</p>' +
          '<p>Check: case 1 → Θ(n²).</p>',
        goal: 'Run MT on 4T(n/2)+n and confirm case 1.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length >= 2,
      },
      {
        id: 'asym-2',
        name: 'Master Theorem II',
        desc: 'Classify 2T(n/2)+Θ(n log n)',
        par: 1,
        kind: 'theory-run',
        setup: {
          kind: 'matrix', mode: 'theory', algo: 'master', array: [],
          meta: { a: 2, b: 2, fPower: 1, logPow: 1 },
        },
        intro: '<p>Case 2 with k=1 → Θ(n (log n)²). Run to verify.</p>',
        goal: 'Run MT and confirm case 2.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length >= 2,
      },
      {
        id: 'asym-3',
        name: 'Recurrence exam',
        desc: '4 Master Theorem questions',
        par: 4,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'rec', array: [0], meta: { answers: {} } },
        intro:
          '<ol>' +
          '<li>4T(n/2)+Θ(n) → a) Θ(n) b) Θ(n log n) c) Θ(n²) d) Θ(n² log n)</li>' +
          '<li>2T(n/2)+Θ(n log n) → a) Θ(n log n) b) Θ(n log² n) c) Θ(n²) d) Θ(n)</li>' +
          '<li>T(n/2)+Θ(1) → a) Θ(1) b) Θ(log n) c) Θ(n) d) Θ(n log n)</li>' +
          '<li>3T(n/2)+Θ(n) → a) Θ(n) b) Θ(n^{log₂3}) c) Θ(n²) d) Θ(n log n)</li>' +
          '</ol><p>Answers via <code>answer 1 c</code> etc.</p>',
        goal: 'All 4 correct (c, b, b, b).',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'c' && a['2'] === 'b' && a['3'] === 'b' && a['4'] === 'b';
        },
      },
    ],
  },

  sorting: {
    name: 'sorting',
    blurb: 'Comparison sorts, linear sorts, theory',
    levels: [
      {
        id: 'sort-bubble',
        name: 'Bubble golf',
        desc: 'Sort 5 by swapping',
        par: 6,
        kind: 'golf-sort',
        setup: { kind: 'array', mode: 'manual-sort', algo: 'bubble', array: [5, 1, 4, 2, 8], sorted: [] },
        intro: '<p>Par = inversion count of start. <code>lesson sorting</code></p>',
        goal: 'Sorted. Par = 6.',
        win: (ctx) => isSorted(ctx.state.array),
      },
      {
        id: 'sort-selection',
        name: 'Selection mindset',
        desc: 'Place each minimum',
        par: 3,
        kind: 'golf-sort',
        setup: { kind: 'array', mode: 'manual-sort', algo: 'selection', array: [7, 3, 9, 1, 5], sorted: [] },
        intro: '<p>Find min of suffix, swap into place. Par = 3.</p>',
        goal: 'Sorted. Par = 3.',
        win: (ctx) => isSorted(ctx.state.array),
      },
      {
        id: 'sort-insertion',
        name: 'Insertion run',
        desc: 'Nearly sorted — insertion wins',
        par: 1,
        kind: 'golf-sort',
        setup: { kind: 'array', mode: 'manual-sort', algo: 'insertion', array: [1, 2, 4, 3, 5], sorted: [] },
        intro: '<p>One adjacent inversion. Best case of insertion is Θ(n).</p>',
        goal: 'Sorted. Par = 1.',
        win: (ctx) => isSorted(ctx.state.array),
      },
      {
        id: 'sort-merge',
        name: 'Merge audit',
        desc: 'Run merge sort · Θ(n log n)',
        par: 1,
        kind: 'tutorial',
        setup: { kind: 'array', mode: 'sort', algo: 'merge', array: [38, 27, 43, 3, 9, 82, 10], sorted: [] },
        intro: '<p>Divide &amp; conquer. Depth log n, work n per level.</p>',
        goal: 'Run merge sort to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 5,
      },
      {
        id: 'sort-quick',
        name: 'Pivot intuition',
        desc: 'Run quicksort',
        par: 1,
        kind: 'tutorial',
        setup: { kind: 'array', mode: 'sort', algo: 'quick', array: [9, 3, 7, 1, 8, 2, 5], sorted: [] },
        intro: '<p>Partition around pivot. Avg O(n log n), worst O(n²).</p>',
        goal: 'Run quicksort to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 5,
      },
      {
        id: 'sort-heap',
        name: 'Heap sort',
        desc: 'Build heap + extract max',
        par: 1,
        kind: 'tutorial',
        setup: { kind: 'array', mode: 'sort', algo: 'heap', array: [12, 3, 9, 1, 7, 4, 8], sorted: [] },
        intro: '<p>Θ(n log n) worst-case, in-place. Contrast with quicksort.</p>',
        goal: 'Run heap sort to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 5,
      },
      {
        id: 'sort-counting',
        name: 'Counting sort',
        desc: 'Θ(n+k) non-comparison',
        par: 1,
        kind: 'tutorial',
        setup: { kind: 'array', mode: 'sort', algo: 'counting', array: [4, 2, 2, 8, 3, 3, 1], sorted: [] },
        intro:
          '<p><code>lesson linearSorts</code></p><p>Count → prefix → stable scatter.</p>' +
          '<p>Evades Ω(n log n) by using key values.</p>',
        goal: 'Run counting sort to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'sort-radix',
        name: 'Radix LSD',
        desc: 'Digit-by-digit counting',
        par: 1,
        kind: 'tutorial',
        setup: { kind: 'array', mode: 'sort', algo: 'radix', array: [170, 45, 75, 90, 802, 24, 2, 66], sorted: [] },
        intro: '<p>O(d(n+k)). Must use a <em>stable</em> base sort.</p>',
        goal: 'Run radix sort to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'sort-theory',
        name: 'Sorts exam',
        desc: 'Lower bound, stability, complexity',
        par: 4,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'sortq', array: [0], meta: { answers: {} } },
        intro:
          '<ol><li>Worst-case quicksort (last pivot)? a) Θ(n log n) b) Θ(n²) c) Θ(n) d) Θ(log n)</li>' +
          '<li>Stable + Θ(n log n) worst? a) heap b) quick c) merge d) selection</li>' +
          '<li>Comparison lower bound? a) Ω(n) b) Ω(n log n) c) Ω(n²) d) Ω(log n)</li>' +
          '<li>Counting sort? a) O(n log n) b) O(n+k) c) O(nk) d) O(k log k)</li></ol>',
        goal: 'All 4 correct (b, c, b, b).',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'c' && a['3'] === 'b' && a['4'] === 'b';
        },
      },
    ],
  },

  searching: {
    name: 'searching & selection',
    blurb: 'Binary search, order statistics',
    levels: [
      {
        id: 'search-linear',
        name: 'Linear probe',
        desc: 'Find target 7',
        par: 2,
        kind: 'golf-search',
        setup: {
          kind: 'array', mode: 'manual-search', algo: 'linear',
          array: [4, 7, 1, 9, 3, 8], target: 7, sorted: [], meta: {},
        },
        intro: '<p><code>probe i</code> until you hit the target.</p>',
        goal: 'Hit the target with `probe`.',
        win: (ctx) => {
          const arr = ctx.state.array;
          return ctx.engine.frames.some((f) => {
            const mid = f.extra?.mid ?? (f.indices && f.indices[0]);
            return mid != null && arr[mid] === ctx.state.target;
          });
        },
      },
      {
        id: 'search-binary',
        name: 'Binary search golf',
        desc: 'Sorted · target 23 · cut the range',
        par: 3,
        kind: 'golf-search',
        setup: {
          kind: 'array', mode: 'manual-search', algo: 'binary',
          array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 23, sorted: [],
          meta: { lo: 0, hi: 9, mid: 4 },
        },
        intro:
          '<p><code>probe mid</code> · <code>lo mid+1</code> · <code>hi mid-1</code></p>' +
          '<p>Invariant: target ∈ a[lo..hi] if present. O(log n).</p>',
        goal: 'Find 23. Par = 3 probes.',
        win: (ctx) => {
          const arr = ctx.state.array;
          return ctx.engine.frames.some((f) => {
            const mid = f.extra?.mid ?? (f.indices && f.indices[0]);
            return mid != null && arr[mid] === ctx.state.target;
          });
        },
      },
      {
        id: 'search-select',
        name: 'Order statistic',
        desc: 'Randomized select k-th smallest',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'array', mode: 'search', algo: 'select', array: [7, 2, 9, 1, 5, 3, 8], meta: { k: 2 },
        },
        intro:
          '<p><code>lesson searchingSelection</code></p><p>Expected Θ(n) randomized select; MOM is worst-case Θ(n).</p>',
        goal: 'Run select to find the k-th element.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.some((f) => f.extra?.found != null),
      },
      {
        id: 'search-theory',
        name: 'Search exam',
        desc: 'Preconditions and costs',
        par: 2,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'sq', array: [0], meta: { answers: {} } },
        intro:
          '<ol><li>Binary search precondition? a) random input b) sorted c) positive d) distinct</li>' +
          '<li>MOM guarantees? a) expected O(n) b) worst O(n) c) O(n log n) d) O(log n)</li></ol>' +
          '<p>Answers: 1=b, 2=b</p>',
        goal: 'Both correct.',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'b';
        },
      },
    ],
  },

  structures: {
    name: 'data structures',
    blurb: 'BST, heap, union-find, hash',
    levels: [
      {
        id: 'ds-bst',
        name: 'BST inserts',
        desc: 'Watch the search tree form',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'ds', algo: 'bst',
          array: [], meta: { keys: [8, 3, 10, 1, 6, 14, 4, 7, 13] },
        },
        intro:
          '<p><code>lesson dataStructures</code></p><p>Invariant: left &lt; node &lt; right. Unbalanced → h = Θ(n).</p>',
        goal: 'Run BST construction and read the final height.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'ds-heap',
        name: 'Heap sift-up',
        desc: 'Build a max-heap',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'ds', algo: 'heap',
          array: [], meta: { keys: [20, 15, 8, 10, 7, 6, 3] },
        },
        intro: '<p>Array-backed complete binary tree. Insert O(log n). Build-heap O(n).</p>',
        goal: 'Run heap inserts to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'ds-uf',
        name: 'Union-Find',
        desc: 'Path compression + rank',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'ds', algo: 'uf', array: [], meta: {},
        },
        intro:
          '<p>Amortized O(α(n)). Used by Kruskal.</p>' +
          '<p>Watch FIND paths flatten after compression.</p>',
        goal: 'Run union-find ops to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'ds-hash',
        name: 'Hash collisions',
        desc: 'Linear probing table',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'ds', algo: 'hash', array: [], meta: {},
        },
        intro:
          '<p>h(k)=k mod 11. Expected O(1+α). Open addressing needs α&lt;1.</p>',
        goal: 'Run hash inserts to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'ds-avl',
        name: 'AVL rotations',
        desc: 'LL/RR/LR/RL rebalance',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'ds', algo: 'avl', array: [],
          meta: { keys: [10, 20, 30, 25, 28, 5, 40] },
        },
        intro: '<p><code>lesson avl</code></p><p>Balance factor in {−1,0,1}. Rotations are O(1).</p>',
        goal: 'Run AVL inserts and observe rotations.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.some((f) => f.extra?.rotate),
      },
      {
        id: 'ds-theory',
        name: 'Structures exam',
        desc: 'Costs and invariants',
        par: 4,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'dsq', array: [0], meta: { answers: {} } },
        intro:
          '<ol><li>Heap insert? a) O(1) b) O(log n) c) O(n) d) O(n log n)</li>' +
          '<li>UF amortized? a) O(1) b) O(log n) c) O(α(n)) d) O(n)</li>' +
          '<li>Unbalanced BST search? a) O(log n) b) O(n) c) O(n log n) d) O(1)</li>' +
          '<li>Build-heap? a) O(n log n) b) O(n) c) O(n²) d) O(log n)</li></ol>',
        goal: 'All 4 correct (b, c, b, b).',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'c' && a['3'] === 'b' && a['4'] === 'b';
        },
      },
    ],
  },

  graphs: {
    name: 'graphs',
    blurb: 'BFS/DFS, shortest paths, MST, flow',
    levels: [
      {
        id: 'graph-bfs',
        name: 'BFS order',
        desc: 'Visit level-by-level from S',
        par: 6,
        kind: 'golf-graph',
        setup: {
          kind: 'graph', mode: 'manual-graph', algo: 'bfs', graph: null,
          meta: { visited: [], tree: [], source: 0, order: [] },
        },
        intro: '<p><code>visit ID</code> · children of S before deeper nodes.</p><p><code>lesson graphsTheory</code></p>',
        goal: 'Visit all 6 nodes in valid BFS order from S.',
        win: (ctx) => isBfsOrder(ctx),
      },
      {
        id: 'graph-dfs',
        name: 'DFS order',
        desc: 'Depth-first from S',
        par: 6,
        kind: 'golf-graph',
        setup: {
          kind: 'graph', mode: 'manual-graph', algo: 'dfs', graph: null,
          meta: { visited: [], tree: [], source: 0, order: [] },
        },
        intro: '<p>Dive deep before backtracking.</p>',
        goal: 'Visit all nodes in a valid DFS order from S.',
        win: (ctx) => isDfsOrder(ctx),
      },
      {
        id: 'graph-mst',
        name: 'Build an MST',
        desc: 'Pick 5 edges · min total weight',
        par: 5,
        kind: 'golf-graph',
        setup: {
          kind: 'graph', mode: 'manual-graph', algo: 'prim', graph: null,
          meta: { visited: [], tree: [], source: 0 },
        },
        intro:
          '<p>Cut property: lightest crossing edge is safe.</p><p><code>pick u v</code></p><p><code>lesson mst</code></p>',
        goal: 'Pick 5 edges forming a spanning tree. Prefer min weight.',
        win: (ctx) => isSpanningTree(ctx),
      },
      {
        id: 'graph-dijkstra',
        name: 'Dijkstra run',
        desc: 'Non-negative single-source',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'graph', mode: 'graph', algo: 'dijkstra', graph: null, meta: {},
        },
        intro:
          '<p>Settle-once invariant. Fails on negative edges.</p><p><code>set graph dijkstra</code> · <code>run</code></p><p><code>lesson shortestPaths</code></p>',
        goal: 'Run Dijkstra to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'graph-mst-auto',
        name: 'Kruskal vs Prim',
        desc: 'Watch both MST builders',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'graph', mode: 'graph', algo: 'kruskal', graph: null, meta: {},
        },
        intro: '<p>Kruskal = sort + DSU. Prim = grow tree with heap. Same MST cost.</p>',
        goal: 'Run Kruskal to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'graph-flow',
        name: 'Max-flow',
        desc: 'Edmonds-Karp + min-cut',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'graph', mode: 'flow', algo: 'ek', graph: null, meta: {},
        },
        intro:
          '<p><code>lesson flow</code></p><p>Augment along BFS paths in the residual. Max-flow = min-cut.</p>' +
          '<p><code>set flow ek</code> · <code>run</code></p>',
        goal: 'Run Edmonds-Karp and read max-flow value.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.some((f) => f.extra?.value != null),
      },
      {
        id: 'graph-bf',
        name: 'Bellman-Ford',
        desc: 'V−1 rounds · neg-cycle detect',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'graph', mode: 'graph', algo: 'bellman', graph: null, meta: {},
        },
        intro:
          '<p>Allows negative weights. O(VE). Extra pass detects negative cycles.</p>' +
          '<p><code>set graph bellman</code> · <code>run</code></p><p><code>lesson shortestPaths</code></p>',
        goal: 'Run Bellman-Ford to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'graph-fw',
        name: 'Floyd-Warshall',
        desc: 'All-pairs O(V³)',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'graph', mode: 'graph', algo: 'floyd', graph: null, meta: {},
        },
        intro: '<p>dp[k][i][j] = best path with intermediates ≤ k. Watch the table fill.</p>',
        goal: 'Run Floyd-Warshall to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'graph-topo',
        name: 'Topological sort',
        desc: 'Kahn · indegrees to zero',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'graph', mode: 'graph', algo: 'topo', graph: null, meta: {},
        },
        intro: '<p>DAG ⇔ topo order exists. Kahn emits indegree-0 nodes.</p><p><code>lesson graphsTheory</code></p>',
        goal: 'Run topological sort to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.some((f) => f.extra?.order?.length),
      },
      {
        id: 'graph-scc',
        name: 'Strong components',
        desc: 'Kosaraju · G then Gᵀ',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'graph', mode: 'graph', algo: 'scc', graph: null, meta: {},
        },
        intro: '<p>Condensation of SCCs is a DAG. O(V+E).</p>',
        goal: 'Run Kosaraju to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.some((f) => f.extra?.comps?.length),
      },
      {
        id: 'graph-theory',
        name: 'Graphs exam',
        desc: 'Complexity + algorithm choice',
        par: 4,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'gq', array: [0], meta: { answers: {} } },
        intro:
          '<ol><li>BFS adj-list? a) O(V²) b) O(V+E) c) O(E log V) d) O((V+E)log V)</li>' +
          '<li>Dijkstra + binary heap? a) O(V+E) b) O((V+E) log V) c) O(V²) d) O(VE)</li>' +
          '<li>Negative edges — use? a) Dijkstra b) BFS c) Bellman-Ford d) Prim</li>' +
          '<li>SCC condensation is? a) not a DAG b) 1 node c) a DAG d) 2 nodes</li></ol>',
        goal: 'All 4 correct (b, b, c, c).',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'b' && a['3'] === 'c' && a['4'] === 'c';
        },
      },
    ],
  },

  dp: {
    name: 'dynamic programming',
    blurb: 'Subproblems, recurrences, classic tables',
    levels: [
      {
        id: 'dp-fib',
        name: 'Fill fib',
        desc: 'Bottom-up Fibonacci',
        par: 1,
        kind: 'tutorial',
        setup: { kind: 'matrix', mode: 'dp', algo: 'fib', array: [], meta: {} },
        intro: '<p><code>lesson dpTheory</code></p><p>dp[i]=dp[i−1]+dp[i−2]. O(n) time/space.</p>',
        goal: 'Run fib DP to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 4,
      },
      {
        id: 'dp-coin',
        name: 'Coin change table',
        desc: 'Unlimited coins · min count',
        par: 1,
        kind: 'tutorial',
        setup: { kind: 'matrix', mode: 'dp', algo: 'coin', array: [], meta: {} },
        intro: '<p>dp[x]=1+min_c dp[x−c]. Greedy by largest coin is <em>wrong</em> for {1,3,4}, amount 6.</p>',
        goal: 'Run coin change to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 4,
      },
      {
        id: 'dp-lcs',
        name: 'LCS grid',
        desc: '2D table · match/diag',
        par: 1,
        kind: 'tutorial',
        setup: { kind: 'matrix', mode: 'dp', algo: 'lcs', array: [], meta: {} },
        intro: '<p>Match → diag+1; else max(top,left). O(mn).</p>',
        goal: 'Run LCS to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 4,
      },
      {
        id: 'dp-knap',
        name: '0/1 knapsack',
        desc: 'Pseudo-poly O(nW)',
        par: 1,
        kind: 'tutorial',
        setup: { kind: 'matrix', mode: 'dp', algo: 'knapsack', array: [], meta: {} },
        intro: '<p>Guess: take item i or skip. Pseudo-polynomial in W.</p>',
        goal: 'Run knapsack to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 4,
      },
      {
        id: 'dp-rod',
        name: 'Rod cutting',
        desc: 'Interval-free 1D · O(n²)',
        par: 1,
        kind: 'tutorial',
        setup: { kind: 'matrix', mode: 'dp', algo: 'rod', array: [], meta: {} },
        intro: '<p>dp[i] = max_{j≤i} (p[j] + dp[i−j]). Classic 1D DP.</p>',
        goal: 'Run rod cutting to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 4,
      },
      {
        id: 'dp-chain',
        name: 'Matrix chain',
        desc: 'Interval DP · O(n³)',
        par: 1,
        kind: 'tutorial',
        setup: { kind: 'matrix', mode: 'dp', algo: 'chain', array: [], meta: {} },
        intro: '<p>cost[i][j] = min_k cost[i][k]+cost[k+1][j]+p_{i-1}p_k p_j.</p>',
        goal: 'Run matrix-chain to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'dp-theory',
        name: 'DP exam',
        desc: 'Complexity + correctness',
        par: 3,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'dpq', array: [0], meta: { answers: {} } },
        intro:
          '<ol><li>LCS time? a) O(m+n) b) O(mn) c) O(mn log) d) O(2^{m+n})</li>' +
          '<li>0/1 knapsack? a) O(n) b) O(nW) c) O(2ⁿ) d) O(W log W)</li>' +
          '<li>Min-coins recurrence? a) dp[x]=1+min_c dp[x−c] b) greedy largest c) dp[x]=dp[x−1] d) sort</li></ol>' +
          '<p>Answers: b, b, a</p>',
        goal: 'All 3 correct.',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'b' && a['3'] === 'a';
        },
      },
    ],
  },

  greedy: {
    name: 'greedy & strings',
    blurb: 'Exchange argument, Huffman, KMP',
    levels: [
      {
        id: 'greedy-act',
        name: 'Activity selection',
        desc: 'Earliest finish time',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'greedy', algo: 'activity', array: [], meta: {},
        },
        intro:
          '<p><code>lesson greedy</code></p><p>Exchange argument: earliest-finish leaves maximal room.</p>',
        goal: 'Run activity selection to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'greedy-huff',
        name: 'Huffman tree',
        desc: 'Merge two lightest',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'greedy', algo: 'huffman', array: [],
          meta: { freq: { A: 5, B: 2, C: 1, D: 1 } },
        },
        intro: '<p>Minimizes Σ freq·depth among prefix codes. O(n log n).</p>',
        goal: 'Run Huffman to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 2,
      },
      {
        id: 'string-kmp',
        name: 'KMP failure function',
        desc: 'Pattern AAB in AABAABAAB',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'string', algo: 'kmp', array: [],
          meta: { text: 'AABAABAAB', pat: 'AAB' },
        },
        intro: '<p><code>lesson strings</code></p><p>lps/π table + shift on mismatch. O(n+m).</p>',
        goal: 'Run KMP to find a match.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.some((f) => f.extra?.match >= 0),
      },
      {
        id: 'string-rk',
        name: 'Rabin-Karp',
        desc: 'Rolling hash windows',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'string', algo: 'rk', array: [],
          meta: { text: 'AABAACAADAABAABA', pat: 'AABA' },
        },
        intro: '<p>O(1) rolling hash + verify. Watch spurious hits.</p>',
        goal: 'Run Rabin-Karp to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 2,
      },
      {
        id: 'string-z',
        name: 'Z-algorithm',
        desc: 'Z-box linear scan',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'string', algo: 'z', array: [],
          meta: { text: 'aabxaab' },
        },
        intro: '<p>Z[i] = lcp(S, S[i..]). Box [l,r) trick → O(n).</p>',
        goal: 'Run Z-algorithm to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length > 3,
      },
      {
        id: 'string-sa',
        name: 'Suffix array',
        desc: 'Prefix doubling',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'string', algo: 'sa', array: [],
          meta: { text: 'banana' },
        },
        intro: '<p>Sort suffixes by 2^k-length prefixes. O(n log² n) narrative version.</p>',
        goal: 'Run suffix array build to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.some((f) => f.extra?.done),
      },
      {
        id: 'greedy-theory',
        name: 'Greedy exam',
        desc: 'Rules and counterexamples',
        par: 3,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'grq', array: [0], meta: { answers: {} } },
        intro:
          '<ol><li>Activity selection? a) earliest start b) earliest finish c) shortest d) most conflicts</li>' +
          '<li>Fractional knapsack key? a) value/weight b) weight c) value d) random</li>' +
          '<li>Huffman cost is? a) depths sum b) weighted path length c) leaves d) height</li></ol>',
        goal: 'All 3 correct (b, a, b).',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'a' && a['3'] === 'b';
        },
      },
    ],
  },

  dc: {
    name: 'divide & conquer',
    blurb: 'Closest pair, Karatsuba, Master Theorem',
    levels: [
      {
        id: 'dc-closest',
        name: 'Closest pair',
        desc: 'Divide by x · strip check',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'dc', algo: 'closest', array: [],
          meta: {
            points: [
              [2, 3], [12, 30], [40, 50], [5, 1], [12, 10], [3, 4],
            ],
          },
        },
        intro:
          '<p><code>lesson divideConquer</code></p><p>T(n)=2T(n/2)+O(n) after strip lemma (7 neighbors).</p>',
        goal: 'Run closest pair to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.some((f) => f.type === 'done'),
      },
      {
        id: 'dc-mt',
        name: 'Karatsuba via Master Theorem',
        desc: '3T(n/2)+Θ(n)',
        par: 1,
        kind: 'theory-run',
        setup: {
          kind: 'matrix', mode: 'theory', algo: 'master', array: [],
          meta: { a: 3, b: 2, fPower: 1, logPow: 0 },
        },
        intro: '<p>Case 1 → Θ(n^{log₂3}) ≈ n^{1.585}.</p>',
        goal: 'Run MT and confirm Karatsuba bound.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length >= 2,
      },
      {
        id: 'dc-tree',
        name: 'Recursion tree reading',
        desc: 'Where does the work go?',
        par: 2,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'rt', array: [0], meta: { answers: {} } },
        intro:
          '<p><code>lesson recurrences</code> · <code>lesson substitution</code></p>' +
          '<ol><li>2T(n/2)+n: work per level is? a) n b) n² c) log n d) 1</li>' +
          '<li>Number of levels is? a) n b) log n c) n² d) 1</li></ol>' +
          '<p>Answers: a, b → Θ(n log n)</p>',
        goal: 'Both correct.',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'a' && a['2'] === 'b';
        },
      },
    ],
  },

  np: {
    name: 'NP-completeness',
    blurb: 'Reductions — the exam core',
    levels: [
      {
        id: 'np-1',
        name: 'SAT ≤ 3-SAT',
        desc: 'Gadget reduction walkthrough',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'np', algo: 'sat-3sat', array: [], meta: {},
        },
        intro:
          '<p><code>lesson np</code></p><p>Step through the construction. Then prove both directions.</p>',
        goal: 'Step through the SAT→3-SAT reduction.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length >= 3,
      },
      {
        id: 'np-2',
        name: '3-SAT ≤ CLIQUE',
        desc: 'Group-of-literals construction',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'np', algo: '3sat-clique', array: [], meta: {},
        },
        intro: '<p>k = #clauses. Consistency of one-per-group clique ⇔ satisfying assignment.</p>',
        goal: 'Step through the 3-SAT→CLIQUE reduction.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length >= 3,
      },
      {
        id: 'np-3',
        name: 'CLIQUE ≤ VERTEX-COVER',
        desc: 'Complement graph trick',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'np', algo: 'clique-vc', array: [], meta: {},
        },
        intro: '<p>k-clique in G ⇔ (|V|−k)-cover in Ḡ.</p>',
        goal: 'Step through CLIQUE→VERTEX-COVER.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.length >= 3,
      },
      {
        id: 'np-4',
        name: 'NP exam',
        desc: 'Definitions + reduction direction',
        par: 3,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'npq', array: [0], meta: { answers: {} } },
        intro:
          '<ol><li>To show B NP-hard? a) B→SAT b) known NPC A→B c) brute force d) B∈NP</li>' +
          '<li>CLIQUE from? a) PATH b) 3-SAT c) MST d) SORT</li>' +
          '<li>If P=NP? a) nothing b) all NP have poly algos c) SAT unsolvable d) BFS faster</li></ol>',
        goal: 'All 3 correct (b, b, b).',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'b' && a['3'] === 'b';
        },
      },
    ],
  },

  randomized: {
    name: 'randomized & flow theory',
    blurb: 'Las Vegas / Monte Carlo / max-flow',
    levels: [
      {
        id: 'flow-1',
        name: 'Max-flow exam',
        desc: 'Edmonds-Karp + min-cut',
        par: 2,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'flq', array: [0], meta: { answers: {} } },
        intro:
          '<ol><li>Edmonds-Karp? a) O(E) b) O(VE) c) O(VE²) d) O(V²)</li>' +
          '<li>Max-flow equals? a) sum caps b) min cut c) #edges d) max edge</li></ol>',
        goal: 'Both correct (c, b).',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'c' && a['2'] === 'b';
        },
      },
      {
        id: 'rand-1',
        name: 'Vegas vs Monte Carlo',
        desc: 'Error vs time guarantees',
        par: 2,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'rq', array: [0], meta: { answers: {} } },
        intro:
          '<p><code>lesson randomized</code></p>' +
          '<ol><li>Randomized quicksort is? a) Las Vegas b) Monte Carlo</li>' +
          '<li>Freivalds matrix check is? a) Las Vegas b) Monte Carlo</li></ol>',
        goal: 'Both correct (a, b).',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'a' && a['2'] === 'b';
        },
      },
      {
        id: 'rand-2',
        name: 'Freivalds demo',
        desc: 'Monte Carlo product check',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'random', algo: 'freivalds', array: [], meta: {},
        },
        intro:
          '<p>Verify C=AB in O(n²) with a random vector. Error ≤ 1/2 per trial.</p>' +
          '<p><code>set random freivalds</code> · <code>run</code></p>',
        goal: 'Run Freivalds and read accept/reject.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.some((f) => f.extra?.phase === 'done'),
      },
      {
        id: 'rand-3',
        name: 'Substitution drill',
        desc: 'Prove T(n)=2T(n/2)+n is Θ(n log n)',
        par: 1,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'sub', array: [0], meta: { answers: {} } },
        intro:
          '<p><code>lesson substitution</code></p>' +
          '<ol><li>Upper bound guess? a) cn b) cn log n c) cn² d) c n log² n</li>' +
          '<li>To claim Θ you must prove? a) O only b) Ω only c) both d) neither</li></ol>' +
          '<p>Answers: b, c</p>',
        goal: 'Both correct.',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'c';
        },
      },
      {
        id: 'rand-4',
        name: 'Amortized + decision tree',
        desc: 'Two proof-sketch questions',
        par: 2,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'amort', array: [0], meta: { answers: {} } },
        intro:
          '<p><code>lesson amortized</code> · <code>lesson decisionTree</code></p>' +
          '<ol><li>Dynamic array push amortized? a) O(n) b) O(1) c) O(log n) d) O(n²)</li>' +
          '<li>Comparison sort lower bound proof uses? a) code count b) decision tree leaves n! c) wall clock d) hash</li></ol>' +
          '<p>Answers: b, b</p>',
        goal: 'Both correct.',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'b';
        },
      },
    ],
  },

  proof: {
    name: 'proof drills',
    blurb: 'Invariants, lower bounds, reductions',
    levels: [
      {
        id: 'proof-1',
        name: 'Invariant recognition',
        desc: 'Pick the true loop invariant',
        par: 3,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'inv', array: [0], meta: { answers: {} } },
        intro:
          '<ol>' +
          '<li>Insertion sort after i steps: a) unsorted rest sorted b) a[0..i] sorted perm of orig c) a[i] is max d) reversed</li>' +
          '<li>Binary search invariant: a) mid is answer b) target in a[lo..hi] if present c) lo&gt;hi d) array unsorted</li>' +
          '<li>Dijkstra settle step proves: a) dist[u] final b) graph DAG c) no cycles d) MST edge</li>' +
          '</ol><p>Answers: b, b, a</p>',
        goal: 'All 3 correct.',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'b' && a['3'] === 'a';
        },
      },
      {
        id: 'proof-2',
        name: 'Reduction direction',
        desc: 'Hardness transfer',
        par: 2,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'red', array: [0], meta: { answers: {} } },
        intro:
          '<p><code>lesson npGadget</code></p>' +
          '<ol><li>A ≤_p B means? a) B solves A b) A at least as hard as B c) hardness flows to B d) A in P</li>' +
          '<li>3-SAT→CLIQUE sets k =? a) |V| b) #clauses c) 2 d) n log n</li></ol>',
        goal: 'Both correct (c, b).',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'c' && a['2'] === 'b';
        },
      },
      {
        id: 'proof-3',
        name: 'Gadget builder',
        desc: 'Build CLIQUE instance from 3-SAT',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'np', algo: 'build', array: [],
          meta: {
            clauses: [
              ['x', 'y', 'z'],
              ['!x', 'y', 'w'],
              ['!y', '!z', 'w'],
            ],
          },
        },
        intro:
          '<p>Run the builder and confirm: groups=3, k=3, no edges inside a group, no x–!x edges.</p>',
        goal: 'Run NP gadget builder to completion.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.some((f) => f.extra?.phase === 'ready'),
      },
      {
        id: 'proof-4',
        name: 'AVL rebalance',
        desc: 'Watch LL/RR/LR/RL rotations',
        par: 1,
        kind: 'tutorial',
        setup: {
          kind: 'tree', mode: 'ds', algo: 'avl', array: [],
          meta: { keys: [30, 20, 10, 25, 28, 5, 40] },
        },
        intro:
          '<p><code>lesson avl</code></p><p>Keys force LR/RL cases. Height stays Θ(log n).</p>',
        goal: 'Run AVL inserts and see rotations fire.',
        win: (ctx) => ctx.engine.done && ctx.engine.frames.some((f) => f.extra?.rotate),
      },
      {
        id: 'proof-5',
        name: 'Lower bound & amortized exam',
        desc: 'Decision tree + potential method',
        par: 2,
        kind: 'analysis',
        setup: { kind: 'array', mode: 'quiz', algo: 'lb', array: [0], meta: { answers: {} } },
        intro:
          '<p><code>lesson decisionTree</code> · <code>lesson amortized</code></p>' +
          '<ol><li>n! leaves ⇒ height? a) Ω(n) b) Ω(n log n) c) Ω(n²) d) Ω(log n)</li>' +
          '<li>UF α(n) means? a) constant proven b) inverse Ackermann c) log n d) n</li></ol>',
        goal: 'Both correct (b, b).',
        win: (ctx) => {
          const a = ctx.state.meta.answers || {};
          return a['1'] === 'b' && a['2'] === 'b';
        },
      },
    ],
  },
};

export const sequenceOrder = [
  'intro',
  'asymptotics',
  'sorting',
  'searching',
  'structures',
  'graphs',
  'dp',
  'greedy',
  'dc',
  'np',
  'randomized',
  'proof',
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
  const order = orderFromVisits(ctx);
  if (order.length < 6) return false;
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
  return new Set(order).size === 6;
}

function orderFromVisits(ctx) {
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
