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

  return [
    {
      type: 'info',
      array: state.array.slice(),
      message: 'nothing to run — try `set sort bubble` then `run`',
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
