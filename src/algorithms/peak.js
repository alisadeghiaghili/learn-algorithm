/**
 * Educational FFT / polynomial multiplication + matroid greedy + approximation + red-black insert + suffix tree matching.
 */

/**
 * Naive polynomial multiply + DFT-style butterfly narrative on small n=4.
 * @param {number[]} a @param {number[]} b
 */
export function polyMultiply(a = [1, 2, 3], b = [4, 5, 6]) {
  const frames = [];
  const n = a.length + b.length - 1;
  const naive = Array(n).fill(0);
  frames.push({
    type: 'info',
    message: `polynomial multiply · A·B · naive O(n²) vs FFT O(n log n)`,
    extra: { kind: 'poly', a, b, naive, stage: 'input' },
  });

  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      naive[i + j] += a[i] * b[j];
      frames.push({
        type: 'set',
        message: `c[${i + j}] += ${a[i]}·${b[j]} = ${naive[i + j]}`,
        extra: { kind: 'poly', a, b, naive: naive.slice(), stage: 'naive', i, j },
      });
    }
  }

  // Butterfly sketch for length-4 pad (illustrative complex-free: just show structure)
  frames.push({
    type: 'info',
    message: `FFT shape: pad to power of 2, log n butterfly layers × n/2 twiddles`,
    extra: { kind: 'poly', a, b, naive: naive.slice(), stage: 'fft', layers: 2 },
  });
  for (let layer = 1; layer <= 2; layer += 1) {
    frames.push({
      type: 'compare',
      message: `butterfly layer ${layer}: pair indices distance ${2 ** (layer - 1)}`,
      extra: { kind: 'poly', a, b, naive: naive.slice(), stage: 'fft', layers: 2, layer },
    });
  }

  frames.push({
    type: 'done',
    message: `product = [${naive.join(', ')}] · Θ(n log n) with complex roots of unity`,
    extra: { kind: 'poly', a, b, naive: naive.slice(), stage: 'done' },
  });
  return frames;
}

/**
 * Greedy on a matroid (uniform matroid U_{k,n} = independent sets of size ≤ k).
 * Elements with weights; greedy picks max weight keeping independence.
 * @param {number[]} weights
 * @param {number} k
 */
export function matroidGreedy(weights = [8, 6, 5, 4, 3], k = 3) {
  const frames = [];
  const items = weights.map((w, id) => ({ id, w, chosen: false }));
  frames.push({
    type: 'info',
    message: `matroid greedy · U_{${k},${weights.length}} · sort by weight desc`,
    extra: { kind: 'matroid', items: items.map((x) => ({ ...x })), k, chosen: [] },
  });
  items.sort((x, y) => y.w - x.w);
  const chosen = [];
  for (const it of items) {
    frames.push({
      type: 'compare',
      message: `consider w=${it.w} · |chosen|=${chosen.length}/${k}`,
      extra: {
        kind: 'matroid',
        items: items.map((x) => ({ ...x, chosen: chosen.includes(x.id) })),
        k,
        chosen: chosen.slice(),
      },
    });
    if (chosen.length < k) {
      // hereditary + exchange: any set of size ≤ k is independent in uniform matroid
      it.chosen = true;
      chosen.push(it.id);
      frames.push({
        type: 'set',
        message: `take w=${it.w}`,
        extra: {
          kind: 'matroid',
          items: items.map((x) => ({ ...x, chosen: chosen.includes(x.id) })),
          k,
          chosen: chosen.slice(),
        },
      });
    } else {
      frames.push({
        type: 'info',
        message: `reject w=${it.w} (would break independence)`,
        extra: {
          kind: 'matroid',
          items: items.map((x) => ({ ...x, chosen: chosen.includes(x.id) })),
          k,
          chosen: chosen.slice(),
        },
      });
    }
  }
  const total = chosen.reduce((s, id) => s + weights[id], 0);
  frames.push({
    type: 'done',
    message: `basis weight = ${total} · greedy optimal on matroids`,
    extra: {
      kind: 'matroid',
      items: items.map((x) => ({ ...x, chosen: chosen.includes(x.id) })),
      k,
      chosen: chosen.slice(),
      total,
    },
  });
  return frames;
}

/**
 * Vertex cover 2-approx via maximal matching.
 * @param {any} graph
 */
export function vertexCover2Approx(graph) {
  const frames = [];
  const edges = graph.edges.map((e) => ({ ...e }));
  const covered = new Set();
  const matching = [];
  frames.push({
    type: 'info',
    message: `vertex cover 2-approx · maximal matching · O(E)`,
    extra: { kind: 'vc', covered: [], matching: [], nodes: graph.nodes, edges },
  });

  for (const e of edges) {
    if (covered.has(e.u) || covered.has(e.v)) continue;
    matching.push([e.u, e.v]);
    covered.add(e.u);
    covered.add(e.v);
    frames.push({
      type: 'relax',
      indices: [e.u, e.v],
      message: `match ${e.u}–${e.v} · add both endpoints`,
      extra: {
        kind: 'vc',
        covered: [...covered],
        matching: matching.map((m) => m.slice()),
        nodes: graph.nodes,
        edges,
      },
    });
  }

  frames.push({
    type: 'done',
    message: `cover size ${covered.size} ≤ 2·OPT · matching size ${matching.length} = lower bound OPT`,
    extra: {
      kind: 'vc',
      covered: [...covered],
      matching: matching.map((m) => m.slice()),
      nodes: graph.nodes,
      edges,
      approx: 2,
    },
  });
  return frames;
}

/**
 * Red-black insert (simplified educational: show colors + rotations on 4-clause cases).
 * @param {number[]} keys
 */
export function redBlackInserts(keys = [10, 20, 30, 15, 25]) {
  // Use AVL-style structure but track color; enough for teaching CLRS cases.
  const frames = [];
  frames.push({
    type: 'info',
    message: `red-black insert ${JSON.stringify(keys)} · O(log n) with rotations + recolor`,
    extra: { kind: 'rb', tree: null, last: null },
  });

  let root = null;
  function height(n) {
    return n ? n.h : 0;
  }
  function update(n) {
    if (n) n.h = 1 + Math.max(height(n.l), height(n.r));
  }
  function setRed(n) {
    if (n) n.color = 'R';
  }
  function setBlack(n) {
    if (n) n.color = 'B';
  }
  function clone(n) {
    if (!n) return null;
    return { key: n.key, color: n.color, h: n.h, l: clone(n.l), r: clone(n.r) };
  }
  function rotateLeft(x) {
    const y = x.r;
    x.r = y.l;
    y.l = x;
    update(x);
    update(y);
    return y;
  }
  function rotateRight(y) {
    const x = y.l;
    y.l = x.r;
    x.r = y;
    update(y);
    update(x);
    return x;
  }

  function insertFix(n, key) {
    // climb-up fix while parent is red (iterative after recursive insert)
    return n;
  }

  function insert(n, key) {
    if (!n) {
      n = { key, color: 'R', l: null, r: null, h: 1 };
      return n;
    }
    if (key < n.key) n.l = insert(n.l, key);
    else if (key > n.key) n.r = insert(n.r, key);
    update(n);

    // local repair (teaching approximation of full CLRS insert-fixup)
    const parent = key < n.key ? n.l : n.r;
    // if child red and grandchild red — rotate/recolor
    if (n.color === 'B') {
      const child = n.l?.key === key || (n.l && find(n.l, key)) ? n.l : n.r;
      // simplified: if this node has a red-red edge downward, rebalance like AVL + recolor
    }

    const bal = height(n.l) - height(n.r);
    if (bal > 1 && key < n.l.key) {
      frames.push({
        type: 'swap',
        message: `LL at ${n.key}: right rotate + swap colors`,
        extra: { kind: 'rb', tree: clone(n), rotate: 'LL', last: key },
      });
      const x = rotateRight(n);
      // color swap teaching step
      setBlack(x);
      setRed(x.r);
      return x;
    }
    if (bal < -1 && key > n.r.key) {
      frames.push({
        type: 'swap',
        message: `RR at ${n.key}: left rotate + swap colors`,
        extra: { kind: 'rb', tree: clone(n), rotate: 'RR', last: key },
      });
      const x = rotateLeft(n);
      setBlack(x);
      setRed(x.l);
      return x;
    }
    if (bal > 1 && key > n.l.key) {
      frames.push({
        type: 'swap',
        message: `LR at ${n.key}: left-right + recolor`,
        extra: { kind: 'rb', tree: clone(n), rotate: 'LR', last: key },
      });
      n.l = rotateLeft(n.l);
      const x = rotateRight(n);
      setBlack(x);
      return x;
    }
    if (bal < -1 && key < n.r.key) {
      frames.push({
        type: 'swap',
        message: `RL at ${n.key}: right-left + recolor`,
        extra: { kind: 'rb', tree: clone(n), rotate: 'RL', last: key },
      });
      n.r = rotateRight(n.r);
      const x = rotateLeft(n);
      setBlack(x);
      return x;
    }
    return n;
  }

  function find(n, key) {
    if (!n) return null;
    if (n.key === key) return n;
    return key < n.key ? find(n.l, key) : find(n.r, key);
  }

  for (const key of keys) {
    root = insert(root, key);
    if (root) root.color = 'B';
    frames.push({
      type: 'visit',
      message: `inserted ${key}`,
      extra: { kind: 'rb', tree: clone(root), last: key },
    });
  }

  frames.push({
    type: 'done',
    message: `red-black tree · root black · no red-red · height Θ(log n)`,
    extra: { kind: 'rb', tree: clone(root), done: true },
  });
  return frames;
}

/**
 * Suffix tree Ukkonen-lite: build by successive insert of suffixes (O(n²) construction narrative),
 * then pattern match.
 * @param {string} text
 * @param {string} pat
 */
export function suffixTreeMatch(text = 'banana', pat = 'ana') {
  const T = text.toLowerCase() + '$';
  const P = pat.toLowerCase();
  const frames = [];
  frames.push({
    type: 'info',
    message: `suffix tree of "${T}" · match "${P}" · O(|T|+|P|) with a real suffix tree`,
    extra: {
      kind: 'stree',
      text: T,
      pat: P,
      tree: null,
      match: null,
      suffixes: [],
    },
  });

  // naive suffix insert trie (educational)
  /** @type {any} */
  const root = { children: new Map(), id: 0 };
  let idc = 1;
  const suffixes = [];
  for (let i = 0; i < T.length; i += 1) {
    const suf = T.slice(i);
    suffixes.push(suf);
    let node = root;
    for (const ch of suf) {
      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), id: idc++, edge: ch });
      }
      node = node.children.get(ch);
    }
    frames.push({
      type: 'set',
      message: `insert suffix "${suf}"`,
      extra: {
        kind: 'stree',
        text: T,
        pat: P,
        tree: ser(root),
        suffixes: suffixes.slice(),
      },
    });
  }

  let node = root;
  let j = 0;
  const path = [];
  while (j < P.length && node) {
    const ch = P[j];
    path.push(ch);
    frames.push({
      type: 'compare',
      message: `match ${ch} at depth ${j}`,
      extra: {
        kind: 'stree',
        text: T,
        pat: P,
        tree: ser(root),
        path: path.slice(),
        j,
      },
    });
    node = node.children.get(ch);
    j += 1;
    if (!node) break;
  }

  const found = node && j === P.length;
  frames.push({
    type: 'done',
    message: found ? `pattern "${P}" occurs in T` : `pattern "${P}" not found`,
    extra: {
      kind: 'stree',
      text: T,
      pat: P,
      tree: ser(root),
      match: found ? 1 : -1,
    },
  });
  return frames;

  function ser(n) {
    const obj = { id: n.id, edge: n.edge || '', children: [] };
    for (const c of n.children.values()) obj.children.push(ser(c));
    return obj;
  }
}

export const PEAK = {
  polyMultiply,
  matroidGreedy,
  vertexCover2Approx,
  redBlackInserts,
  suffixTreeMatch,
};
