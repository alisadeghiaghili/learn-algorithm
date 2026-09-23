/**
 * Classic data structures as frame generators.
 * Trees: nodes { id, key, left, right, height? }
 */

/**
 * BST insert sequence.
 * @param {number[]} keys
 */
export function bstInserts(keys) {
  /** @type {any[]} */
  let root = null;
  const frames = [];
  frames.push({
    type: 'info',
    message: `BST inserts ${JSON.stringify(keys)} · search O(h)`,
    extra: { kind: 'tree', tree: null, ops: 'insert' },
  });

  for (const key of keys) {
    root = insert(root, key);
    frames.push({
      type: 'visit',
      message: `insert ${key}`,
      extra: { kind: 'tree', tree: cloneTree(root), highlight: key, ops: 'insert' },
    });
  }

  frames.push({
    type: 'done',
    message: `BST height = ${height(root)}`,
    extra: { kind: 'tree', tree: cloneTree(root), ops: 'done' },
  });
  return frames;
}

/**
 * @param {number[]} keys
 * @param {number} target
 */
export function bstSearch(keys, target) {
  let root = null;
  for (const k of keys) root = insert(root, k);
  const frames = [];
  frames.push({
    type: 'info',
    message: `BST search ${target}`,
    extra: { kind: 'tree', tree: cloneTree(root), path: [], target },
  });
  let cur = root;
  const path = [];
  while (cur) {
    path.push(cur.key);
    frames.push({
      type: 'compare',
      indices: [cur.key],
      message: `at ${cur.key} ${cur.key === target ? '=' : cur.key < target ? '< → right' : '> → left'} ${target}`,
      extra: { kind: 'tree', tree: cloneTree(root), path: path.slice(), target, highlight: cur.key },
    });
    if (cur.key === target) {
      frames.push({
        type: 'done',
        message: `found ${target}`,
        extra: { kind: 'tree', tree: cloneTree(root), path: path.slice(), target, highlight: target },
      });
      return frames;
    }
    cur = cur.key < target ? cur.right : cur.left;
  }
  frames.push({
    type: 'done',
    message: `${target} not found`,
    extra: { kind: 'tree', tree: cloneTree(root), path, target },
  });
  return frames;
}

/**
 * Binary max-heap inserts.
 * @param {number[]} keys
 */
export function heapInserts(keys) {
  /** @type {number[]} */
  const heap = [];
  const frames = [];
  frames.push({
    type: 'info',
    message: `heap inserts · sift-up O(log n) each`,
    extra: { kind: 'heap', heap: heap.slice(), active: [] },
  });
  for (const key of keys) {
    heap.push(key);
    let i = heap.length - 1;
    frames.push({
      type: 'set',
      indices: [i],
      message: `push ${key} at index ${i}`,
      extra: { kind: 'heap', heap: heap.slice(), active: [i] },
    });
    while (i > 0) {
      const p = (i - 1) >> 1;
      frames.push({
        type: 'compare',
        indices: [i, p],
        message: `compare child ${heap[i]} with parent ${heap[p]}`,
        extra: { kind: 'heap', heap: heap.slice(), active: [i, p] },
      });
      if (heap[i] > heap[p]) {
        [heap[i], heap[p]] = [heap[p], heap[i]];
        frames.push({
          type: 'swap',
          indices: [i, p],
          message: `sift-up ${heap[p]} ↔ ${heap[i]}`,
          extra: { kind: 'heap', heap: heap.slice(), active: [i, p] },
        });
        i = p;
      } else break;
    }
    frames.push({
      type: 'info',
      message: `heap now [${heap.join(', ')}]`,
      extra: { kind: 'heap', heap: heap.slice(), active: [] },
    });
  }
  frames.push({
    type: 'done',
    message: `max-heap built · max=${heap[0]}`,
    extra: { kind: 'heap', heap: heap.slice(), active: [] },
  });
  return frames;
}

/**
 * Union-Find with path compression.
 * @param {[string, number, number][]} ops ['u'|'f', a, b]
 */
export function unionFind(ops) {
  const parent = new Map();
  const rank = new Map();
  const frames = [];
  function make(x) {
    if (!parent.has(x)) {
      parent.set(x, x);
      rank.set(x, 0);
    }
  }
  function find(x, trace) {
    make(x);
    const path = [];
    let cur = x;
    while (parent.get(cur) !== cur) {
      path.push(cur);
      cur = parent.get(cur);
    }
    const root = cur;
    for (const p of path) parent.set(p, root);
    if (trace) trace.push({ path: [...path, root], root });
    return root;
  }

  frames.push({
    type: 'info',
    message: `union-find · path compression + union by rank · O(α(n))`,
    extra: { kind: 'uf', edges: [], comps: [] },
  });

  for (const [op, a, b] of ops) {
    if (op === 'f') {
      const trace = [];
      const r = find(a, trace);
      frames.push({
        type: 'visit',
        message: `FIND(${a}) → ${r}  path=${trace[0]?.path.join('↑') ?? a}`,
        extra: snapshot(),
      });
    } else {
      const ra = find(a, []);
      const rb = find(b, []);
      frames.push({
        type: 'compare',
        indices: [a, b],
        message: `UNION(${a},${b}) roots ${ra}, ${rb}`,
        extra: snapshot(),
      });
      if (ra === rb) {
        frames.push({
          type: 'info',
          message: `same component — skip`,
          extra: snapshot(),
        });
        continue;
      }
      let s = ra;
      let t = rb;
      if ((rank.get(s) ?? 0) < (rank.get(t) ?? 0)) [s, t] = [t, s];
      parent.set(t, s);
      if (rank.get(s) === rank.get(t)) rank.set(s, (rank.get(s) ?? 0) + 1);
      frames.push({
        type: 'relax',
        message: `union: ${t} → ${s}`,
        extra: snapshot(),
      });
    }
  }
  frames.push({ type: 'done', message: 'union-find done', extra: snapshot() });
  return frames;

  function snapshot() {
    const edges = [];
    for (const [k, p] of parent) {
      if (k !== p) edges.push([k, p]);
    }
    return { kind: 'uf', edges, comps: [...new Set([...parent.keys()].map((x) => find(x, [])))] };
  }
}

/**
 * Hash table linear probing.
 * @param {number[]} keys
 * @param {number} m
 */
export function hashLinear(keys, m = 11) {
  const table = Array(m).fill(null);
  const frames = [];
  const h = (k) => k % m;
  frames.push({
    type: 'info',
    message: `hash insert linear probe · m=${m} · h(k)=k mod m`,
    extra: { kind: 'hash', table: table.slice(), probes: [] },
  });
  for (const k of keys) {
    let i = h(k);
    const probes = [i];
    frames.push({
      type: 'compare',
      message: `insert ${k} → h=${i}`,
      extra: { kind: 'hash', table: table.slice(), probes: probes.slice(), key: k },
    });
    while (table[i] != null) {
      frames.push({
        type: 'compare',
        message: `collision at ${i} (has ${table[i]})`,
        extra: { kind: 'hash', table: table.slice(), probes: probes.slice(), key: k },
      });
      i = (i + 1) % m;
      probes.push(i);
    }
    table[i] = k;
    frames.push({
      type: 'set',
      message: `place ${k} at slot ${i}`,
      extra: { kind: 'hash', table: table.slice(), probes: probes.slice(), key: k },
    });
  }
  frames.push({
    type: 'done',
    message: 'hash table filled',
    extra: { kind: 'hash', table: table.slice(), probes: [] },
  });
  return frames;
}

function insert(node, key) {
  if (!node) return { key, left: null, right: null };
  if (key < node.key) node.left = insert(node.left, key);
  else if (key > node.key) node.right = insert(node.right, key);
  return node;
}

function height(node) {
  if (!node) return -1;
  return 1 + Math.max(height(node.left), height(node.right));
}

function cloneTree(node) {
  if (!node) return null;
  return { key: node.key, left: cloneTree(node.left), right: cloneTree(node.right) };
}

export const STRUCTURES = {
  bstInserts,
  bstSearch,
  heapInserts,
  unionFind,
  hashLinear,
};
