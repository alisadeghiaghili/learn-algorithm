/**
 * Property-based / randomized correctness harness.
 * Deterministic PRNG so CI is reproducible.
 */

/** Mulberry32 */
export function prng(seed = 42) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {number} n
 * @param {() => number} rnd
 */
export function randomArray(n, rnd, lo = -20, hi = 40) {
  return Array.from({ length: n }, () => Math.floor(rnd() * (hi - lo + 1)) + lo);
}

/**
 * Random undirected connected-ish graph.
 */
export function randomGraph(n, edgeFactor = 1.5, rnd = prng()) {
  const nodes = Array.from({ length: n }, (_, id) => ({
    id,
    label: String.fromCharCode(65 + (id % 26)),
    x: 80 + (id % 5) * 120,
    y: 80 + Math.floor(id / 5) * 100,
  }));
  const edges = [];
  const seen = new Set();
  const add = (u, v, w) => {
    const key = u < v ? `${u}-${v}` : `${v}-${u}`;
    if (u === v || seen.has(key)) return;
    seen.add(key);
    edges.push({ u, v, w });
  };
  // path to connect
  for (let i = 1; i < n; i += 1) add(i - 1, i, 1 + Math.floor(rnd() * 9));
  const extra = Math.floor(n * edgeFactor);
  for (let i = 0; i < extra; i += 1) {
    const u = Math.floor(rnd() * n);
    const v = Math.floor(rnd() * n);
    add(u, v, 1 + Math.floor(rnd() * 15));
  }
  return { directed: false, nodes, edges };
}

/**
 * Run a suite of property checks. Returns list of failures (empty = pass).
 * @param {Record<string, any>} algos  // map name → (input) => frames
 */
export function propertyCheckSorts(algos, rounds = 40, seed = 7) {
  const rnd = prng(seed);
  const failures = [];
  for (let r = 0; r < rounds; r += 1) {
    const n = 1 + Math.floor(rnd() * 12);
    const a = randomArray(n, rnd);
    const expected = a.slice().sort((x, y) => x - y);
    for (const [name, fn] of Object.entries(algos)) {
      const frames = fn(a);
      const got = frames.at(-1)?.array;
      if (JSON.stringify(got) !== JSON.stringify(expected)) {
        failures.push({ name, a, expected, got });
      }
    }
  }
  return failures;
}

/**
 * Check Dijkstra on non-negative graphs equals Bellman-Ford.
 */
export function propertyCheckDistances(dijkstraFn, bellmanFn, rounds = 25, seed = 11) {
  const rnd = prng(seed);
  const failures = [];
  for (let r = 0; r < rounds; r += 1) {
    const n = 3 + Math.floor(rnd() * 5);
    const g = randomGraph(n, 1.2, rnd);
    g.directed = true;
    // make all weights non-negative already
    const d = dijkstraFn(g, 0).at(-1).extra.dist;
    const b = bellmanFn(g, 0).at(-1).extra.dist;
    for (let i = 0; i < n; i += 1) {
      const dv = d[i] === '∞' ? Infinity : d[i];
      const bv = b[i] === '∞' ? Infinity : b[i];
      if (dv !== bv) {
        failures.push({ g, i, d, b });
        break;
      }
    }
  }
  return failures;
}

/**
 * Check polyMulFft matches naive convolution.
 */
export function propertyCheckFft(polyMulFft, naiveMul, rounds = 30, seed = 13) {
  const rnd = prng(seed);
  const failures = [];
  for (let r = 0; r < rounds; r += 1) {
    const a = randomArray(1 + Math.floor(rnd() * 6), rnd, -5, 5);
    const b = randomArray(1 + Math.floor(rnd() * 6), rnd, -5, 5);
    const got = polyMulFft(a, b);
    const exp = naiveMul(a, b);
    if (JSON.stringify(got) !== JSON.stringify(exp)) {
      failures.push({ a, b, got, exp });
    }
  }
  return failures;
}

/**
 * Check MST cost Prim == Kruskal on random graphs.
 */
export function propertyCheckMst(primFn, kruskalFn, rounds = 25, seed = 17) {
  const rnd = prng(seed);
  const failures = [];
  for (let r = 0; r < rounds; r += 1) {
    const g = randomGraph(3 + Math.floor(rnd() * 6), 1.4, rnd);
    const p = primFn(g, 0).at(-1).extra.cost;
    const k = kruskalFn(g).at(-1).extra.cost;
    if (p !== k) failures.push({ g, p, k });
  }
  return failures;
}

/**
 * Check RB invariants on random insert sequences.
 */
export function propertyCheckRb(redBlackInserts, validateRedBlack, rounds = 30, seed = 23) {
  const rnd = prng(seed);
  const failures = [];
  for (let r = 0; r < rounds; r += 1) {
    const n = 1 + Math.floor(rnd() * 16);
    const keys = [];
    for (let i = 0; i < n; i += 1) keys.push(Math.floor(rnd() * 50));
    const frames = redBlackInserts(keys);
    const v = validateRedBlack(frames.at(-1).extra.tree);
    if (!v.ok) failures.push({ keys, v });
  }
  return failures;
}

/**
 * Check suffix tree match agrees with String.includes on random text.
 */
export function propertyCheckSuffixTree(suffixTreeMatch, rounds = 40, seed = 29) {
  const rnd = prng(seed);
  const letters = 'abc';
  const failures = [];
  for (let r = 0; r < rounds; r += 1) {
    const n = 1 + Math.floor(rnd() * 8);
    let text = '';
    for (let i = 0; i < n; i += 1) text += letters[Math.floor(rnd() * 3)];
    const pLen = 1 + Math.floor(rnd() * 3);
    let pat = '';
    for (let i = 0; i < pLen; i += 1) pat += letters[Math.floor(rnd() * 3)];
    const expect = text.includes(pat) ? 1 : -1;
    const got = suffixTreeMatch(text, pat).at(-1).extra.match;
    if (got !== expect) failures.push({ text, pat, got, expect });
  }
  return failures;
}
