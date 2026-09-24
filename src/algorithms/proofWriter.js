/**
 * Structured proof writer — learner fills induction / invariant steps as free-ish
 * structured fields, graded against required keywords + mandatory steps.
 *
 * Example (insertion sort):
 *   steps: init | maintenance | termination | conclusion
 * Each step has required phrases (all must appear, order-free) and optional variants.
 */

/**
 * @typedef {Object} ProofTask
 * @property {string} id
 * @property {string} title
 * @property {string} setup  // problem statement
 * @property {ProofField[]} fields
 *
 * @typedef {Object} ProofField
 * @property {string} id
 * @property {string} label
 * @property {string} hint
 * @property {string[]} must   // all must appear (normalized, order-free)
 * @property {string[]} anyOf  // at least one group; each group is array of phrases — one of the groups must fully match
 * @property {string} sample   // shown after correct / on give-up
 */

/**
 * @type {Record<string, ProofTask>}
 */
export const proofWritingTasks = {
  'write-insertion': {
    id: 'write-insertion',
    title: 'Prove insertion sort correct',
    setup:
      'Prove that insertion sort sorts any array A[0..n-1]. Use the standard loop-invariant method for the outer loop (for j = 1..n-1).',
    fields: [
      {
        id: 'init',
        label: 'Initialization (after j=1 first pass / before any iteration)',
        hint: 'What is true about the prefix before the first iteration?',
        must: ['sorted', 'permutation'],
        anyOf: [
          ['a[0]', 'empty', 'singleton', 'one element', 'trivial'],
          ['prefix', '0'],
        ],
        sample:
          'Before the first iteration the prefix a[0..0] is a single element, hence sorted, and a permutation of the original.',
      },
      {
        id: 'maintain',
        label: 'Maintenance (one step of the outer loop)',
        hint: 'How does key insertion preserve sortedness of the prefix?',
        must: ['key', 'insert', 'sorted'],
        anyOf: [['shift'], ['exchange', 'swap'], ['position'], ['prefix'], ['a[0..j]']],
        sample:
          'We insert key = A[j] into the sorted prefix a[0..j-1] by shifting larger elements right; the result a[0..j] is sorted and a permutation of the original a[0..j].',
      },
      {
        id: 'term',
        label: 'Termination',
        hint: 'Why does the loop end and what does the invariant give us?',
        must: ['j', 'n', 'sorted'],
        anyOf: [['permutation', 'multiset'], ['all'], ['whole', 'entire', 'a[0..n-1]']],
        sample:
          'The loop ends with j = n. The invariant says a[0..n-1] is sorted and a permutation of the input, hence A is sorted.',
      },
    ],
  },
  'write-dijkstra': {
    id: 'write-dijkstra',
    title: 'Prove Dijkstra settle-once invariant',
    setup:
      'Non-negative edge weights. When extract-min returns u, prove dist[u] is the true shortest-path distance and can never improve later.',
    fields: [
      {
        id: 'assumptions',
        label: 'Assumptions needed',
        hint: 'What must hold about weights?',
        must: [['non-negative', 'nonnegative', 'non negative', '≥ 0', '>= 0', 'no negative', 'w ≥', 'w>=']],
        anyOf: [['not negative'], ['w ≥ 0'], ['w(u,v)'], ['edge'], ['weight'], ['w']],
        sample: 'All edge weights satisfy w(u,v) ≥ 0.',
      },
      {
        id: 'claim',
        label: 'Invariant at settle time',
        hint: 'What do we claim about dist[u] when u is extracted?',
        must: ['final', 'shortest', 'distance'],
        anyOf: [['never'], ['improve'], ['optimal'], ['true']],
        sample:
          'When u is settled (extracted from the PQ), dist[u] is the true shortest-path distance and is final (never improved later).',
      },
      {
        id: 'contra',
        label: 'Contradiction sketch',
        hint: 'Assume a shorter path exists at settle time; derive a contradiction using non-negativity.',
        must: ['contradiction', 'shorter'],
        anyOf: [
          ['≥ 0', 'non-negative', 'nonnegative', 'w'],
          ['already', 'settled', 'extracted', 'before'],
          ['p', 'path', 'edge', 'relax'],
        ],
        sample:
          'Suppose a shorter s–u path P exists. Let (x,y) be the first edge on P leaving the settled set. dist[y] ≤ dist[x]+w(x,y) ≤ length(P prefix) ≤ dist[u], so y would have been extracted before u or improved u after — contradiction (case analysis on when y was settled; w ≥ 0).',
      },
    ],
  },
  'write-greedy-exchange': {
    id: 'write-greedy-exchange',
    title: 'Exchange argument for activity selection',
    setup:
      'Activities with start/finish times. Greedy picks the earliest-finishing compatible activity at each step. Prove optimality by exchange.',
    fields: [
      {
        id: 'greedy-step',
        label: 'Greedy choice statement',
        hint: 'What is the greedy choice and why is it safe?',
        must: ['earliest', 'finish'],
        anyOf: [['compatible'], ['first'], ['remaining'], ['room']],
        sample:
          'Let g be the earliest-finishing activity compatible with the schedule so far. We take g.',
      },
      {
        id: 'exchange',
        label: 'Exchange step',
        hint: 'Replace an optimal solution’s first job with g.',
        must: ['optimal', 'replace', 'g'],
        anyOf: [
          ['not worse', 'no worse', 'at least', '≥', 'as good'],
          ['compatible', 'feasible'],
          ['exchange', 'swap'],
        ],
        sample:
          'Let OPT be an optimal schedule. If OPT’s first job is already g we are done. Otherwise replace OPT’s first job with g: this stays feasible (g finishes no later) and does not reduce cardinality — actually the schedule remains as long / can only improve remaining room. Then induct on the residual instance.',
      },
      {
        id: 'induction',
        label: 'Induction on the residual instance',
        hint: 'After fixing g, what remains?',
        must: ['induction', 'residual', 'or', 'subproblem', 'remaining'],
        anyOf: [['optimal'], ['compatible'], ['n', 'fewer'], ['structure']],
        sample:
          'By induction on the number of remaining activities, greedy is optimal on the residual instance (those starting after g finishes), so the whole schedule is optimal.',
      },
    ],
  },
  'write-np-reduction': {
    id: 'write-np-reduction',
    title: 'Prove 3-SAT ≤_p CLIQUE',
    setup: 'Construct f from an arbitrary 3-CNF φ to (G,k) and prove φ satisfiable ⇔ G has a k-clique.',
    fields: [
      {
        id: 'construction',
        label: 'Construction',
        hint: 'Groups, edges, value of k.',
        must: ['group', 'clause', 'k'],
        anyOf: [['literal'], ['edge'], ['complement', 'contradict'], ['one']],
        sample:
          'One group of 3 nodes per clause (nodes = literals). Edges between literals of different groups unless they are complements (x and ¬x). Set k = number of clauses.',
      },
      {
        id: 'soundness',
        label: 'Soundness (satisfying assignment ⇒ k-clique)',
        hint: 'Pick one true literal per clause.',
        must: ['true', 'literal', 'clique'],
        anyOf: [['one'], ['clause'], ['consistent'], ['edge']],
        sample:
          'Given a satisfying assignment, pick one true literal per clause. These k nodes lie in different groups and no two contradict, so they form a k-clique.',
      },
      {
        id: 'completeness',
        label: 'Completeness (k-clique ⇒ satisfying assignment)',
        hint: 'Clique uses one node per group; no contradictions.',
        must: ['clique', 'assignment'],
        anyOf: [['group'], ['contradict'], ['true'], ['satisf']],
        sample:
          'A k-clique has ≤ 1 node per group (no intra-group edges) and k nodes ⇒ exactly one per group. No complement edges ⇒ set those literals true consistently; each clause has a true literal ⇒ φ is satisfied.',
      },
    ],
  },
  'write-master-subst': {
    id: 'write-master-subst',
    title: 'Substitution proof: T(n)=2T(n/2)+n is O(n log n)',
    setup: 'Prove T(n) ≤ c n log n for n ≥ 2 by substitution (induction).',
    fields: [
      {
        id: 'guess',
        label: 'Inductive hypothesis (the guess)',
        hint: 'State the IH for all m < n.',
        must: ['t(m)', 'c', 'm', 'log'],
        anyOf: [['≤'], ['assume'], ['induction'], ['all m'], ['hypothesis']],
        sample: 'IH: for all m < n, T(m) ≤ c m log m (and base cases with adjusted constant).',
      },
      {
        id: 'plug',
        label: 'Plug into the recurrence',
        hint: 'Expand T(n) ≤ 2 T(n/2) + n using IH.',
        must: ['2', 'n/2', 'n'],
        anyOf: [['c'], ['log'], ['≤'], ['cn']],
        sample:
          'T(n) ≤ 2 · c (n/2) log(n/2) + n = c n log n − c n + n = c n log n − (c−1)n ≤ c n log n for c ≥ 1.',
      },
      {
        id: 'base',
        label: 'Base case / constant shift',
        hint: 'Why might the raw guess fail at small n?',
        must: ['base'],
        anyOf: [['constant', 'shift', 'c'], ['T(1)', 'small'], ['adjust']],
        sample:
          'If T(1) > 0, use T(n) ≤ c n log n + T(1) or adjust the constant; handle n = 1,2 directly.',
      },
    ],
  },
};

/**
 * Normalize user text for keyword matching.
 * @param {string} s
 */
export function normProof(s) {
  return String(s).toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Grade one field.
 * `must` entries: string = required substring; array = one of those synonyms required.
 * `anyOf`: at least one phrase (or one entry from a nested group) must appear.
 * @param {ProofField} field
 * @param {string} text
 */
export function gradeProofField(field, text) {
  const t = normProof(text);
  const missing = [];
  for (const m of field.must) {
    const phrases = Array.isArray(m) ? m : [m];
    const hit = phrases.some((p) => {
      const mm = normProof(p);
      return t.includes(mm) || t.includes(mm.replace(/\s+/g, ''));
    });
    if (!hit) missing.push(phrases[0] + (phrases.length > 1 ? '…' : ''));
  }
  if (missing.length) {
    return {
      ok: false,
      why: `missing required: ${missing.join(', ')}`,
      missing,
    };
  }
  if (field.anyOf?.length) {
    const flatHits = field.anyOf.some((entry) => {
      const phrases = Array.isArray(entry) ? entry : [entry];
      return phrases.some((p) => t.includes(normProof(p)));
    });
    if (!flatHits) {
      return {
        ok: false,
        why: `needs at least one of: ${field.anyOf
          .map((e) => (Array.isArray(e) ? e.join('/') : e))
          .join(' · ')}`,
        missing: ['anyOf'],
      };
    }
  }
  return { ok: true, why: 'ok' };
}

/**
 * Grade a full proof draft.
 * @param {ProofTask} task
 * @param {Record<string,string>} draft fieldId → text
 */
export function gradeProofDraft(task, draft) {
  const results = {};
  let allOk = true;
  for (const f of task.fields) {
    const r = gradeProofField(f, draft?.[f.id] || '');
    results[f.id] = r;
    if (!r.ok) allOk = false;
  }
  return { ok: allOk, results };
}
