/**
 * Greedy + divide & conquer + strings + flow + NP walkthrough generators.
 */

/**
 * Activity selection.
 * @param {[number, number][]} acts [start, finish]
 */
export function activitySelection(acts) {
  const jobs = acts.map(([s, f], id) => ({ id, s, f })).sort((x, y) => x.f - y.f);
  const frames = [];
  frames.push({
    type: 'info',
    message: `activity selection · sort by finish · O(n log n)`,
    extra: { kind: 'timeline', jobs: jobs.map(j => ({ ...j, chosen: false })), chosen: [] },
  });
  /** @type {any[]} */
  const chosen = [];
  let last = -Infinity;
  for (const j of jobs) {
    frames.push({
      type: 'compare',
      message: `consider [${j.s},${j.f})  last finish=${last === -Infinity ? '—' : last}`,
      extra: pack(),
    });
    if (j.s >= last) {
      chosen.push(j.id);
      last = j.f;
      j.chosen = true;
      frames.push({
        type: 'set',
        message: `take activity ${j.id}`,
        extra: pack(),
      });
    } else {
      frames.push({
        type: 'info',
        message: `skip ${j.id} (overlaps)`,
        extra: pack(),
      });
    }
  }
  frames.push({
    type: 'done',
    message: `selected ${chosen.length} activities: ${chosen.join(',')}`,
    extra: pack(),
  });
  return frames;

  function pack() {
    return {
      kind: 'timeline',
      jobs: jobs.map((j) => ({ ...j, chosen: chosen.includes(j.id) })),
      chosen: chosen.slice(),
    };
  }
}

/**
 * Huffman tree build (weights = frequencies).
 * @param {Record<string, number>} freq
 */
export function huffman(freq) {
  /** @type {any[]} */
  let nodes = Object.entries(freq).map(([ch, w], id) => ({
    id: `l${id}`,
    label: ch,
    w,
    left: null,
    right: null,
  }));
  const frames = [];
  frames.push({
    type: 'info',
    message: `Huffman · merge two lightest · Σ freq·depth`,
    extra: { kind: 'huffman', forest: nodes.map(simple) },
  });
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.w - b.w);
    const x = nodes.shift();
    const y = nodes.shift();
    const parent = {
      id: `n${frames.length}`,
      label: `${x.w + y.w}`,
      w: x.w + y.w,
      left: x,
      right: y,
    };
    nodes.push(parent);
    frames.push({
      type: 'relax',
      message: `merge ${x.label}(${x.w}) + ${y.label}(${y.w}) → ${parent.w}`,
      extra: { kind: 'huffman', forest: nodes.map(simple), last: [x.id, y.id, parent.id] },
    });
  }
  frames.push({
    type: 'done',
    message: `Huffman tree built · WPL=${weighted(nodes[0], 0)}`,
    extra: { kind: 'huffman', forest: nodes.map(simple), root: simple(nodes[0]) },
  });
  return frames;

  function simple(n) {
    if (!n) return null;
    return {
      id: n.id,
      label: n.label,
      w: n.w,
      left: simple(n.left),
      right: simple(n.right),
    };
  }
  function weighted(n, d) {
    if (!n.left && !n.right) return n.w * d;
    return weighted(n.left, d + 1) + weighted(n.right, d + 1);
  }
}

/**
 * KMP search.
 * @param {string} text
 * @param {string} pat
 */
export function kmpSearch(text, pat) {
  const T = text.toUpperCase();
  const P = pat.toUpperCase();
  const frames = [];
  const lps = buildLps(P);
  frames.push({
    type: 'info',
    message: `KMP · pattern "${P}" · lps=[${lps.join(',')}] · O(n+m)`,
    extra: { kind: 'string', text: T, pat: P, i: 0, j: 0, lps, match: null },
  });
  let i = 0;
  let j = 0;
  while (i < T.length) {
    frames.push({
      type: 'compare',
      message: `compare T[${i}]=${T[i]} ?= P[${j}]=${P[j]}`,
      extra: { kind: 'string', text: T, pat: P, i, j, lps, match: null },
    });
    if (T[i] === P[j]) {
      i += 1;
      j += 1;
      if (j === P.length) {
        frames.push({
          type: 'done',
          message: `match at index ${i - j}`,
          extra: { kind: 'string', text: T, pat: P, i, j: j - 1, lps, match: i - j },
        });
        return frames;
      }
    } else {
      if (j > 0) {
        const nj = lps[j - 1];
        frames.push({
          type: 'info',
          message: `mismatch · shift j: ${j} → ${nj} using lps`,
          extra: { kind: 'string', text: T, pat: P, i, j: nj, lps, match: null },
        });
        j = nj;
      } else {
        i += 1;
      }
    }
  }
  frames.push({
    type: 'done',
    message: 'no occurrence',
    extra: { kind: 'string', text: T, pat: P, i, j: 0, lps, match: -1 },
  });
  return frames;
}

function buildLps(P) {
  const lps = Array(P.length).fill(0);
  let len = 0;
  let i = 1;
  while (i < P.length) {
    if (P[i] === P[len]) {
      len += 1;
      lps[i] = len;
      i += 1;
    } else if (len > 0) len = lps[len - 1];
    else {
      lps[i] = 0;
      i += 1;
    }
  }
  return lps;
}

/**
 * Rabin-Karp rolling hash.
 * @param {string} text
 * @param {string} pat
 */
export function rabinKarp(text, pat) {
  const T = text.toUpperCase();
  const P = pat.toUpperCase();
  const frames = [];
  const d = 256;
  const q = 101;
  let pH = 0;
  let tH = 0;
  let h = 1;
  for (let i = 0; i < P.length - 1; i += 1) h = (h * d) % q;
  for (let i = 0; i < P.length; i += 1) {
    pH = (d * pH + P.charCodeAt(i)) % q;
    tH = (d * tH + T.charCodeAt(i)) % q;
  }
  frames.push({
    type: 'info',
    message: `Rabin-Karp · rolling hash mod ${q}`,
    extra: { kind: 'string', text: T, pat: P, i: 0, j: 0, match: null, hash: { pH, tH } },
  });

  for (let i = 0; i + P.length <= T.length; i += 1) {
    frames.push({
      type: 'compare',
      message: `window @${i}  tHash=${tH} pHash=${pH}`,
      extra: { kind: 'string', text: T, pat: P, i, j: 0, match: null, hash: { pH, tH }, win: [i, i + P.length - 1] },
    });
    if (pH === tH) {
      let ok = true;
      for (let k = 0; k < P.length; k += 1) {
        if (T[i + k] !== P[k]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        frames.push({
          type: 'done',
          message: `match at ${i}`,
          extra: { kind: 'string', text: T, pat: P, i, match: i, win: [i, i + P.length - 1] },
        });
        return frames;
      }
      frames.push({
        type: 'info',
        message: `spurious hit at ${i} — verify chars`,
        extra: { kind: 'string', text: T, pat: P, i, match: null, win: [i, i + P.length - 1] },
      });
    }
    if (i + P.length < T.length) {
      tH = (d * (tH - T.charCodeAt(i) * h) + T.charCodeAt(i + P.length)) % q;
      if (tH < 0) tH += q;
    }
  }
  frames.push({
    type: 'done',
    message: 'no occurrence',
    extra: { kind: 'string', text: T, pat: P, match: -1 },
  });
  return frames;
}

/**
 * Closest pair 2D (divide & conquer narrative frames over brute check strip).
 * @param {[number, number][]} pts
 */
export function closestPair(pts) {
  const P = pts.map(([x, y], id) => ({ id, x, y }));
  const frames = [];
  const sorted = P.slice().sort((a, b) => a.x - b.x);
  frames.push({
    type: 'info',
    message: `closest pair · n=${P.length} · sort by x`,
    extra: { kind: 'points', points: P, active: [], pair: null },
  });

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function solve(list, depth) {
    if (list.length <= 1) return list.slice();
    if (list.length === 2) {
      frames.push({
        type: 'compare',
        message: `pair distance ${dist(list[0], list[1]).toFixed(2)}`,
        extra: { kind: 'points', points: P, active: list.map((p) => p.id), pair: [list[0].id, list[1].id], depth },
      });
      return list.slice();
    }
    const mid = list.length >> 1;
    const midX = list[mid].x;
    frames.push({
      type: 'range',
      message: `divide at x=${midX} (depth ${depth})`,
      extra: {
        kind: 'points',
        points: P,
        active: list.map((p) => p.id),
        splitX: midX,
        depth,
      },
    });
    const left = solve(list.slice(0, mid), depth + 1);
    const right = solve(list.slice(mid), depth + 1);
    // merge back for visualization simplicity
    const merged = left.concat(right);
    const strip = list.filter((p) => Math.abs(p.x - midX) <= 40);
    frames.push({
      type: 'info',
      message: `strip of ${strip.length} points near x=${midX}`,
      extra: { kind: 'points', points: P, active: strip.map((p) => p.id), splitX: midX, depth },
    });
    return merged;
  }

  solve(sorted, 0);

  let best = Infinity;
  let bi = 0;
  let bj = 0;
  for (let i = 0; i < P.length; i += 1) {
    for (let j = i + 1; j < P.length; j += 1) {
      const d = dist(P[i], P[j]);
      if (d < best) {
        best = d;
        bi = i;
        bj = j;
      }
    }
  }
  frames.push({
    type: 'done',
    message: `closest = (${P[bi].x},${P[bi].y})–(${P[bj].x},${P[bj].y}) δ=${best.toFixed(2)}`,
    extra: { kind: 'points', points: P, active: [bi, bj], pair: [bi, bj] },
  });
  return frames;
}

/**
 * Edmonds-Karp max-flow.
 * @param {any} graph nodes/edges with capacity as w
 * @param {number} s
 * @param {number} t
 */
export function edmondsKarp(graph, s = 0, t = -1) {
  const n = graph.nodes.length;
  const sink = t < 0 ? n - 1 : t;
  const nodes = graph.nodes;
  const cap = Array.from({ length: n }, () => Array(n).fill(0));
  for (const e of graph.edges) {
    cap[e.u][e.v] = e.w;
    if (!graph.directed) cap[e.v][e.u] = e.w;
  }
  const flow = Array.from({ length: n }, () => Array(n).fill(0));
  const frames = [];
  frames.push({
    type: 'info',
    message: `Edmonds-Karp · s=${label(s)} t=${label(sink)} · O(V E²)`,
    extra: { kind: 'flow', nodes, flow: cloneFlow(), cap, source: s, sink, cut: null },
  });

  function bfsParent() {
    const parent = Array(n).fill(-1);
    parent[s] = s;
    const q = [s];
    while (q.length) {
      const u = q.shift();
      for (let v = 0; v < n; v += 1) {
        if (parent[v] === -1 && cap[u][v] - flow[u][v] > 0) {
          parent[v] = u;
          q.push(v);
        }
      }
    }
    return parent;
  }

  let total = 0;
  while (true) {
    const parent = bfsParent();
    if (parent[sink] === -1) break;
    let push = Infinity;
    for (let v = sink; v !== s; v = parent[v]) {
      const u = parent[v];
      push = Math.min(push, cap[u][v] - flow[u][v]);
    }
    const path = [];
    for (let v = sink; v !== s; v = parent[v]) {
      const u = parent[v];
      flow[u][v] += push;
      flow[v][u] -= push;
      path.push([u, v]);
    }
    total += push;
    frames.push({
      type: 'relax',
      message: `augment ${push} along ${path
        .slice()
        .reverse()
        .map(([u, v]) => `${label(u)}→${label(v)}`)
        .join(' ')}`,
      extra: {
        kind: 'flow',
        nodes,
        flow: cloneFlow(),
        cap,
        source: s,
        sink,
        path: path.map(([u, v]) => [u, v]),
        value: total,
      },
    });
  }

  // min-cut = reachable from s in residual
  const seen = Array(n).fill(false);
  seen[s] = true;
  const q = [s];
  while (q.length) {
    const u = q.shift();
    for (let v = 0; v < n; v += 1) {
      if (!seen[v] && cap[u][v] - flow[u][v] > 0) {
        seen[v] = true;
        q.push(v);
      }
    }
  }
  frames.push({
    type: 'done',
    message: `max-flow = ${total} · min-cut S = {${nodes.filter((nd) => seen[nd.id]).map((nd) => nd.label).join(',')}}`,
    extra: {
      kind: 'flow',
      nodes,
      flow: cloneFlow(),
      cap,
      source: s,
      sink,
      value: total,
      cut: seen,
    },
  });
  return frames;

  function label(i) {
    return nodes[i]?.label ?? String(i);
  }
  function cloneFlow() {
    return flow.map((row) => row.slice());
  }
}

/**
 * Educational NP-reduction walkthroughs (text frames — no giant combinatorial viz).
 * @param {'sat-3sat'|'3sat-clique'|'clique-vc'} which
 */
export function npReduction(which) {
  const packs = {
    'sat-3sat': {
      title: 'SAT ≤_p 3-SAT',
      steps: [
        'Take an arbitrary CNF formula φ (SAT instance).',
        'Each clause with &gt; 3 literals is split using new variables (standard Tseitin/chain gadgets).',
        'Clauses with 1–2 literals are padded with repeated literals to reach 3.',
        'Output ψ is a 3-CNF with |ψ| polynomial in |φ|.',
        'Claim: φ satisfiable ⇔ ψ satisfiable. Gadget force-keeps OR semantics.',
        'Conclusion: 3-SAT is NP-hard (SAT ∈ NPC by Cook-Levin). 3-SAT ∈ NP → NPC.',
      ],
    },
    '3sat-clique': {
      title: '3-SAT ≤_p CLIQUE',
      steps: [
        'φ has clauses C₁…C_m, each with 3 literals. Build graph G.',
        'Group i has 3 nodes — one per literal in C_i.',
        'Edges: connect literals from different groups unless one contradicts the other (x and ¬x).',
        'Set k = m (one node per clause).',
        'If φ has a satisfying assignment, pick one true literal per clause → k-clique (no contradictions).',
        'A k-clique uses one node per group (no intra-group edges) → consistent true literal per clause → satisfies φ.',
        'Construction size O(m²) → polynomial. CLIQUE is NP-hard. Verifying a clique is poly → NPC.',
      ],
    },
    'clique-vc': {
      title: 'CLIQUE ≤_p VERTEX-COVER',
      steps: [
        'Instance: graph G=(V,E), integer k. Want: k-clique?',
        'Complement graph Ḡ (same V; edge iff not edge in G). Set k′ = |V| − k.',
        'Claim: G has a k-clique ⇔ Ḡ has a vertex cover of size k′.',
        'If K is a k-clique in G, V∖K covers all edges of Ḡ (any Ḡ-edge is missing in G so cannot lie inside K).',
        'If C is a vertex cover of Ḡ of size |V|−k, then V∖C is a clique in G (no missing edge between leftovers).',
        'Complement is O(V²). VERTEX-COVER is NP-complete.',
      ],
    },
  };
  const pack = packs[which] || packs['sat-3sat'];
  return pack.steps.map((s, i) => ({
    type: i === pack.steps.length - 1 ? 'done' : 'info',
    message: `${i + 1}. ${s.replace(/<[^>]+>/g, '')}`,
    extra: { kind: 'np', title: pack.title, step: i + 1, total: pack.steps.length, html: s },
  }));
}

/**
 * Master Theorem evaluator as frames.
 * @param {number} a @param {number} b @param {string} fKind @param {number} fPower @param {number} [logPow]
 */
export function masterTheorem(a, b, fKind, fPower, logPow = 0) {
  const frames = [];
  const crit = Math.log(a) / Math.log(b);
  frames.push({
    type: 'info',
    message: `T(n)=${a}T(n/${b})+f(n)  ·  n^{log_${b} ${a}} = n^${crit.toFixed(3)}`,
    extra: { kind: 'master', a, b, crit, fKind, fPower, case: 0 },
  });
  let caseNum = 0;
  let result = '';
  if (fKind === 'poly') {
    if (fPower < crit - 1e-9) {
      caseNum = 1;
      result = `Θ(n^${crit.toFixed(3)})`;
    } else if (Math.abs(fPower - crit) < 1e-9 && (logPow || 0) === 0) {
      caseNum = 2;
      result = `Θ(n^${crit.toFixed(3)} log n)`;
    } else if (Math.abs(fPower - crit) < 1e-9 && logPow > 0) {
      caseNum = 2;
      result = `Θ(n^${crit.toFixed(3)} (log n)^${logPow + 1})`;
    } else if (fPower > crit + 1e-9) {
      caseNum = 3;
      result = `Θ(n^${fPower})`;
    } else {
      caseNum = 2;
      result = `Θ(n^${crit.toFixed(3)})`;
    }
  }
  frames.push({
    type: 'done',
    message: `case ${caseNum}: ${result}`,
    extra: { kind: 'master', a, b, crit, fKind, fPower, case: caseNum, result },
  });
  return frames;
}

export const GREEDY = { activitySelection, huffman };
export const STRINGS = { kmp: kmpSearch, rk: rabinKarp };
export const FLOW = { edmondsKarp };
export const NP = { npReduction };
export const DC = { closestPair };
export const THEORYRUN = { masterTheorem };
