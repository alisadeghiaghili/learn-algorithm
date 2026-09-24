/**
 * Real FFT (Cooley–Tukey, complex) + polynomial multiply + inverse.
 * Complex as { re, im }.
 */

function cAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}
function cSub(a, b) {
  return { re: a.re - b.re, im: a.im - b.im };
}
function cMul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}
function cScale(a, s) {
  return { re: a.re * s, im: a.im * s };
}

/**
 * In-place iterative Cooley–Tukey FFT.
 * @param {{re:number,im:number}[]} a
 * @param {boolean} invert
 */
export function fft(a, invert = false) {
  const n = a.length;
  // bit-reversal permutation
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((2 * Math.PI) / len) * (invert ? -1 : 1);
    const wlen = { re: Math.cos(ang), im: Math.sin(ang) };
    for (let i = 0; i < n; i += len) {
      let w = { re: 1, im: 0 };
      for (let j = 0; j < len / 2; j += 1) {
        const u = a[i + j];
        const v = cMul(a[i + j + len / 2], w);
        a[i + j] = cAdd(u, v);
        a[i + j + len / 2] = cSub(u, v);
        w = cMul(w, wlen);
      }
    }
  }
  if (invert) {
    for (let i = 0; i < n; i += 1) a[i] = cScale(a[i], 1 / n);
  }
}

function nextPow2(n) {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

/**
 * Multiply two real polynomials via FFT. Returns integer coefficients (rounded).
 * @param {number[]} a @param {number[]} b
 * @returns {number[]}
 */
export function polyMulFft(a, b) {
  const need = a.length + b.length - 1;
  const n = nextPow2(need);
  const fa = Array.from({ length: n }, (_, i) => ({
    re: a[i] ?? 0,
    im: 0,
  }));
  const fb = Array.from({ length: n }, (_, i) => ({
    re: b[i] ?? 0,
    im: 0,
  }));
  fft(fa, false);
  fft(fb, false);
  for (let i = 0; i < n; i += 1) fa[i] = cMul(fa[i], fb[i]);
  fft(fa, true);
  const out = Array(need);
  for (let i = 0; i < need; i += 1) out[i] = Math.round(fa[i].re);
  return out;
}

/**
 * Frame generator: real FFT butterfly layers + product.
 * @param {number[]} a @param {number[]} b
 */
export function polyMultiplyFft(a = [1, 2, 3], b = [4, 5, 6]) {
  const frames = [];
  const need = a.length + b.length - 1;
  const n = nextPow2(need);
  frames.push({
    type: 'info',
    message: `FFT poly mult · pad to n=${n} · Θ(n log n) complex butterflies`,
    extra: {
      kind: 'poly',
      a: a.slice(),
      b: b.slice(),
      naive: [],
      stage: 'input',
      n,
    },
  });

  // also show naive for ground truth
  const naive = Array(need).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) naive[i + j] += a[i] * b[j];
  }
  frames.push({
    type: 'compare',
    message: `ground truth naive O(n²) = [${naive.join(', ')}]`,
    extra: { kind: 'poly', a: a.slice(), b: b.slice(), naive: naive.slice(), stage: 'naive', n },
  });

  const fa = Array.from({ length: n }, (_, i) => ({ re: a[i] ?? 0, im: 0 }));
  const fb = Array.from({ length: n }, (_, i) => ({ re: b[i] ?? 0, im: 0 }));
  frames.push({
    type: 'set',
    message: `zero-pad A,B to length ${n}`,
    extra: {
      kind: 'poly',
      a: a.slice(),
      b: b.slice(),
      naive: naive.slice(),
      stage: 'pad',
      n,
      fa: fa.map((c) => c.re),
    },
  });

  fft(fa, false);
  fft(fb, false);
  for (let len = 2; len <= n; len <<= 1) {
    frames.push({
      type: 'compare',
      message: `butterfly layer len=${len} · log₂n layers, n/2 twiddles each`,
      extra: {
        kind: 'poly',
        a: a.slice(),
        b: b.slice(),
        naive: naive.slice(),
        stage: 'fft',
        n,
        layer: len,
      },
    });
  }

  for (let i = 0; i < n; i += 1) fa[i] = cMul(fa[i], fb[i]);
  frames.push({
    type: 'set',
    message: `pointwise multiply in value domain`,
    extra: {
      kind: 'poly',
      a: a.slice(),
      b: b.slice(),
      naive: naive.slice(),
      stage: 'pointwise',
      n,
    },
  });

  fft(fa, true);
  const prod = Array(need);
  for (let i = 0; i < need; i += 1) prod[i] = Math.round(fa[i].re);

  const match = prod.every((v, i) => v === naive[i]);
  frames.push({
    type: 'done',
    message: match
      ? `iFFT product = [${prod.join(', ')}] · matches naive ✓`
      : `mismatch ${prod.join(',')} vs ${naive.join(',')}`,
    extra: {
      kind: 'poly',
      a: a.slice(),
      b: b.slice(),
      naive: naive.slice(),
      stage: 'done',
      n,
      prod,
      match,
    },
  });
  return frames;
}
