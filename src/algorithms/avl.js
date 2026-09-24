/**
 * AVL tree construction with rotation frames.
 * Node: { key, left, right, height }
 */

/**
 * @param {number[]} keys
 */
export function avlInserts(keys) {
  let root = null;
  const frames = [];
  frames.push({
    type: 'info',
    message: `AVL inserts ${JSON.stringify(keys)} · rebalance via rotations`,
    extra: { kind: 'tree', tree: null, ops: 'insert' },
  });

  for (const key of keys) {
    root = insert(root, key, frames);
    frames.push({
      type: 'visit',
      message: `inserted ${key} · height=${height(root)}`,
      extra: { kind: 'tree', tree: clone(root), highlight: key, ops: 'insert' },
    });
  }

  frames.push({
    type: 'done',
    message: `AVL built · height=${height(root)} · balance factors OK`,
    extra: { kind: 'tree', tree: clone(root), ops: 'done' },
  });
  return frames;
}

function height(n) {
  return n ? n.height : 0;
}

function update(n) {
  if (n) n.height = 1 + Math.max(height(n.left), height(n.right));
}

function bf(n) {
  return n ? height(n.left) - height(n.right) : 0;
}

function rotateRight(y) {
  const x = y.left;
  const t = x.right;
  x.right = y;
  y.left = t;
  update(y);
  update(x);
  return x;
}

function rotateLeft(x) {
  const y = x.right;
  const t = y.left;
  y.left = x;
  x.right = t;
  update(x);
  update(y);
  return y;
}

function insert(n, key, frames) {
  if (!n) {
    n = { key, left: null, right: null, height: 1 };
    return n;
  }
  if (key < n.key) n.left = insert(n.left, key, frames);
  else if (key > n.key) n.right = insert(n.right, key, frames);
  else return n;

  update(n);
  const balance = bf(n);

  if (balance > 1 && key < n.left.key) {
    frames.push({
      type: 'swap',
      message: `LL case at ${n.key} → right rotate`,
      extra: { kind: 'tree', tree: clone(n), highlight: n.key, rotate: 'LL' },
    });
    return rotateRight(n);
  }
  if (balance < -1 && key > n.right.key) {
    frames.push({
      type: 'swap',
      message: `RR case at ${n.key} → left rotate`,
      extra: { kind: 'tree', tree: clone(n), highlight: n.key, rotate: 'RR' },
    });
    return rotateLeft(n);
  }
  if (balance > 1 && key > n.left.key) {
    frames.push({
      type: 'swap',
      message: `LR case at ${n.key} → left then right rotate`,
      extra: { kind: 'tree', tree: clone(n), highlight: n.key, rotate: 'LR' },
    });
    n.left = rotateLeft(n.left);
    return rotateRight(n);
  }
  if (balance < -1 && key < n.right.key) {
    frames.push({
      type: 'swap',
      message: `RL case at ${n.key} → right then left rotate`,
      extra: { kind: 'tree', tree: clone(n), highlight: n.key, rotate: 'RL' },
    });
    n.right = rotateRight(n.right);
    return rotateLeft(n);
  }
  return n;
}

function clone(n) {
  if (!n) return null;
  return {
    key: n.key,
    height: n.height,
    left: clone(n.left),
    right: clone(n.right),
    bf: bf(n),
  };
}

export const AVL = { avlInserts };
