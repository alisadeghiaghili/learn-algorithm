/**
 * Red-Black tree — CLRS Chapter 13 INSERT + INSERT-FIXUP (cases 1–4 complete).
 * NIL is represented as null; every real node has color 'R' | 'B'.
 */

/**
 * @param {number[]} keys
 */
export function redBlackInserts(keys) {
  /** @type {any} */
  let root = null;
  const frames = [];
  frames.push({
    type: 'info',
    message: `red-black insert ${JSON.stringify(keys)} · CLRS ch.13 · O(log n)`,
    extra: { kind: 'rb', tree: null, last: null, case: null },
  });

  function clone(n) {
    if (!n) return null;
    return {
      key: n.key,
      color: n.color,
      l: clone(n.l),
      r: clone(n.r),
      p: null,
    };
  }

  function dump(z, caseId) {
    const t = clone(root);
    return {
      kind: 'rb',
      tree: t,
      last: z?.key ?? null,
      case: caseId ?? null,
    };
  }

  function leftRotate(x) {
    const y = x.r;
    x.r = y.l;
    if (y.l) y.l.p = x;
    y.p = x.p;
    if (!x.p) root = y;
    else if (x === x.p.l) x.p.l = y;
    else x.p.r = y;
    y.l = x;
    x.p = y;
  }

  function rightRotate(y) {
    const x = y.l;
    y.l = x.r;
    if (x.r) x.r.p = y;
    x.p = y.p;
    if (!y.p) root = x;
    else if (y === y.p.l) y.p.l = x;
    else y.p.r = x;
    x.r = y;
    y.p = x;
  }

  /** CLRS INSERT-FIXUP */
  function insertFixup(z) {
    while (z.p && z.p.color === 'R') {
      if (z.p === z.p.p?.l) {
        const y = z.p.p?.r; // uncle
        if (y && y.color === 'R') {
          // case 1: uncle red → recolor
          frames.push({
            type: 'swap',
            message: `case 1 at ${z.key}: uncle red → recolor parent/uncle black, grandparent red`,
            extra: dump(z, 1),
          });
          z.p.color = 'B';
          y.color = 'B';
          z.p.p.color = 'R';
          z = z.p.p;
        } else {
          if (z === z.p.r) {
            // case 2: triangle → left rotate
            frames.push({
              type: 'swap',
              message: `case 2 at ${z.key}: triangle → left rotate parent`,
              extra: dump(z, 2),
            });
            z = z.p;
            leftRotate(z);
          }
          // case 3: line → recolor + right rotate
          frames.push({
            type: 'swap',
            message: `case 3 at ${z.key}: line → parent black, grandparent red, right rotate`,
            extra: dump(z, 3),
          });
          z.p.color = 'B';
          z.p.p.color = 'R';
          rightRotate(z.p.p);
        }
      } else {
        const y = z.p.p?.l; // uncle (symmetric)
        if (y && y.color === 'R') {
          frames.push({
            type: 'swap',
            message: `case 1′ at ${z.key}: uncle red → recolor`,
            extra: dump(z, 1),
          });
          z.p.color = 'B';
          y.color = 'B';
          z.p.p.color = 'R';
          z = z.p.p;
        } else {
          if (z === z.p.l) {
            frames.push({
              type: 'swap',
              message: `case 2′ at ${z.key}: triangle → right rotate parent`,
              extra: dump(z, 2),
            });
            z = z.p;
            rightRotate(z);
          }
          frames.push({
            type: 'swap',
            message: `case 3′ at ${z.key}: line → recolor + left rotate`,
            extra: dump(z, 3),
          });
          z.p.color = 'B';
          z.p.p.color = 'R';
          leftRotate(z.p.p);
        }
      }
    }
    frames.push({
      type: 'info',
      message: `force root black (property 2)`,
      extra: dump(z, 4),
    });
    root.color = 'B';
  }

  function insert(key) {
    let y = null;
    let x = root;
    while (x) {
      y = x;
      x = key < x.key ? x.l : x.r;
    }
    const z = { key, color: 'R', l: null, r: null, p: y };
    if (!y) root = z;
    else if (key < y.key) y.l = z;
    else y.r = z;

    frames.push({
      type: 'visit',
      message: `insert ${key} as red leaf`,
      extra: dump(z, null),
    });
    insertFixup(z);
    frames.push({
      type: 'set',
      message: `after fixup · tree valid`,
      extra: dump(z, null),
    });
  }

  for (const k of keys) insert(k);

  const h = height(root);
  frames.push({
    type: 'done',
    message: `red-black tree · properties 1–4 hold · height=${h} ≤ 2 log₂(n+1)`,
    extra: { kind: 'rb', tree: clone(root), done: true, height: h },
  });
  return frames;
}

/**
 * Validate RB properties (used by tests).
 * @param {any} n
 */
export function validateRedBlack(root) {
  if (!root) return { ok: true, bh: 1 };
  if (root.color !== 'B') return { ok: false, why: 'root not black' };

  /**
   * @returns {number} black height if ok, -1 if violation
   */
  function bh(n, parentColor) {
    if (!n) return 1;
    if (parentColor === 'R' && n.color === 'R') return -1; // red-red
    const l = bh(n.l, n.color);
    const r = bh(n.r, n.color);
    if (l < 0 || r < 0 || l !== r) return -1;
    return l + (n.color === 'B' ? 1 : 0);
  }
  const height = bh(root, 'B');
  return { ok: height >= 1, bh: height };
}

function height(n) {
  return n ? 1 + Math.max(height(n.l), height(n.r)) : 0;
}
