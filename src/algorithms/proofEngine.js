/**
 * Structured proof auto-grader — fill-in / choice steps with exact expected answers
 * and feedback. Used by proof-engine levels.
 */

/**
 * @typedef {Object} ProofStep
 * @property {string} id
 * @property {string} prompt
 * @property {'choice'|'fill'|'order'} kind
 * @property {Record<string,string>} [choices]
 * @property {string[]} [answer] exact fill answers (lowercased, trimmed)
 * @property {string} why
 */

/**
 * @param {ProofStep[]} steps
 */
export function createProofSession(steps) {
  let idx = 0;
  const log = [];

  return {
    get index() {
      return idx;
    },
    get total() {
      return steps.length;
    },
    get current() {
      return steps[idx] || null;
    },
    get done() {
      return idx >= steps.length;
    },
    get log() {
      return log.slice();
    },
    get allCorrect() {
      return log.length === steps.length && log.every((e) => e.ok);
    },
    /**
     * @param {string} input
     */
    submit(input) {
      const step = steps[idx];
      if (!step) return { ok: false, why: 'session complete' };
      let ok = false;
      let why = step.why;
      const norm = String(input).trim().toLowerCase().replace(/\s+/g, ' ');
      if (step.kind === 'choice') {
        ok = norm === String(step.answer?.[0] || '').toLowerCase();
        why = ok ? step.why : `expected ${step.answer?.[0]} — ${step.why}`;
      } else if (step.kind === 'fill') {
        const answers = (step.answer || []).map((s) =>
          s.toLowerCase().replace(/\s+/g, ' ').trim(),
        );
        ok = answers.includes(norm);
        why = ok ? step.why : `expected ${answers[0]} — ${step.why}`;
      } else if (step.kind === 'order') {
        ok = norm === (step.answer?.[0] || '').toLowerCase().replace(/\s+/g, ' ');
        why = ok ? step.why : `expected ${step.answer?.[0]} — ${step.why}`;
      }
      log.push({ id: step.id, input: norm, ok, why });
      if (ok) idx += 1;
      return { ok, why };
    },
  };
}

/**
 * Canonical proof bank for the course.
 * @type {Record<string, ProofStep[]>}
 */
export const proofBanks = {
  'insertion-invariant': [
    {
      id: 'inv-1',
      kind: 'choice',
      prompt: 'After i iterations of insertion sort, a[0..i] is…',
      choices: {
        a: 'unsorted',
        b: 'sorted and a permutation of the original a[0..i]',
        c: 'only sorted if input was sorted',
        d: 'largest element',
      },
      answer: ['b'],
      why: 'Standard loop invariant: sorted prefix + multiset preserved.',
    },
    {
      id: 'inv-2',
      kind: 'fill',
      prompt: 'Init / Maintenance / ___ complete the correctness proof pattern. (one word)',
      answer: ['termination', 'term'],
      why: 'CLRS correctness: initialization, maintenance, termination.',
    },
    {
      id: 'inv-3',
      kind: 'choice',
      prompt: 'Maintenance step of insertion sort exchanges until…',
      choices: {
        a: 'array reversed',
        b: 'key is in sorted order within a[0..i]',
        c: 'i = n',
        d: 'pivot placed',
      },
      answer: ['b'],
      why: 'We insert key into sorted prefix so prefix grows sorted.',
    },
  ],
  'binary-invariant': [
    {
      id: 'bin-1',
      kind: 'fill',
      prompt: 'Binary search invariant: if target exists, it lies in a[__ .. __] (two words: lo hi)',
      answer: ['lo hi', 'lo, hi', '[lo..hi]', 'lo..hi'],
      why: 'Target never leaves the current window while present.',
    },
    {
      id: 'bin-2',
      kind: 'choice',
      prompt: 'Each iteration reduces window size by…',
      choices: { a: '1', b: 'half', c: 'n', d: 'log n' },
      answer: ['b'],
      why: 'lo=mid+1 or hi=mid-1 halves the search space → O(log n).',
    },
    {
      id: 'bin-3',
      kind: 'choice',
      prompt: 'Without sorted input, binary search is…',
      choices: {
        a: 'still correct',
        b: 'incorrect (not merely slower)',
        c: 'linear',
        d: 'stable',
      },
      answer: ['b'],
      why: 'Precondition violation breaks the invariant.',
    },
  ],
  'dijkstra-invariant': [
    {
      id: 'di-1',
      kind: 'fill',
      prompt: 'When Dijkstra settles u, dist[u] is ____. (final / temporary)',
      answer: ['final'],
      why: 'Non-negative weights ⇒ no later path can improve a settled node.',
    },
    {
      id: 'di-2',
      kind: 'choice',
      prompt: 'Why Dijkstra fails on negative edges:',
      choices: {
        a: 'heap breaks',
        b: 'a settled node can later be improved',
        c: 'graph is disconnected',
        d: 'too many edges',
      },
      answer: ['b'],
      why: 'Settle-once invariant is false with negatives.',
    },
    {
      id: 'di-3',
      kind: 'choice',
      prompt: 'Bellman-Ford corrects this by…',
      choices: {
        a: 'random pivots',
        b: 'relaxing all edges V−1 times',
        c: 'sorting edges by weight',
        d: 'BFS',
      },
      answer: ['b'],
      why: 'Longest simple path has ≤ V−1 edges.',
    },
  ],
  'greedy-exchange': [
    {
      id: 'gx-1',
      kind: 'fill',
      prompt: 'Activity selection greedy rule: pick the ____ finishing activity. (one word)',
      answer: ['earliest', 'first', 'earliest-finishing'],
      why: 'Earliest finish maximizes remaining room.',
    },
    {
      id: 'gx-2',
      kind: 'choice',
      prompt: 'Exchange argument replaces an optimal solution’s first job with…',
      choices: {
        a: 'the longest job',
        b: 'the greedy choice without worsening the solution',
        c: 'a random job',
        d: 'the last job',
      },
      answer: ['b'],
      why: 'Then induct on the residual instance.',
    },
    {
      id: 'gx-3',
      kind: 'choice',
      prompt: 'Greedy is optimal on matroids because…',
      choices: {
        a: 'always sorts',
        b: 'hereditary + exchange properties',
        c: 'uses heaps',
        d: 'randomized',
      },
      answer: ['b'],
      why: 'Independence systems with hereditary + exchange = matroid.',
    },
  ],
  'np-reduction': [
    {
      id: 'np-1',
      kind: 'fill',
      prompt: 'A ≤_p B requires a ____-time function f mapping A-instances to B-instances.',
      answer: ['polynomial', 'poly'],
      why: 'f computable in time poly(|x|).',
    },
    {
      id: 'np-2',
      kind: 'choice',
      prompt: 'Equivalence to prove:',
      choices: {
        a: 'x ∈ A ⇔ f(x) ∈ B',
        b: 'x ∉ A ⇔ f(x) ∈ B',
        c: 'f(x) ∈ A',
        d: 'B ∈ P',
      },
      answer: ['a'],
      why: 'Both directions of the iff are required.',
    },
    {
      id: 'np-3',
      kind: 'choice',
      prompt: 'To show B NP-hard, reduce…',
      choices: {
        a: 'B to SAT',
        b: 'a known NPC problem to B',
        c: 'B to SORT',
        d: 'P to B',
      },
      answer: ['b'],
      why: 'Hardness flows downward along ≤_p.',
    },
    {
      id: 'np-4',
      kind: 'fill',
      prompt: '3-SAT → CLIQUE sets k equal to the number of ____. (clauses / variables / edges)',
      answer: ['clauses'],
      why: 'One clique node per clause-group.',
    },
  ],
  'master-thm': [
    {
      id: 'mt-1',
      kind: 'fill',
      prompt: 'In T(n)=aT(n/b)+f(n), compare f(n) with n^(__). (log_b a in words or "log")',
      answer: ['log_b a', 'logb a', 'log', 'n^log_b a', 'log b a'],
      why: 'Critical exponent log_b a decides the case.',
    },
    {
      id: 'mt-2',
      kind: 'choice',
      prompt: 'Merge sort 2T(n/2)+Θ(n) is Master Theorem case…',
      choices: { a: '1', b: '2', c: '3', d: 'none' },
      answer: ['b'],
      why: 'f = Θ(n^{log₂2}) = Θ(n) → case 2 → Θ(n log n).',
    },
    {
      id: 'mt-3',
      kind: 'choice',
      prompt: 'Karatsuba 3T(n/2)+Θ(n) is case…',
      choices: { a: '1', b: '2', c: '3', d: 'none' },
      answer: ['a'],
      why: 'f = n = O(n^{log₂3 − ε}) → leaves dominate.',
    },
    {
      id: 'mt-4',
      kind: 'fill',
      prompt: 'To claim T(n)=Θ(g(n)) you must prove both O(g) and __.(g)',
      answer: ['ω(g)', 'ω g', 'big omega g', 'ω', 'ω(g(n))', 'big-omega', 'bigomega'],
      why: 'Theta needs both bounds.',
    },
  ],
  'amortized-potential': [
    {
      id: 'am-1',
      kind: 'fill',
      prompt: 'Amortized cost = actual cost + change in ____. (potential / phi)',
      answer: ['potential', 'phi', 'φ', 'potential function'],
      why: 'Potential method definition.',
    },
    {
      id: 'am-2',
      kind: 'choice',
      prompt: 'Dynamic array doubling: push amortized cost is…',
      choices: { a: 'O(n)', b: 'O(1)', c: 'O(log n)', d: 'O(n²)' },
      answer: ['b'],
      why: 'Geometric series of copies is O(n) over n pushes.',
    },
    {
      id: 'am-3',
      kind: 'choice',
      prompt: 'Union-Find with path compression + rank is amortized…',
      choices: { a: 'O(1) exactly', b: 'O(α(n))', c: 'O(log n)', d: 'O(n)' },
      answer: ['b'],
      why: 'Inverse Ackermann — near constant, not literally O(1).',
    },
  ],
  'lower-bound': [
    {
      id: 'lb-1',
      kind: 'fill',
      prompt: 'A comparison sort decision tree with n elements has at least ____ leaves.',
      answer: ['n!', 'factorial n', 'nfact'],
      why: 'One leaf per permutation.',
    },
    {
      id: 'lb-2',
      kind: 'choice',
      prompt: 'Therefore worst-case comparisons are…',
      choices: { a: 'Ω(n)', b: 'Ω(n log n)', c: 'Ω(n²)', d: 'Ω(log n)' },
      answer: ['b'],
      why: 'Height ≥ log₂(n!) = Θ(n log n) by Stirling.',
    },
    {
      id: 'lb-3',
      kind: 'choice',
      prompt: 'Counting sort evades this bound because…',
      choices: {
        a: 'it is faster code',
        b: 'it is not a comparison sort',
        c: 'it uses GPU',
        d: 'it is randomized',
      },
      answer: ['b'],
      why: 'Model mismatch — keys are integers in a range.',
    },
  ],
};

/**
 * Frames for display of proof session current step.
 * @param {ReturnType<typeof createProofSession>} session
 * @param {string} bankName
 */
export function proofFrames(session, bankName) {
  const step = session.current;
  if (!step) {
    return [
      {
        type: 'done',
        message: session.allCorrect
          ? `proof drill complete — all ${session.total} steps correct`
          : 'proof drill complete',
        extra: { kind: 'proof', bank: bankName, done: true, allCorrect: session.allCorrect },
      },
    ];
  }
  return [
    {
      type: 'info',
      message: step.prompt,
      extra: {
        kind: 'proof',
        bank: bankName,
        step: session.index + 1,
        total: session.total,
        prompt: step.prompt,
        choices: step.choices || null,
      },
    },
  ];
}
