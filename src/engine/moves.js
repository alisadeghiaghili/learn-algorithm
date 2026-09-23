import { SORTERS } from '../algorithms/sorting.js';
import { SEARCHERS } from '../algorithms/searching.js';
import { GRAPHERS } from '../algorithms/graphs.js';
import { DPS } from '../algorithms/dp.js';

/**
 * Turn a named auto algorithm into frames from current sandbox state.
 * @param {import('../engine/SandboxState.js').SandboxState} state
 */
export function buildAutoFrames(state) {
  if (state.mode === 'sort' || (state.kind === 'array' && state.mode !== 'search')) {
    const fn = SORTERS[state.algo] || SORTERS.bubble;
    return fn(state.array);
  }
  if (state.mode === 'search') {
    let arr = state.array.slice();
    if (state.algo === 'binary') {
      arr = arr.slice().sort((x, y) => x - y);
    }
    const target = state.target ?? arr[Math.floor(arr.length / 3)];
    state.target = target;
    state.array = arr;
    const fn = SEARCHERS[state.algo] || SEARCHERS.linear;
    return fn(arr, target);
  }
  if (state.mode === 'graph') {
    const fn = GRAPHERS[state.algo] || GRAPHERS.bfs;
    return fn(state.graph, 0);
  }
  if (state.mode === 'dp') {
    const fn = DPS[state.algo] || DPS.fib;
    return fn();
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
 * @returns {import('../engine/types.js').Frame}
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
      // lo mid+1 / hi mid-1 style window shrink — recorded in meta
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
      const id = Number(args[0]);
      if (Number.isNaN(id)) throw new Error('usage: visit ID');
      const visited = new Set(state.meta.visited || []);
      if (visited.has(id)) throw new Error('already visited');
      visited.add(id);
      state.meta.visited = [...visited];
      const order = state.meta.order || [];
      order.push(id);
      state.meta.order = order;
      const label = state.graph.nodes[id]?.label ?? id;
      return {
        type: 'visit',
        indices: [id],
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
    default:
      throw new Error(`unhandled move: ${name}`);
  }
}

function valid(i, n) {
  return Number.isInteger(i) && i >= 0 && i < n;
}
