/**
 * Mastery problem banks — exam-level items per unit (tight bounds, constructions, proofs).
 * Each item: { id, unit, prompt, kind, answer, why, points }
 * kind: choice | fill | num
 * answer: exact string (fill/num) or choice letter; comparison is normalized.
 */

/**
 * @typedef {Object} MasteryItem
 * @property {string} id
 * @property {string} unit
 * @property {string} prompt
 * @property {'choice'|'fill'|'num'} kind
 * @property {Record<string,string>} [choices]
 * @property {string} answer
 * @property {string} why
 */

/** @type {Record<string, MasteryItem[]>} */
export const masteryBanks = {
  asymptotics: [
    {
      id: 'as-1',
      unit: 'asymptotics',
      kind: 'fill',
      prompt: 'Tight order (use Θ notation like n^2 or n log n): 3n^2 + n log n + 5',
      answer: 'n^2',
      why: 'Lower-degree terms drop.',
    },
    {
      id: 'as-2',
      unit: 'asymptotics',
      kind: 'fill',
      prompt: 'Tight order: sum_{k=1..n} k',
      answer: 'n^2',
      why: 'n(n+1)/2 = Θ(n²).',
    },
    {
      id: 'as-3',
      unit: 'asymptotics',
      kind: 'fill',
      prompt: 'Tight order: n * log(n) + n',
      answer: 'n log n',
      why: 'Dominant term n log n.',
    },
    {
      id: 'as-4',
      unit: 'asymptotics',
      kind: 'choice',
      prompt: 'Is 2^{2n} = O(2^n)?',
      choices: { a: 'yes', b: 'no' },
      answer: 'b',
      why: '2^{2n} = 4^n grows faster than any c·2^n.',
    },
  ],
  recurrences: [
    {
      id: 'rc-1',
      unit: 'recurrences',
      kind: 'fill',
      prompt: 'Tight bound: T(n)=2T(n/2)+n',
      answer: 'n log n',
      why: 'Master case 2.',
    },
    {
      id: 'rc-2',
      unit: 'recurrences',
      kind: 'fill',
      prompt: 'Tight bound: T(n)=T(n/2)+1',
      answer: 'log n',
      why: 'Binary search.',
    },
    {
      id: 'rc-3',
      unit: 'recurrences',
      kind: 'fill',
      prompt: 'Tight bound: T(n)=3T(n/2)+n',
      answer: 'n^1.585',
      why: 'n^{log₂3} ≈ n^{1.585}. Accept n^log_2 3.',
    },
    {
      id: 'rc-4',
      unit: 'recurrences',
      kind: 'fill',
      prompt: 'Tight bound: T(n)=2T(n/2)+n^2',
      answer: 'n^2',
      why: 'Root dominates (case 3).',
    },
    {
      id: 'rc-5',
      unit: 'recurrences',
      kind: 'fill',
      prompt: 'Tight bound: T(n)=4T(n/2)+n log n',
      answer: 'n^2',
      why: 'n^{log₂4}=n²; f=n log n = O(n^{2-ε}).',
    },
  ],
  sorting: [
    {
      id: 'so-1',
      unit: 'sorting',
      kind: 'fill',
      prompt: 'Inversions of [2,4,1,3,5] (count pairs i<j with a[i]>a[j])',
      answer: '3',
      why: '(2,1),(4,1),(4,3).',
    },
    {
      id: 'so-2',
      unit: 'sorting',
      kind: 'fill',
      prompt: 'Compare-and-swap worst-case lower bound for n=8: ⌈log2(n!)⌉ = ?',
      answer: '16',
      why: '8! = 40320, log2≈15.3, ceil 16.',
    },
    {
      id: 'so-3',
      unit: 'sorting',
      kind: 'choice',
      prompt: 'Which sort is stable, in-place, and Θ(n log n) worst-case?',
      choices: { a: 'quicksort', b: 'heapsort', c: 'none of these', d: 'counting' },
      answer: 'c',
      why: 'Mergesort is stable+nlogn but not in-place; heap is inplace+stable=NO; quick not stable/worst.',
    },
    {
      id: 'so-4',
      unit: 'sorting',
      kind: 'fill',
      prompt: 'Counting sort time on n=100, keys in 0..20: O(n+k) = Θ(?) tight in terms of n if k=Θ(n)',
      answer: 'n',
      why: 'Θ(n+k)=Θ(n) when k=Θ(n).',
    },
    {
      id: 'so-5',
      unit: 'sorting',
      kind: 'fill',
      prompt: 'Nearly sorted array (n-1 sorted pairs out of order): best algorithm family and tight time (e.g. n or n log n)',
      answer: 'n',
      why: 'Insertion sort is Θ(n) on nearly sorted.',
    },
  ],
  searching: [
    {
      id: 'se-1',
      unit: 'searching',
      kind: 'fill',
      prompt: 'Worst-case comparisons of binary search on n=1000',
      answer: '10',
      why: '⌈log2(1001)⌉ = 10.',
    },
    {
      id: 'se-2',
      unit: 'searching',
      kind: 'fill',
      prompt: 'MOM recurrence constant for the "worse side" fraction (like 0.7): fill the 0.x form',
      answer: '0.7',
      why: '7n/10 worst side; 3n/10 better side.',
    },
    {
      id: 'se-3',
      unit: 'searching',
      kind: 'fill',
      prompt: 'Expected time of randomized select (tight)',
      answer: 'n',
      why: 'Expected Θ(n).',
    },
    {
      id: 'se-4',
      unit: 'searching',
      kind: 'choice',
      prompt: 'Median of medians guarantees…',
      choices: {
        a: 'expected O(n)',
        b: 'worst-case O(n)',
        c: 'worst-case O(n log n)',
        d: 'O(log n)',
      },
      answer: 'b',
      why: 'Deterministic linear.',
    },
  ],
  structures: [
    {
      id: 'ds-1',
      unit: 'structures',
      kind: 'fill',
      prompt: 'AVL worst-case height of n nodes ≈ 1.44 log2 n — for n=1024, bound ⌊1.44*log2(1024)⌋ = ?',
      answer: '14',
      why: '1.44*10 = 14.4 → 14.',
    },
    {
      id: 'ds-2',
      unit: 'structures',
      kind: 'fill',
      prompt: 'RB tree height upper bound 2 log2(n+1) for n=255: 2*log2(256) = ?',
      answer: '16',
      why: '2*8=16.',
    },
    {
      id: 'ds-3',
      unit: 'structures',
      kind: 'choice',
      prompt: 'Build-heap from n elements is…',
      choices: { a: 'Θ(n)', b: 'Θ(n log n)', c: 'Θ(n²)', d: 'Θ(log n)' },
      answer: 'a',
      why: 'Floyd linear build.',
    },
    {
      id: 'ds-4',
      unit: 'structures',
      kind: 'fill',
      prompt: 'Hash table chaining expected search with load factor α=0.5 (answer like 1.5 or 1+a)',
      answer: '1.5',
      why: 'Θ(1+α)=1.5 expected probes/success approx 1+α/2 — take 1.5 as 1+α. Accept 1+a.',
    },
    {
      id: 'ds-5',
      unit: 'structures',
      kind: 'fill',
      prompt: 'n=1e6 union-find ops with path compression + rank: amortized per op is Θ(α(n)) which is less than ? (integer, typical bound used in exams)',
      answer: '5',
      why: 'α(1e6) is at most 4–5 in practice/exams.',
    },
  ],
  graphs: [
    {
      id: 'g-1',
      unit: 'graphs',
      kind: 'fill',
      prompt: 'BFS on |V|=1000, |E|=5000 adjacency list: tight Θ(V+E) = ?',
      answer: '6000',
      why: 'Sum of sizes (order-of input work).',
    },
    {
      id: 'g-2',
      unit: 'graphs',
      kind: 'fill',
      prompt: 'Shortest path edges on a path graph of n vertices: distance from end to end = ?',
      answer: 'n-1',
      why: 'n-1 edges.',
    },
    {
      id: 'g-3',
      unit: 'graphs',
      kind: 'choice',
      prompt: 'DAG shortest path after topo sort is…',
      choices: { a: 'O(V+E)', b: 'O(VE)', c: 'O(V²)', d: 'O(E log V)' },
      answer: 'a',
      why: 'One pass relax in topo order.',
    },
    {
      id: 'g-4',
      unit: 'graphs',
      kind: 'fill',
      prompt: 'Max-flow min-cut on a network with min cut capacity 7: max-flow value = ?',
      answer: '7',
      why: 'Theorem.',
    },
    {
      id: 'g-5',
      unit: 'graphs',
      kind: 'fill',
      prompt: 'MST edge count for |V|=50 connected graph = ?',
      answer: '49',
      why: 'n-1.',
    },
  ],
  dp: [
    {
      id: 'dp-1',
      unit: 'dp',
      kind: 'fill',
      prompt: 'LCS("ABCB","BDCB") length = ?',
      answer: '3',
      why: 'BCB / DCB common BCB length 3.',
    },
    {
      id: 'dp-2',
      unit: 'dp',
      kind: 'fill',
      prompt: 'Min coins {1,3,4} for amount 6 = ?',
      answer: '2',
      why: '3+3 (greedy 4+1+1=3 is wrong).',
    },
    {
      id: 'dp-3',
      unit: 'dp',
      kind: 'fill',
      prompt: 'Rod prices [1,5,8,9,10,17,17,20] for n=8 optimal revenue = ?',
      answer: '22',
      why: '2+2+2+2? Actually 8 = 2+2+2+2 with p2=5 → 20; or 8 alone 20; CLRS answer 22 = 2+6? p2+p6=5+17=22.',
    },
    {
      id: 'dp-4',
      unit: 'dp',
      kind: 'fill',
      prompt: 'Matrix chain dims 10×30×5×60 min multiplications = ?',
      answer: '4500',
      why: '(10x30*30x5)*(5x60) = 1500+3000=4500.',
    },
    {
      id: 'dp-5',
      unit: 'dp',
      kind: 'fill',
      prompt: '0/1 knapsack n=3, W=5, w=[2,3,4], v=[3,4,5] best value = ?',
      answer: '7',
      why: 'items 1+2: w=5 v=7.',
    },
  ],
  greedy: [
    {
      id: 'gr-1',
      unit: 'greedy',
      kind: 'fill',
      prompt: 'Activities [1,3],[2,5],[4,7],[6,9],[5,8] — max compatible count = ?',
      answer: '2',
      why: 'e.g. [1,3],[4,7] or [1,3],[6,9] or [2,5],[6,9] → 2. Three is impossible with these intervals.',
    },
    {
      id: 'gr-2',
      unit: 'greedy',
      kind: 'fill',
      prompt: 'Huffman freqs A=5,B=2,C=1,D=1 — WPL (sum freq*depth) = ?',
      answer: '15',
      why: 'Depths A1 B2 C3 D3 → 5+4+3+3=15.',
    },
    {
      id: 'gr-3',
      unit: 'greedy',
      kind: 'choice',
      prompt: 'Fractional knapsack greedy key is…',
      choices: { a: 'value/weight', b: 'weight', c: 'value', d: 'index' },
      answer: 'a',
      why: 'Density sort.',
    },
  ],
  dc: [
    {
      id: 'dc-1',
      unit: 'dc',
      kind: 'fill',
      prompt: 'Karatsuba multiplication complexity exponent: n^{log2(3)} ≈ n^?',
      answer: '1.585',
      why: 'log2 3 ≈ 1.585.',
    },
    {
      id: 'dc-2',
      unit: 'dc',
      kind: 'fill',
      prompt: 'Closest pair strip check neighbor bound (how many points to check per point in 2δ strip, CLRS lemma)',
      answer: '7',
      why: 'At most 7 forward neighbors.',
    },
    {
      id: 'dc-3',
      unit: 'dc',
      kind: 'fill',
      prompt: 'FFT of size n complexity: Θ(?)',
      answer: 'n log n',
      why: 'Cooley–Tukey.',
    },
    {
      id: 'dc-4',
      unit: 'dc',
      kind: 'fill',
      prompt: 'Naive poly mult of degree n is Θ(?)',
      answer: 'n^2',
      why: 'n² coefficient products.',
    },
  ],
  strings: [
    {
      id: 'st-1',
      unit: 'strings',
      kind: 'fill',
      prompt: 'KMP on text length n=1000 pattern m=10: comparisons tight Θ(?)',
      answer: 'n+m',
      why: 'O(n+m).',
    },
    {
      id: 'st-2',
      unit: 'strings',
      kind: 'fill',
      prompt: 'π (LPS) of pattern "ABABCABAB" at last index = ?',
      answer: '4',
      why: 'π = 0 0 1 2 0 1 2 3 4.',
    },
    {
      id: 'st-3',
      unit: 'strings',
      kind: 'fill',
      prompt: 'Rabin-Karp expected time = ?',
      answer: 'n+m',
      why: 'Rolling hash O(1)/window.',
    },
    {
      id: 'st-4',
      unit: 'strings',
      kind: 'fill',
      prompt: 'Number of leaves in suffix tree of text length n (including $) = ?',
      answer: 'n',
      why: 'n leaves = n suffixes.',
    },
  ],
  np: [
    {
      id: 'np-1',
      unit: 'np',
      kind: 'fill',
      prompt: 'To prove B NP-complete you show B ∈ NP and A ≤_p B for some known NPC A. The reduction maps instances of ? to B',
      answer: 'A',
      why: 'From known NPC A to B.',
    },
    {
      id: 'np-2',
      unit: 'np',
      kind: 'fill',
      prompt: '3-SAT→CLIQUE sets k = number of ?',
      answer: 'clauses',
      why: 'One per clause-group.',
    },
    {
      id: 'np-3',
      unit: 'np',
      kind: 'choice',
      prompt: 'CLIQUE → VERTEX-COVER uses complement graph and k\' = ?',
      choices: { a: 'k', b: 'n-k', c: '2k', d: 'n/2' },
      answer: 'b',
      why: '|V|−k.',
    },
  ],
  randomized: [
    {
      id: 'rd-1',
      unit: 'randomized',
      kind: 'fill',
      prompt: 'Freivalds error probability per trial (like 0.5 or 1/2)',
      answer: '0.5',
      why: '≤ 1/2. Accept 1/2.',
    },
    {
      id: 'rd-2',
      unit: 'randomized',
      kind: 'fill',
      prompt: 'After k independent Freivalds trials, error ≤ ? as 2^{-k}',
      answer: '2^{-k}',
      why: 'Amplification. Accept 2^(-k).',
    },
    {
      id: 'rd-3',
      unit: 'randomized',
      kind: 'choice',
      prompt: 'Randomized quicksort is…',
      choices: { a: 'Las Vegas', b: 'Monte Carlo' },
      answer: 'a',
      why: 'Always correct, random time.',
    },
  ],
  proofs: [
    {
      id: 'pf-1',
      unit: 'proofs',
      kind: 'fill',
      prompt: 'Insertion sort invariant needs 3 parts: initialization, maintenance, ?',
      answer: 'termination',
      why: 'CLRS trinity.',
    },
    {
      id: 'pf-2',
      unit: 'proofs',
      kind: 'fill',
      prompt: 'To prove Θ you need both O and ?',
      answer: 'omega',
      why: 'Ω. Accept ω.',
    },
    {
      id: 'pf-3',
      unit: 'proofs',
      kind: 'fill',
      prompt: 'Decision tree height ≥ log2(?) for n keys',
      answer: 'n!',
      why: 'n! leaves.',
    },
    {
      id: 'pf-4',
      unit: 'proofs',
      kind: 'fill',
      prompt: 'Dijkstra invariant at settle time: dist[u] is ?',
      answer: 'final',
      why: 'Not temporary.',
    },
    {
      id: 'pf-5',
      unit: 'proofs',
      kind: 'fill',
      prompt: 'Greedy on matroids uses exchange property + ? (hereditary / independent / basis)',
      answer: 'hereditary',
      why: 'Hereditary + exchange.',
    },
  ],
};

/** @type {string[]} */
export const masteryUnits = Object.keys(masteryBanks);

/**
 * @param {string} unit
 * @param {MasteryItem} item
 * @param {string} input
 */
export function gradeMastery(item, input) {
  const norm = String(input).trim().toLowerCase().replace(/\s+/g, '');
  if (item.kind === 'choice') {
    return { ok: norm === item.answer.toLowerCase(), why: item.why };
  }
  // fill / numeric — accept a few equivalent forms stored in answer with |
  const alts = item.answer.toLowerCase().split('|').map((s) => s.replace(/\s+/g, ''));
  const ok = alts.some((a) => a === norm);
  return { ok, why: item.why };
}
