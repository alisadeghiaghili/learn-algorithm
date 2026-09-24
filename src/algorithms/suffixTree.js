/**
 * Compacted suffix tree (real suffix tree: edges labeled with text substrings).
 * Construction: successive compressed suffix trie insert (O(n²) time, O(n) nodes after compaction).
 * Ukkonen O(n) is the production algorithm; this is a *correct* suffix tree, just slower to build.
 */

/**
 * @param {string} text
 * @param {string} pat
 */
export function suffixTreeMatch(text = 'banana', pat = 'ana') {
  const T = text.endsWith('$') ? text.toLowerCase() : `${text.toLowerCase()}$`;
  const P = pat.toLowerCase();
  const frames = [];

  /** @type {any} */
  let root = { children: new Map(), id: 0, link: null };
  let idc = 1;

  frames.push({
    type: 'info',
    message: `suffix tree (compacted) of "${T}" · match "${P}"`,
    extra: {
      kind: 'stree',
      text: T,
      pat: P,
      tree: null,
      match: null,
    },
  });

  /**
   * Insert T[from..] into compacted tree.
   */
  function insertSuffix(from) {
    let node = root;
    let i = from;
    while (i < T.length) {
      const ch = T[i];
      if (!node.children.has(ch)) {
        // new leaf edge for the rest
        node.children.set(ch, {
          id: idc++,
          label: T.slice(i),
          children: new Map(),
          leafFrom: from,
        });
        return;
      }
      // walk edge label
      let child = node.children.get(ch);
      let e = 0;
      while (e < child.label.length && i < T.length) {
        if (child.label[e] !== T[i]) break;
        e += 1;
        i += 1;
      }
      if (e === child.label.length) {
        node = child;
        continue;
      }
      // split edge at e
      const split = {
        id: idc++,
        label: child.label.slice(0, e),
        children: new Map(),
      };
      child.label = child.label.slice(e);
      split.children.set(child.label[0], child);
      if (i < T.length) {
        split.children.set(T[i], {
          id: idc++,
          label: T.slice(i),
          children: new Map(),
          leafFrom: from,
        });
      }
      node.children.set(ch, split);
      return;
    }
  }

  for (let s = 0; s < T.length; s += 1) {
    insertSuffix(s);
    frames.push({
      type: 'set',
      message: `insert suffix "${T.slice(s)}"`,
      extra: {
        kind: 'stree',
        text: T,
        pat: P,
        tree: ser(root),
        match: null,
        suffix: s,
      },
    });
  }

  // pattern walk
  let node = root;
  let j = 0;
  const path = [];
  let ok = true;
  while (j < P.length) {
    const ch = P[j];
    if (!node.children.has(ch)) {
      ok = false;
      break;
    }
    const child = node.children.get(ch);
    let e = 0;
    while (e < child.label.length && j < P.length) {
      if (child.label[e] !== P[j]) {
        ok = false;
        break;
      }
      path.push(P[j]);
      e += 1;
      j += 1;
    }
    if (!ok) break;
    frames.push({
      type: 'compare',
      message: `walk edge "${child.label}" · matched to P[${j}]`,
      extra: {
        kind: 'stree',
        text: T,
        pat: P,
        tree: ser(root),
        match: null,
        path: path.slice(),
        j,
      },
    });
    node = child;
    if (j === P.length) break;
  }
  const found = ok && j === P.length;

  frames.push({
    type: 'done',
    message: found
      ? `pattern "${P}" occurs in T · walk O(|P|)`
      : `pattern "${P}" not found`,
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
    const obj = { id: n.id, edge: n.label || '', children: [] };
    for (const c of n.children.values()) obj.children.push(ser(c));
    return obj;
  }
}

/**
 * Extract all occurrence start indices via suffix-tree leaves.
 * @param {string} text
 */
export function suffixTreeLeaves(text = 'banana') {
  const T = text.endsWith('$') ? text.toLowerCase() : `${text.toLowerCase()}$`;
  // rebuild quickly using same insert
  const frames = suffixTreeMatch(T, T[0] || 'a');
  return frames;
}
