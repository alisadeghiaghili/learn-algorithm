import { SORTERS } from '../algorithms/sorting.js';
import { SEARCHERS } from '../algorithms/searching.js';
import { GRAPHERS } from '../algorithms/graphs.js';
import { GRAPHERS_EXTRA } from '../algorithms/graphsExtra.js';
import { DPS } from '../algorithms/dp.js';
import { DPS_EXTRA } from '../algorithms/dpExtra.js';
import { LINEAR_SORTERS, quickSelect } from '../algorithms/linearSorts.js';
import { STRUCTURES } from '../algorithms/structures.js';
import { AVL } from '../algorithms/avl.js';
import { GREEDY, STRINGS, FLOW, NP, DC, THEORYRUN } from '../algorithms/extras.js';
import { STRINGS_EXTRA, RANDOMIZED } from '../algorithms/stringsExtra.js';
import { NP_BUILD } from '../algorithms/npBuild.js';
import { SELECT_MOM } from '../algorithms/mom.js';
import { PEAK } from '../algorithms/peak.js';
import { GADGETS } from '../algorithms/gadgets.js';
import { createProofSession, proofFrames, proofBanks } from '../algorithms/proofEngine.js';
import { masteryBanks, gradeMastery } from '../curriculum/mastery.js';
import { proofWritingTasks, gradeProofDraft } from '../algorithms/proofWriter.js';
import { workedProblems, selfCheckWorked } from '../curriculum/worked.js';

/**
 * Auto runners keyed by mode:algo
 * @param {import('../engine/SandboxState.js').SandboxState} state
 */
export function buildAutoFrames(state) {
  const algo = state.algo;
  const mode = state.mode;

  if (mode === 'sort') {
    if (LINEAR_SORTERS[algo]) return LINEAR_SORTERS[algo](state.array);
    return (SORTERS[algo] || SORTERS.bubble)(state.array);
  }
  if (mode === 'search') {
    if (algo === 'select' || algo === 'mom') {
      return SELECT_MOM.medianOfMediansSelect(state.array, state.meta.k ?? 0);
    }
    let arr = state.array.slice();
    if (algo === 'binary') arr = arr.slice().sort((x, y) => x - y);
    const target = state.target ?? arr[Math.floor(arr.length / 3)];
    state.target = target;
    state.array = arr;
    return (SEARCHERS[algo] || SEARCHERS.linear)(arr, target);
  }
  if (mode === 'graph') {
    if (algo === 'vc') return PEAK.vertexCover2Approx(state.graph);
    if (GRAPHERS_EXTRA[algo]) return GRAPHERS_EXTRA[algo](state.graph, 0);
    return (GRAPHERS[algo] || GRAPHERS.bfs)(state.graph, 0);
  }
  if (mode === 'flow') {
    return FLOW.edmondsKarp(state.graph, 0, state.graph.nodes.length - 1);
  }
  if (mode === 'dp') {
    if (DPS_EXTRA[algo]) return DPS_EXTRA[algo]();
    return (DPS[algo] || DPS.fib)();
  }
  if (mode === 'greedy') {
    if (algo === 'huffman') {
      return GREEDY.huffman(state.meta.freq || { A: 5, B: 2, C: 1, D: 1 });
    }
    if (algo === 'matroid') {
      return PEAK.matroidGreedy(state.meta.weights || [8, 6, 5, 4, 3], state.meta.k ?? 3);
    }
    return GREEDY.activitySelection(
      state.meta.acts || [
        [1, 4],
        [3, 5],
        [0, 6],
        [5, 7],
        [3, 9],
        [5, 9],
        [6, 10],
        [8, 11],
      ],
    );
  }
  if (mode === 'string') {
    if (algo === 'stree') {
      return PEAK.suffixTreeMatch(state.meta.text || 'banana', state.meta.pat || 'ana');
    }
    if (STRINGS_EXTRA[algo]) return STRINGS_EXTRA[algo](state.meta.text || 'AABAABAAB');
    const text = state.meta.text || 'AABAABAAB';
    const pat = state.meta.pat || 'AAB';
    return (STRINGS[algo] || STRINGS.kmp)(text, pat);
  }
  if (mode === 'ds') {
    if (algo === 'avl') return AVL.avlInserts(state.meta.keys || [30, 20, 10, 25, 28, 5, 40]);
    if (algo === 'rb') return PEAK.redBlackInserts(state.meta.keys || [10, 20, 30, 15, 25]);
    if (algo === 'bst' || algo === 'bst-insert') {
      return STRUCTURES.bstInserts(state.meta.keys || [8, 3, 10, 1, 6, 14, 4, 7, 13]);
    }
    if (algo === 'bst-search') {
      return STRUCTURES.bstSearch(state.meta.keys || [8, 3, 10, 1, 6, 14, 4, 7, 13], state.meta.searchKey ?? 6);
    }
    if (algo === 'heap') {
      return STRUCTURES.heapInserts(state.meta.keys || [20, 15, 8, 10, 7, 6, 3]);
    }
    if (algo === 'uf') {
      return STRUCTURES.unionFind(
        state.meta.ufOps || [
          ['u', 'a', 'b'],
          ['u', 'c', 'd'],
          ['u', 'b', 'c'],
          ['f', 'a', 0],
          ['u', 'e', 'f'],
          ['f', 'a', 0],
        ],
      );
    }
    if (algo === 'hash') {
      return STRUCTURES.hashLinear(state.meta.keys || [10, 22, 31, 4, 15, 28, 17, 88, 59], 11);
    }
  }
  if (mode === 'np') {
    if (algo === 'build' || algo === 'clique-build') {
      return NP_BUILD.cliquesFrom3sat({
        clauses: state.meta.clauses || [
          ['x', 'y', 'z'],
          ['!x', 'y', 'w'],
          ['!y', '!z', 'w'],
        ],
      });
    }
    if (algo === 'gadget') {
      return GADGETS.clauseTo3Cnf(state.meta.clause || ['a', 'b', 'c', 'd', 'e']);
    }
    const key = ['sat-3sat', '3sat-clique', 'clique-vc'].includes(algo) ? algo : 'sat-3sat';
    return NP.npReduction(key);
  }
  if (mode === 'random') {
    return RANDOMIZED.freivalds(
      state.meta.A || [[1, 2], [3, 4]],
      state.meta.B || [[5, 6], [7, 8]],
      state.meta.C || [[19, 22], [43, 50]],
    );
  }
  if (mode === 'dc') {
    if (algo === 'closest') {
      return DC.closestPair(state.meta.points || [
        [2, 3], [12, 30], [40, 50], [5, 1], [12, 10], [3, 4],
      ]);
    }
    if (algo === 'fft' || algo === 'poly') {
      return PEAK.polyMultiply(state.meta.pa || [1, 2, 3], state.meta.pb || [4, 5, 6]);
    }
    return THEORYRUN.masterTheorem(
      state.meta.a ?? 2,
      state.meta.b ?? 2,
      'poly',
      state.meta.fPower ?? 1,
      state.meta.logPow ?? 0,
    );
  }
  if (mode === 'theory') {
    return THEORYRUN.masterTheorem(
      state.meta.a ?? 2,
      state.meta.b ?? 2,
      'poly',
      state.meta.fPower ?? 1,
      state.meta.logPow ?? 0,
    );
  }
  if (mode === 'proof') {
    const bank = proofBanks[state.meta.bank || state.algo] || proofBanks['insertion-invariant'];
    const session = createProofSession(bank);
    state.meta._proofSession = { bankName: state.meta.bank || state.algo, idx: 0, log: [] };
    return proofFrames(session, state.meta.bank || state.algo);
  }
  if (mode === 'mastery') {
    const unit = state.meta.unit || state.algo || 'asymptotics';
    const bank = masteryBanks[unit] || masteryBanks.asymptotics;
    state.meta.masteryUnit = unit;
    state.meta.masteryIdx = 0;
    state.meta.masteryScore = 0;
    state.meta.masteryDone = false;
    return masteryFrames(state, 0, null);
  }
  if (mode === 'prooWrite' || mode === 'proofWrite' || mode === 'write') {
    const taskId = state.meta.taskId || state.algo || 'write-insertion';
    const task = proofWritingTasks[taskId] || proofWritingTasks['write-insertion'];
    state.meta.proofTaskId = task.id;
    state.meta.proofDraft = {};
    state.meta.proofStatus = {};
    state.meta.proofWriteDone = false;
    return [
      {
        type: 'info',
        message: `proof writer: ${task.title}`,
        extra: {
          kind: 'prooWrite',
          title: task.title,
          fields: task.fields.map((f) => ({ id: f.id, label: f.label, hint: f.hint })),
          status: {},
          setup: task.setup,
        },
      },
    ];
  }
  if (mode === 'worked') {
    const id = state.meta.workedId || state.algo || 'wp-sort-inv';
    const p = workedProblems.find((x) => x.id === id) || workedProblems[0];
    state.meta.workedId = p.id;
    state.meta.workedShown = false;
    return [
      {
        type: 'info',
        message: `worked problem ${p.id}: ${p.problem.slice(0, 100)}…`,
        extra: {
          kind: 'prooWrite',
          title: `Worked · ${p.unit}`,
          fields: p.steps.map((s, i) => ({ id: `s${i}`, label: `Step ${i + 1}`, hint: s })),
          status: {},
          setup: p.problem,
        },
      },
    ];
  }

  return [
    {
      type: 'info',
      array: state.array.slice(),
      message: 'nothing to run — try `set sort bubble` then `run`',
    },
  ];
}

function masteryFrames(state, idx, feedback) {
  const unit = state.meta.masteryUnit || 'asymptotics';
  const bank = masteryBanks[unit] || [];
  if (idx >= bank.length) {
    const score = state.meta.masteryScore || 0;
    const total = bank.length;
    state.meta.masteryDone = score === total;
    return [
      {
        type: 'done',
        message: `mastery ${unit}: ${score}/${total}${score === total ? ' ✓' : ''}`,
        extra: {
          kind: 'proof',
          bank: `mastery:${unit}`,
          done: true,
          allCorrect: score === total,
          score,
          total,
        },
      },
    ];
  }
  const item = bank[idx];
  return [
    {
      type: 'info',
      message: `${feedback ? feedback + ' · ' : ''}Q${idx + 1}/${bank.length}: ${item.prompt}`,
      extra: {
        kind: 'proof',
        bank: `mastery:${unit}`,
        step: idx + 1,
        total: bank.length,
        prompt: `${idx + 1}. ${item.prompt}`,
        choices: item.choices || null,
        kindHint: item.kind,
        score: state.meta.masteryScore || 0,
      },
    },
  ];
}

/**
 * Player-driven moves for golf levels.
 * @param {string} name
 * @param {string[]} args
 * @param {import('../engine/SandboxState.js').SandboxState} state
 */
export function playerMove(name, args, state) {
  const a = state.array;
  switch (name) {
    case 'compare': {
      const i = Number(args[0]);
      const j = Number(args[1]);
      if (!valid(i, a.length) || !valid(j, a.length)) {
        throw new Error('usage: compare i j');
      }
      return {
        type: 'compare',
        indices: [i, j],
        array: a.slice(),
        sorted: state.sorted.slice(),
        message: `compare a[${i}]=${a[i]} vs a[${j}]=${a[j]}`,
      };
    }
    case 'swap': {
      const i = Number(args[0]);
      const j = Number(args[1]);
      if (!valid(i, a.length) || !valid(j, a.length)) {
        throw new Error('usage: swap i j');
      }
      const snap = a.slice();
      [a[i], a[j]] = [a[j], a[i]];
      return {
        type: 'swap',
        indices: [i, j],
        array: a.slice(),
        sorted: state.sorted.slice(),
        message: `swap a[${i}] ↔ a[${j}] → [${a.join(', ')}]`,
        extra: { before: snap },
      };
    }
    case 'probe': {
      const i = Number(args[0]);
      if (!valid(i, a.length)) throw new Error('usage: probe mid');
      const target = state.target;
      return {
        type: 'compare',
        indices: [i],
        array: a.slice(),
        sorted: state.sorted.slice(),
        message: `probe a[${i}]=${a[i]}${target != null ? ` vs target ${target}` : ''}`,
        extra: { target, mid: i },
      };
    }
    case 'lo':
    case 'hi': {
      const expr = args.join(' ').replace(/\s+/g, '');
      const m = expr.match(/^(mid|(\d+))([+-]\d+)?$/i);
      let val;
      if (m) {
        const base = /^mid$/i.test(m[1]) ? (state.meta.mid ?? 0) : Number(m[2]);
        const delta = m[3] ? Number(m[3]) : 0;
        val = base + delta;
      } else {
        val = Number(expr);
      }
      if (Number.isNaN(val)) throw new Error('usage: lo mid+1 | hi mid-1');
      if (name === 'lo') state.meta.lo = val;
      else state.meta.hi = val;
      state.meta.mid = Math.floor(((state.meta.lo ?? 0) + (state.meta.hi ?? a.length - 1)) / 2);
      return {
        type: 'info',
        indices: [state.meta.mid],
        array: a.slice(),
        sorted: state.sorted.slice(),
        range: [state.meta.lo ?? 0, state.meta.hi ?? a.length - 1],
        pivot: state.meta.mid,
        message: `window [${state.meta.lo ?? 0}..${state.meta.hi ?? a.length - 1}] mid=${state.meta.mid}`,
        extra: { target: state.target, lo: state.meta.lo, hi: state.meta.hi, mid: state.meta.mid },
      };
    }
    case 'visit': {
      const id = args[0];
      const visited = new Set(state.meta.visited || []);
      const key = Number.isNaN(Number(id)) ? id : Number(id);
      if (visited.has(key)) throw new Error('already visited');
      visited.add(key);
      state.meta.visited = [...visited];
      const order = state.meta.order || [];
      order.push(key);
      state.meta.order = order;
      const label =
        state.graph?.nodes?.[key]?.label ?? (typeof key === 'string' ? key : String(key));
      return {
        type: 'visit',
        indices: [key],
        message: `visit ${label}`,
        extra: { visited: [...visited], tree: state.meta.tree || [], order: [...order] },
      };
    }
    case 'relax':
    case 'pick': {
      const u = Number(args[0]);
      const v = Number(args[1]);
      if (Number.isNaN(u) || Number.isNaN(v)) throw new Error(`usage: ${name} u v`);
      const tree = state.meta.tree || [];
      const exists = tree.some(
        ([a0, b0]) => (a0 === u && b0 === v) || (a0 === v && b0 === u),
      );
      if (name === 'pick' && exists) throw new Error('edge already picked');
      if (!exists) tree.push([u, v]);
      state.meta.tree = tree;
      const ul = state.graph.nodes[u]?.label ?? u;
      const vl = state.graph.nodes[v]?.label ?? v;
      return {
        type: 'relax',
        indices: [u, v],
        message: `${name} ${ul}–${vl}`,
        extra: { visited: state.meta.visited || [], tree, source: state.meta.source ?? 0 },
      };
    }
    case 'answer': {
      const q = String(args[0]);
      const rest = args.slice(1).join(' ');
      const choice = String(rest).toLowerCase();
      if (state.mode === 'mastery') {
        return masterySubmit(state, rest || q);
      }
      if (state.mode === 'prooWrite' || state.mode === 'proofWrite' || state.mode === 'write') {
        return proofWriteSubmit(state, args);
      }
      // proof session path
      if (state.meta._proofSession || state.mode === 'proof') {
        return proofSubmit(state, choice || q);
      }
      const answers = state.meta.answers || (state.meta.answers = {});
      answers[q] = choice;
      return {
        type: 'info',
        message: `answer ${q} → ${choice}`,
        extra: { kind: 'np', title: 'quiz', step: 0, total: 0, answers },
      };
    }
    case 'field': {
      // field <id> <text...> for proof writer
      return proofWriteSubmit(state, args);
    }
    case 'worked': {
      const sub = (args[0] || '').toLowerCase();
      const id = state.meta.workedId || 'wp-sort-inv';
      const p = workedProblems.find((x) => x.id === id) || workedProblems[0];
      if (sub === 'show' || sub === 'solution' || !sub) {
        state.meta.workedShown = true;
        return {
          type: 'done',
          message: p.solution,
          extra: {
            kind: 'prooWrite',
            title: `Solution · ${p.id}`,
            fields: p.steps.map((s, i) => ({ id: `s${i}`, label: `Step ${i + 1}`, hint: s })),
            status: Object.fromEntries(p.steps.map((_, i) => [`s${i}`, true])),
            setup: p.problem,
            allOk: true,
          },
        };
      }
      if (sub === 'check') {
        const text = args.slice(1).join(' ');
        const r = selfCheckWorked(p, text);
        return {
          type: r.ok ? 'set' : 'info',
          message: r.ok
            ? `self-check ok · hit ${r.hit.join(', ')}`
            : `self-check · need more of: ${r.need.join(', ')}`,
          extra: {
            kind: 'prooWrite',
            title: `Check · ${p.id}`,
            fields: p.steps.map((s, i) => ({ id: `s${i}`, label: `Step ${i + 1}`, hint: s })),
            status: {},
            setup: p.problem,
          },
        };
      }
      // set worked id
      const next = workedProblems.find((x) => x.id === sub || x.id === args.join(''));
      if (next) {
        state.meta.workedId = next.id;
        state.meta.workedShown = false;
        return {
          type: 'info',
          message: `worked problem → ${next.id}`,
          extra: { kind: 'prooWrite', title: next.id, fields: [], status: {} },
        };
      }
      throw new Error('usage: worked show | worked check "text" | worked <id>');
    }
    case 'insert':
    case 'bst': {
      const key = Number(args[0]);
      if (Number.isNaN(key)) throw new Error('usage: insert KEY');
      const keys = state.meta.keys || [];
      keys.push(key);
      state.meta.keys = keys;
      return STRUCTURES.bstInserts([key]).at(-1);
    }
    default:
      throw new Error(`unhandled move: ${name}`);
  }
}

function valid(i, n) {
  return Number.isInteger(i) && i >= 0 && i < n;
}

/**
 * field init "text..." — grade structured proof field.
 */
function proofWriteSubmit(state, args) {
  const taskId = state.meta.proofTaskId || 'write-insertion';
  const task = proofWritingTasks[taskId];
  if (!task) throw new Error('unknown proof task');
  const fieldId = args[0];
  const text = args.slice(1).join(' ');
  const field = task.fields.find((f) => f.id === fieldId);
  if (!field) {
    throw new Error(`usage: field <${task.fields.map((f) => f.id).join('|')}> <text>`);
  }
  const draft = state.meta.proofDraft || (state.meta.proofDraft = {});
  const status = state.meta.proofStatus || (state.meta.proofStatus = {});
  draft[fieldId] = text;
  const graded = gradeProofDraft(task, draft);
  for (const [id, r] of Object.entries(graded.results)) status[id] = r.ok;
  const thisR = graded.results[fieldId];
  state.meta.proofWriteDone = graded.ok;

  return {
    type: thisR.ok ? 'set' : 'error',
    message: thisR.ok
      ? `✓ field ${fieldId} accepted`
      : `✗ field ${fieldId}: ${thisR.why}`,
    extra: {
      kind: 'prooWrite',
      title: task.title,
      fields: task.fields.map((f) => ({ id: f.id, label: f.label, hint: f.hint })),
      status: { ...status },
      fieldId,
      feedback: thisR.why,
      ok: thisR.ok,
      allOk: graded.ok,
    },
  };
}

function masterySubmit(state, input) {
  const unit = state.meta.masteryUnit || 'asymptotics';
  const bank = masteryBanks[unit] || [];
  const idx = state.meta.masteryIdx || 0;
  if (idx >= bank.length) {
    return {
      type: 'info',
      message: 'mastery unit complete — `run` to retry',
      extra: { kind: 'proof', bank: `mastery:${unit}`, done: true },
    };
  }
  const item = bank[idx];
  const res = gradeMastery(item, input);
  if (res.ok) {
    state.meta.masteryScore = (state.meta.masteryScore || 0) + 1;
    state.meta.masteryIdx = idx + 1;
  }
  const frame = masteryFrames(
    state,
    state.meta.masteryIdx || 0,
    res.ok ? `✓` : `✗`,
  )[0];
  frame.message = res.ok
    ? `✓ Q${idx + 1} ok — ${res.why}`
    : `✗ expected “${item.answer}” — ${res.why}`;
  return frame;
}

function proofSubmit(state, input) {
  const bankName = state.meta.bank || state.algo || 'insertion-invariant';
  const bank = proofBanks[bankName] || proofBanks['insertion-invariant'];
  const st = state.meta._proofSession || (state.meta._proofSession = { idx: 0, log: [], bankName });
  if (st.bankName !== bankName) {
    // finished previous bank
    if (st.idx >= bank.length || state.meta.proofDone) {
      const done = state.meta.proofBanksDone || (state.meta.proofBanksDone = []);
      if (!done.includes(st.bankName)) done.push(st.bankName);
    }
    st.bankName = bankName;
    st.idx = 0;
    st.log = [];
    state.meta.proofDone = false;
  }
  const session = createProofSession(bank);
  for (let i = 0; i < st.idx; i += 1) {
    session.submit(bank[i].answer[0]);
  }
  const res = session.submit(input);
  if (res.ok) st.idx = session.index;
  st.log.push({ input, ok: res.ok });
  state.meta._proofIdx = st.idx;
  state.meta.proofDone = session.done && session.allCorrect;
  if (state.meta.proofDone) {
    const done = state.meta.proofBanksDone || (state.meta.proofBanksDone = []);
    if (!done.includes(bankName)) done.push(bankName);
  }
  const frames = proofFrames(session, bankName);
  frames[0].message = res.ok ? `✓ ${frames[0].message}` : `✗ ${res.why}`;
  return frames[0];
}
