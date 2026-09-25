/**
 * Worked problem sets — multi-step exam problems with full solutions.
 * Each item: { id, unit, problem, steps: string[], solution, check?: (ans) => ok }
 */

/**
 * @typedef {Object} WorkedProblem
 * @property {string} id
 * @property {string} unit
 * @property {string} problem
 * @property {string[]} steps   // solution outline / rubric steps
 * @property {string} solution  // full written solution
 * @property {string[]} keywords // anti-cheat / self-check words
 */

/** @type {WorkedProblem[]} */
export const workedProblems = [
  {
    id: 'wp-sort-inv',
    unit: 'sorting',
    problem:
      'Let A = [2, 3, 8, 6, 1]. (a) Compute the number of inversions. (b) What does this say about the running time of insertion sort on A? (c) Give an O(n log n) algorithm that returns the inversion count.',
    steps: [
      'List all pairs (i,j), i<j with A[i]>A[j].',
      'Relate inversions to insertion sort swaps/shifts.',
      'Divide & conquer count: split, count halves, count split inversions during merge.',
    ],
    solution:
      '(a) Inversions: (2,1), (3,1), (8,6), (8,1), (6,1) → 5. (b) Insertion sort does exactly one shift per inversion (one adjacent swap chain), so work = n-1 + #inversions = Θ(n + I). Here I=5. (c) Modified merge sort: while merging, if right element is smaller than left, add number of remaining left elements to the count. T(n)=2T(n/2)+Θ(n)=Θ(n log n).',
    keywords: ['5', 'inversion', 'merge', 'n log n'],
  },
  {
    id: 'wp-select-prove',
    unit: 'searching',
    problem:
      'Prove that the worst-case recurrence of median-of-medians select is linear. State the grouping and the pivot guarantee for n ≥ 50.',
    steps: [
      'Group into blocks of 5, take medians, recursively select median of medians.',
      'Show at least 3n/10 elements are on each side of the pivot (for n ≥ 50).',
      'T(n) ≤ T(n/5) + T(7n/10) + O(n) = O(n).',
    ],
    solution:
      'Blocks of 5 yield ⌈n/5⌉ medians. The chosen pivot is the median of those medians, so at least ⌈(1/2)⌈n/5⌉⌉ medians are ≥ pivot; each such median is ≥ 2 elements in its block ⇒ at least 3⌈n/10⌉ elements ≥ pivot and similarly ≤ pivot. Thus each recursive call has size ≤ 7n/10. The median-of-medians call has size n/5. Hence T(n) ≤ T(n/5)+T(7n/10)+cn. Since 1/5+7/10 = 9/10 < 1, by substitution T(n)=O(n). Base cases n < 50 are O(1).',
    keywords: ['n/5', '7n/10', '3n/10', 'linear', 'median'],
  },
  {
    id: 'wp-dag-sp',
    unit: 'graphs',
    problem:
      'Given a weighted DAG G with n vertices and m edges, describe an O(n+m) algorithm for single-source shortest paths and prove its correctness.',
    steps: [
      'Topologically sort G.',
      'Relax every edge in topo order, once.',
      'Correctness: induction along the topological order that dist[v] is final after processing v.',
    ],
    solution:
      'Compute a topological order in O(n+m) (Kahn or DFS). Initialize dist[s]=0, else ∞. Process vertices in topo order; for each u, relax all out-edges (u,v): dist[v]=min(dist[v], dist[u]+w(u,v)). Because all s→v paths enter v after all its predecessors, when we finish u, dist[u] is already optimal; each edge is relaxed once. Time O(n+m). Correctness by induction on the position of v in the topo order: every path to v ends with an edge from a predecessor u that was already finalized.',
    keywords: ['topological', 'relax', 'O(n+m)', 'induction'],
  },
  {
    id: 'wp-cut-cite',
    unit: 'graphs',
    problem:
      'State the cut property. Use it to prove that Kruskal’s algorithm returns an MST. Then show that on the graph with edges (weights): 1–2:1, 2–3:2, 1–3:3, 3–4:4, 2–4:5, Kruskal picks exactly 3 edges and computes the MST cost.',
    steps: [
      'Cut property: lightest edge crossing a cut is in some MST.',
      'Kruskal adds e if it joins two components — e is lightest crossing the cut defined by that component.',
      'Sorted edges: 1,2,3,4,5. Add 1–2, 2–3, skip 1–3 (cycle), add 3–4. Cost 1+2+4=7.',
    ],
    solution:
      'Cut property: for any cut (S,V∖S), a minimum-weight edge crossing the cut belongs to some MST. Kruskal processes edges in increasing weight; when it accepts e=(u,v), u and v are in different DSU components, so e is the lightest edge crossing that cut among remaining edges; by the cut property there is an MST containing e. Induct on number of accepted edges. On the example: edges sorted 1,2,3,4,5. Accept 1–2 (cost 1), 2–3 (cost 2), reject 1–3 (cycle), accept 3–4 (cost 4), reject 2–4 (cycle). MST cost 7 with edges {1–2, 2–3, 3–4}.',
    keywords: ['cut', '7', 'cycle', '1–2', 'component'],
  },
  {
    id: 'wp-lcs-code',
    unit: 'dp',
    problem:
      'Write the LCS recurrence and compute LCS("ABCBDAB","BDCABA") via the table. What is the asymptotic space complexity of the standard algorithm, and how do you reduce it if only the length is needed?',
    steps: [
      'dp[i][j] = dp[i-1][j-1]+1 if match else max(dp[i-1][j], dp[i][j-1]).',
      'Fill table; answer dp[7][6].',
      'Space: two rows suffice for length-only.',
    ],
    solution:
      'Recurrence as above with dp[0][*]=dp[*][0]=0. Standard table is Θ(mn) time/space; length is LCS("ABCBDAB","BDCABA") = 4 (e.g. BCBA). For length only, keep two rows of length min(m,n) ⇒ Θ(min(m,n)) space. Reconstructing an actual LCS needs the full table or Hirschberg’s Θ(min(m,n)) space divide & conquer.',
    keywords: ['4', 'm n', 'two row', 'max'],
  },
  {
    id: 'wp-np-vc',
    unit: 'np',
    problem:
      'Prove VERTEX-COVER is NP-complete. You may assume CLIQUE is NP-complete. Include membership in NP.',
    steps: [
      'VC ∈ NP: certificate = the cover C; verify |C| ≤ k and every edge has an endpoint in C in O(m).',
      'Reduce CLIQUE ≤_p VC: G has k-clique ⇔ Ḡ has cover of size n−k.',
      'Both directions + polynomial construction.',
    ],
    solution:
      'Membership: guess C ⊆ V, |C|≤k; scan edges; accept iff each edge is covered. Poly certificate and verifier. Hardness: map (G,k) of CLIQUE to (Ḡ, n−k). If K is a k-clique in G, V∖K is a vertex cover of Ḡ (any Ḡ-edge is a non-edge of G, so cannot lie inside K). Conversely if C covers Ḡ with |C|≤ n−k, then V∖C is a clique in G of size ≥ k (if two vertices in V∖C were non-adjacent in G they would form a Ḡ-edge uncovered). Complement is O(n²). Hence VC is NP-complete.',
    keywords: ['n-k', 'certificate', 'complement', 'clique'],
  },
  {
    id: 'wp-hash-load',
    unit: 'structures',
    problem:
      'A hash table uses chaining and has n = 1200 keys in m = 2000 slots, with a universal hash family. (a) Expected search time under uniform hashing? (b) Using Markov, show Pr[α ≥ 4·E[α]] ≤ 1/4. (c) How does linear probing differ at α = 0.9?',
    steps: [
      'α = n/m = 0.6; expected O(1+α).',
      'Markov: Pr[X ≥ t·EX] ≤ 1/t.',
      'Linear probing clusters; expected probes grow like ½(1+1/(1−α)²) success.',
    ],
    solution:
      '(a) α = 1200/2000 = 0.6. Under uniform hashing / chaining, expected unsuccessful probes Θ(1+α)=1.6 (constant factors depend on model); successful ≈ 1+α/2 = 1.3. (b) Markov: Pr[α ≥ 4 Eα] = Pr[X ≥ 4EX] ≤ 1/4. (c) Linear probing at α=0.9 suffers clustering; Knuth: expected successful probes ≈ ½(1+1/(1−α)) = 5.5, unsuccessful ≈ ½(1+1/(1−α)²) ≈ 50.5 — much worse than chaining at the same load.',
    keywords: ['0.6', 'markov', 'cluster', '1+'],
  },
  {
    id: 'wp-greedy-ex',
    unit: 'greedy',
    problem:
      'Activities: (1,4), (2,6), (5,7), (6,9), (8,11), (12,16). (a) How many can be scheduled by the earliest-finish greedy? (b) Prove this is maximum. (c) Give a counterexample showing earliest-start is not optimal.',
    steps: [
      'Sort by finish: (1,4),(2,6),(5,7),(6,9),(8,11),(12,16).',
      'Greedy takes (1,4),(5,7),(8,11),(12,16) = 4.',
      'Exchange argument; earliest-start can pick long blocking activity.',
    ],
    solution:
      '(a) 4 activities as listed. (b) Let g=(1,4). Any optimal solution’s first job a has f(a) ≥ 4; replacing a with g keeps feasibility and size; induct on residual. So greedy is optimal. (c) Counterexample for earliest-start: activities (0,10), (1,2), (2,3), (3,4). Earliest-start takes only (0,10) = 1 job; optimal takes the three short ones = 3.',
    keywords: ['4', 'exchange', '0,10', 'finish'],
  },
  {
    id: 'wp-fft-mul',
    unit: 'dc',
    problem:
      'Multiply A(x)=1+2x+3x² and B(x)=4+5x+6x² using the FFT. Show the result equals the naive convolution and state the complexity.',
    steps: [
      'Naive: [4,13,28,27,18].',
      'Pad to length 8, FFT, pointwise, iFFT.',
      'Complexity Θ(n log n) with complex arithmetic; bit-complexity notes.',
    ],
    solution:
      'Naive convolution c = [1·4, 1·5+2·4, 1·6+2·5+3·4, 2·6+3·5, 3·6] = [4,13,28,27,18]. With FFT: pad A,B to n=8, evaluate at 8th roots of unity in Θ(n log n), multiply pointwise, inverse FFT. Same coefficients. Total Θ(n log n) complex operations; for integer coefficients of B bits, bit-complexity is higher unless using NTTs / Schönhage–Strassen ideas.',
    keywords: ['4', '13', '28', 'n log n', 'fft'],
  },
  {
    id: 'wp-dijkstra-proof',
    unit: 'graphs',
    problem:
      'Give the full settle-once proof of Dijkstra including the role of non-negativity and the PQ invariant.',
    steps: [
      'Assume w(u,v) ≥ 0 for all edges.',
      'When u = extract-min, dist[u] is final.',
      'Contradiction with a shortest path’s first unsettled edge.',
    ],
    solution:
      'Assume w(u,v) ≥ 0 for all edges. Invariant: when u = extract-min, dist[u] = δ(s,u) and is never improved. Proof: let P be a true shortest s–u path. Let y be the first unsettled node on P at this time (y may be u), x = pred(y). By induction on settle order, dist[x] = δ(s,x). Then dist[y] ≤ dist[x] + w(x,y) = δ(s,y) ≤ δ(s,u) = dist[u]. If y ≠ u, y is in the PQ with key ≤ dist[u], so extract-min would return y (or a node with key ≤ dist[u]) before u — contradiction. Hence y = u and dist[u] = δ(s,u). Non-negativity is used so that δ(s,y) ≤ δ(s,u) when y precedes u on a shortest path (also so that settled prefixes cannot be improved). PQ invariant: keys of unsettled nodes are current dist estimates; extract-min therefore yields the unsettled node with globally smallest upper bound.',
    keywords: ['non-negative', 'extract-min', 'contradiction', 'invariant', 'settle'],
  },
];

/**
 * @param {string} unit
 */
export function workedFor(unit) {
  return workedProblems.filter((p) => p.unit === unit || unit === 'all');
}

/**
 * Self-check a student's short answer against solution keywords.
 * @param {WorkedProblem} p
 * @param {string} text
 */
export function selfCheckWorked(p, text) {
  const t = String(text).toLowerCase();
  const hit = p.keywords.filter((k) => t.includes(k.toLowerCase()));
  return {
    ok: hit.length >= Math.ceil(p.keywords.length / 2),
    hit,
    need: p.keywords,
  };
}
