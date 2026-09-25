/**
 * Non-comparison sorts + selection as frame generators.
 */

/**
 * @param {number[]} input
 * @param {number} [k] max key + 1 (ignored if keys can be negative; computed)
 */
export function countingSort(input, k) {
  const a = input.slice();
  if (!a.length) {
    return [
      {
        type: 'done',
        array: [],
        sorted: [],
        message: 'sorted · empty',
        extra: { kind: 'count', count: [], phase: 'done' },
      },
    ];
  }
  // support negative keys by shifting to 0..range
  const min = Math.min(...a);
  const max = Math.max(...a);
  const range = max - min; // inclusive span
  const frames = [];
  const count = Array.from({ length: range + 1 }, () => 0);
  const offset = min;
  frames.push({
    type: 'info',
    array: a.slice(),
    message: `counting sort · keys ${min}..${max} · offset=${offset} · Θ(n+k)`,
    extra: { kind: 'count', count: count.slice(), phase: 'count', offset },
  });

  for (let i = 0; i < a.length; i += 1) {
    count[a[i] - offset] += 1;
    frames.push({
      type: 'set',
      indices: [i],
      array: a.slice(),
      message: `count[${a[i]}] = ${count[a[i] - offset]}`,
      extra: { kind: 'count', count: count.slice(), phase: 'count', offset },
    });
  }

  for (let i = 1; i <= range; i += 1) {
    count[i] += count[i - 1];
    frames.push({
      type: 'set',
      array: a.slice(),
      message: `prefix sum count[${i + offset}] = ${count[i]}`,
      extra: { kind: 'count', count: count.slice(), phase: 'prefix', offset },
    });
  }

  const out = Array(a.length).fill(0);
  for (let i = a.length - 1; i >= 0; i -= 1) {
    const v = a[i] - offset;
    count[v] -= 1;
    out[count[v]] = a[i];
    frames.push({
      type: 'set',
      indices: [i],
      array: out.slice(),
      message: `place ${a[i]} at out[${count[v]}] (stable, right-to-left)`,
      extra: { kind: 'count', count: count.slice(), phase: 'scatter', out: out.slice(), offset },
    });
  }

  frames.push({
    type: 'done',
    array: out.slice(),
    sorted: out.map((_, i) => i),
    message: 'sorted · Θ(n+k) stable (offset handles negatives)',
    extra: { kind: 'count', count: count.slice(), phase: 'done', offset },
  });
  return frames;
}

/**
 * LSD radix sort base 10. Shifts by min so negatives work.
 * @param {number[]} input
 */
export function radixSort(input) {
  const a0 = input.slice();
  const frames = [];
  if (!a0.length) {
    return [{ type: 'done', array: [], sorted: [], message: 'sorted · empty' }];
  }
  const min = Math.min(...a0);
  // work in non-negative space
  const a = a0.map((x) => x - min);
  const maxVal = Math.max(...a);
  frames.push({
    type: 'info',
    array: a0.slice(),
    message: `radix LSD · shift=${min} · max=${maxVal} · O(d(n+10))`,
  });

  let exp = 1;
  while (Math.floor(maxVal / exp) > 0) {
    frames.push({
      type: 'range',
      array: a.map((x) => x + min),
      message: `counting sort on digit place ${exp}`,
      range: [0, a.length - 1],
    });
    const out = Array(a.length).fill(0);
    const count = Array(10).fill(0);
    for (const v of a) count[Math.floor(v / exp) % 10] += 1;
    for (let i = 1; i < 10; i += 1) count[i] += count[i - 1];
    for (let i = a.length - 1; i >= 0; i -= 1) {
      const d = Math.floor(a[i] / exp) % 10;
      count[d] -= 1;
      out[count[d]] = a[i];
    }
    for (let i = 0; i < a.length; i += 1) {
      a[i] = out[i];
      frames.push({
        type: 'set',
        indices: [i],
        array: a.map((x) => x + min),
        message: `digit-place ${exp}: write ${a[i] + min} at ${i}`,
      });
    }
    exp *= 10;
  }
  const final = a.map((x) => x + min);
  frames.push({
    type: 'done',
    array: final,
    sorted: final.map((_, i) => i),
    message: 'sorted by LSD radix (shift handles negatives)',
  });
  return frames;
}

/**
 * Bucket sort for values in [0, 100).
 * @param {number[]} input
 */
export function bucketSort(input) {
  const a = input.slice();
  const frames = [];
  const n = a.length || 1;
  const B = Math.max(1, Math.min(12, n));
  /** @type {number[][]} */
  const buckets = Array.from({ length: B }, () => []);
  frames.push({ type: 'info', array: a.slice(), message: `bucket sort · ${B} buckets` });

  for (const v of a) {
    const bi = Math.min(B - 1, Math.floor((v / 100) * B));
    buckets[bi].push(v);
    frames.push({
      type: 'set',
      array: a.slice(),
      message: `value ${v} → bucket ${bi}`,
      extra: { kind: 'buckets', buckets: buckets.map((b) => b.slice()) },
    });
  }

  buckets.forEach((b) => b.sort((x, y) => x - y));
  frames.push({
    type: 'info',
    array: a.slice(),
    message: 'sort each bucket (insertion)',
    extra: { kind: 'buckets', buckets: buckets.map((b) => b.slice()) },
  });

  let k = 0;
  const out = [];
  for (let bi = 0; bi < B; bi += 1) {
    for (const v of buckets[bi]) {
      out.push(v);
      a[k] = v;
      frames.push({
        type: 'set',
        indices: [k],
        array: a.slice(),
        message: `concat bucket ${bi}: ${v}`,
        extra: { kind: 'buckets', buckets: buckets.map((b) => b.slice()) },
      });
      k += 1;
    }
  }
  frames.push({
    type: 'done',
    array: a.slice(),
    sorted: a.map((_, i) => i),
    message: 'sorted · expected Θ(n)',
    extra: { kind: 'buckets', buckets: buckets.map((b) => b.slice()) },
  });
  return frames;
}

/**
 * Randomized quickselect — find k-th smallest (0-based).
 * @param {number[]} input
 * @param {number} k
 */
export function quickSelect(input, k) {
  const a = input.slice();
  const frames = [];
  frames.push({
    type: 'info',
    array: a.slice(),
    message: `randomized select k=${k} · expected Θ(n)`,
    extra: { k },
  });

  let lo = 0;
  let hi = a.length - 1;
  while (lo <= hi) {
    const pivotIdx = lo + Math.floor(Math.random() * (hi - lo + 1));
    [a[pivotIdx], a[hi]] = [a[hi], a[pivotIdx]];
    const pivot = a[hi];
    frames.push({
      type: 'pivot',
      indices: [hi],
      array: a.slice(),
      range: [lo, hi],
      pivot: hi,
      message: `pivot ${pivot} on [${lo}..${hi}]`,
      extra: { k },
    });
    let i = lo;
    for (let j = lo; j < hi; j += 1) {
      frames.push({
        type: 'compare',
        indices: [j, hi],
        array: a.slice(),
        range: [lo, hi],
        pivot: hi,
        message: `compare ${a[j]} with pivot`,
        extra: { k },
      });
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        i += 1;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    frames.push({
      type: 'swap',
      indices: [i, hi],
      array: a.slice(),
      range: [lo, hi],
      pivot: i,
      message: `pivot placed at ${i}`,
      extra: { k },
    });
    if (i === k) {
      frames.push({
        type: 'done',
        indices: [i],
        array: a.slice(),
        sorted: [i],
        message: `a[${k}] = ${a[k]}`,
        extra: { k, found: i },
      });
      return frames;
    }
    if (k < i) hi = i - 1;
    else lo = i + 1;
    frames.push({
      type: 'info',
      array: a.slice(),
      range: [lo, hi],
      message: `narrow to [${lo}..${hi}]`,
      extra: { k },
    });
  }
  frames.push({ type: 'done', array: a.slice(), message: 'k out of range', extra: { k } });
  return frames;
}

export const LINEAR_SORTERS = {
  counting: countingSort,
  radix: radixSort,
  bucket: bucketSort,
};
