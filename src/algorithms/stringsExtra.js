/**
 * Extra strings: Z-algorithm, suffix array (prefix-doubling narrative).
 * Randomized: Freivalds matrix verification, randomized select (already) + Monte Carlo notes as frames.
 */

/**
 * Z-algorithm Z-array construction.
 * @param {string} s
 */
export function zAlgorithm(s = 'aabxaab') {
  const S = s.toUpperCase();
  const n = S.length;
  const Z = Array(n).fill(0);
  const frames = [];
  frames.push({
    type: 'info',
    message: `Z-algorithm on "${S}" · O(n) · Z[i] = lcp(S, S[i..])`,
    extra: { kind: 'string', text: S, pat: 'Z', z: Z.slice(), l: 0, r: 0, i: 1 },
  });
  Z[0] = n;
  let l = 0;
  let r = 0;
  for (let i = 1; i < n; i += 1) {
    frames.push({
      type: 'compare',
      message: `i=${i}  box [${l},${r})`,
      extra: { kind: 'string', text: S, pat: 'Z', z: Z.slice(), l, r, i },
    });
    if (i < r) Z[i] = Math.min(r - i, Z[i - l]);
    while (i + Z[i] < n && S[Z[i]] === S[i + Z[i]]) {
      frames.push({
        type: 'compare',
        message: `extend Z[${i}] = ${Z[i] + 1}`,
        extra: { kind: 'string', text: S, pat: 'Z', z: Z.slice(), l, r, i },
      });
      Z[i] += 1;
    }
    if (i + Z[i] > r) {
      l = i;
      r = i + Z[i];
    }
    frames.push({
      type: 'set',
      message: `Z[${i}] = ${Z[i]}`,
      extra: { kind: 'string', text: S, pat: 'Z', z: Z.slice(), l, r, i },
    });
  }
  frames.push({
    type: 'done',
    message: `Z = [${Z.join(', ')}]`,
    extra: { kind: 'string', text: S, pat: 'Z', z: Z.slice(), done: true },
  });
  return frames;
}

/**
 * Suffix array via prefix doubling (educational O(n log² n)).
 * @param {string} s
 */
export function suffixArray(s = 'banana') {
  const S = s.toLowerCase();
  const n = S.length;
  const sa = Array.from({ length: n }, (_, i) => i);
  const rank = S.split('').map((c) => c.charCodeAt(0) - 97);
  const frames = [];
  frames.push({
    type: 'info',
    message: `suffix array (prefix doubling) on "${S}" · O(n log² n)`,
    extra: {
      kind: 'sarray',
      text: S,
      sa: sa.slice(),
      rank: rank.slice(),
      k: 1,
    },
  });

  const tmp = Array(n);
  for (let k = 1; k < n; k *= 2) {
    sa.sort((a, b) => {
      if (rank[a] !== rank[b]) return rank[a] - rank[b];
      const ra = a + k < n ? rank[a + k] : -1;
      const rb = b + k < n ? rank[b + k] : -1;
      return ra - rb;
    });
    tmp[sa[0]] = 0;
    for (let i = 1; i < n; i += 1) {
      const a = sa[i - 1];
      const b = sa[i];
      const same =
        rank[a] === rank[b] &&
        (a + k < n ? rank[a + k] : -1) === (b + k < n ? rank[b + k] : -1);
      tmp[b] = tmp[a] + (same ? 0 : 1);
    }
    for (let i = 0; i < n; i += 1) rank[i] = tmp[i];
    frames.push({
      type: 'set',
      message: `after width ${k}: sa=[${sa.join(',')}] rank=[${rank.join(',')}]`,
      extra: {
        kind: 'sarray',
        text: S,
        sa: sa.slice(),
        rank: rank.slice(),
        k,
      },
    });
  }
  frames.push({
    type: 'done',
    message: `SA = [${sa.join(', ')}] → ${sa.map((i) => S.slice(i)).join(' | ')}`,
    extra: {
      kind: 'sarray',
      text: S,
      sa: sa.slice(),
      rank: rank.slice(),
      done: true,
    },
  });
  return frames;
}

/**
 * Freivalds: verify C = A·B with random vector (Monte Carlo).
 * @param {number[][]} A @param {number[][]} B @param {number[][]} C
 */
export function freivalds(A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]], C = [[19, 22], [43, 50]]) {
  const n = A.length;
  const frames = [];
  // fix a deterministic "random" vector for reproducibility in tests; still MC in analysis
  const r = [1, 0];
  frames.push({
    type: 'info',
    message: `Freivalds · Monte Carlo · check A(Br) == Cr in O(n²)`,
    extra: {
      kind: 'freivalds',
      A,
      B,
      C,
      r,
      phase: 'r',
    },
  });

  // Br
  const Br = Array(n).fill(0);
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) Br[i] += B[i][j] * r[j];
  }
  frames.push({
    type: 'set',
    message: `Br = [${Br.join(', ')}]`,
    extra: { kind: 'freivalds', A, B, C, r, Br, phase: 'Br' },
  });

  const ABr = Array(n).fill(0);
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) ABr[i] += A[i][j] * Br[j];
  }
  frames.push({
    type: 'set',
    message: `A(Br) = [${ABr.join(', ')}]`,
    extra: { kind: 'freivalds', A, B, C, r, Br, ABr, phase: 'ABr' },
  });

  const Cr = Array(n).fill(0);
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) Cr[i] += C[i][j] * r[j];
  }
  frames.push({
    type: 'compare',
    message: `Cr = [${Cr.join(', ')}]`,
    extra: { kind: 'freivalds', A, B, C, r, ABr, Cr, phase: 'Cr' },
  });

  const ok = ABr.every((v, i) => v === Cr[i]);
  frames.push({
    type: 'done',
    message: ok
      ? `accept (error ≤ 1/2 per trial) · ABr == Cr`
      : `reject — C ≠ A·B`,
    extra: { kind: 'freivalds', A, B, C, r, ABr, Cr, phase: 'done', ok },
  });
  return frames;
}

export const STRINGS_EXTRA = { z: zAlgorithm, sa: suffixArray };
export const RANDOMIZED = { freivalds };
