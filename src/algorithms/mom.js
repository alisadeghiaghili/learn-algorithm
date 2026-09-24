/**
 * Median of Medians (BFPRT) deterministic selection — worst-case O(n).
 */

/**
 * @param {number[]} input
 * @param {number} k
 */
export function medianOfMediansSelect(input, k = 0) {
  const a = input.slice();
  const frames = [];
  frames.push({
    type: 'info',
    array: a.slice(),
    message: `Median-of-Medians select k=${k} · worst-case Θ(n)`,
    extra: { kind: 'mom', k, groups: [], median: null },
  });

  function select(arr, lo, hi, kk) {
    const n = hi - lo + 1;
    if (n <= 5) {
      const slice = arr.slice(lo, hi + 1).sort((x, y) => x - y);
      for (let i = 0; i < slice.length; i += 1) arr[lo + i] = slice[i];
      frames.push({
        type: 'set',
        array: arr.slice(),
        range: [lo, hi],
        message: `small window [${lo}..${hi}] sorted brute-force`,
        extra: { kind: 'mom', k, groups: [[lo, hi]], median: arr[lo + kk] },
      });
      return arr[lo + kk];
    }

    const groups = [];
    for (let i = lo; i <= hi; i += 5) {
      const end = Math.min(i + 4, hi);
      const chunk = arr.slice(i, end + 1).sort((x, y) => x - y);
      for (let j = 0; j < chunk.length; j += 1) arr[i + j] = chunk[j];
      groups.push([i, end]);
    }
    frames.push({
      type: 'range',
      array: arr.slice(),
      range: [lo, hi],
      message: `group into 5s and sort each (${groups.length} groups)`,
      extra: { kind: 'mom', k, groups: groups.map((g) => g.slice()), median: null },
    });

    const medIdx = [];
    for (let g = 0; g < groups.length; g += 1) {
      const [gs, ge] = groups[g];
      const mid = gs + ((ge - gs) >> 1);
      medIdx.push(mid);
    }
    frames.push({
      type: 'info',
      array: arr.slice(),
      message: `take each group's median: ${medIdx.map((i) => arr[i]).join(', ')}`,
      extra: { kind: 'mom', k, groups: groups.map((g) => g.slice()), median: null, medIdx: medIdx.slice() },
    });

    // move medians to front of range for recursive call
    for (let i = 0; i < medIdx.length; i += 1) {
      const tmp = arr[lo + i];
      arr[lo + i] = arr[medIdx[i]];
      arr[medIdx[i]] = tmp;
    }
    const mom = select(arr, lo, lo + medIdx.length - 1, medIdx.length >> 1);
    frames.push({
      type: 'pivot',
      array: arr.slice(),
      range: [lo, hi],
      pivot: arr.indexOf(mom),
      message: `median-of-medians pivot = ${mom}`,
      extra: { kind: 'mom', k, groups: groups.map((g) => g.slice()), median: mom },
    });

    // partition around mom
    let p = lo;
    for (let i = lo; i <= hi; i += 1) {
      if (arr[i] < mom) {
        const t = arr[p];
        arr[p] = arr[i];
        arr[i] = t;
        p += 1;
      }
    }
    // place mom at p
    let mi = p;
    for (let i = p; i <= hi; i += 1) {
      if (arr[i] === mom) {
        mi = i;
        break;
      }
    }
    arr[mi] = arr[p];
    arr[p] = mom;
    frames.push({
      type: 'swap',
      array: arr.slice(),
      range: [lo, hi],
      pivot: p,
      message: `partition around ${mom} at index ${p}`,
      extra: { kind: 'mom', k, groups: groups.map((g) => g.slice()), median: mom },
    });

    const left = p - lo;
    if (kk === left) return arr[p];
    if (kk < left) {
      frames.push({
        type: 'info',
        array: arr.slice(),
        range: [lo, p - 1],
        message: `k=${kk} is left of pivot · recurse left`,
        extra: { kind: 'mom', k, median: mom },
      });
      return select(arr, lo, p - 1, kk);
    }
    frames.push({
      type: 'info',
      array: arr.slice(),
      range: [p + 1, hi],
      message: `k=${kk} is right of pivot · recurse right`,
      extra: { kind: 'mom', k, median: mom },
    });
    return select(arr, p + 1, hi, kk - left - 1);
  }

  const val = select(a, 0, a.length - 1, Math.min(k, a.length - 1));
  frames.push({
    type: 'done',
    array: a.slice(),
    sorted: [a.indexOf(val)],
    message: `a[${k}] = ${val} · worst-case Θ(n) because |left|,|right| ≤ 0.7n`,
    extra: { kind: 'mom', k, found: a.indexOf(val), median: val },
  });
  return frames;
}

export const SELECT_MOM = { medianOfMediansSelect };
