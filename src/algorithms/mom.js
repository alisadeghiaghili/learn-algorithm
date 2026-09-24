/**
 * Precise MOM visualizer payload builder + upgraded MOM frames for clear grouping.
 */

/**
 * @param {number[]} input
 * @param {number} k
 */
export function medianOfMediansSelect(input, k = 0) {
  const a = input.slice();
  const frames = [];

  /**
   * @param {string} message
   * @param {object} extra
   */
  function push(type, message, extra) {
    frames.push({ type, message, array: a.slice(), ...extra });
  }

  push('info', `MOM select k=${k} · groups of 5 · worst-case Θ(n)`, {
    extra: {
      kind: 'mom',
      k,
      groups: [],
      median: null,
      medIdx: [],
      pivot: null,
      lo: 0,
      hi: a.length - 1,
    },
  });

  /**
   * @param {number[]} arr
   * @param {number} lo
   * @param {number} hi
   * @param {number} kk
   */
  function select(arr, lo, hi, kk) {
    const n = hi - lo + 1;
    if (n <= 5) {
      const slice = arr.slice(lo, hi + 1).sort((x, y) => x - y);
      for (let i = 0; i < slice.length; i += 1) arr[lo + i] = slice[i];
      push('set', `small window [${lo}..${hi}] sorted → ${arr[lo + kk]}`, {
        range: [lo, hi],
        extra: {
          kind: 'mom',
          k,
          groups: [[lo, hi]],
          median: arr[lo + kk],
          medIdx: [lo + kk],
          lo,
          hi,
          phase: 'small',
        },
      });
      return arr[lo + kk];
    }

    /** @type {[number, number][]} */
    const groups = [];
    for (let i = lo; i <= hi; i += 5) {
      const end = Math.min(i + 4, hi);
      const chunk = arr.slice(i, end + 1).sort((x, y) => x - y);
      for (let j = 0; j < chunk.length; j += 1) arr[i + j] = chunk[j];
      groups.push([i, end]);
    }
    push('range', `group into 5s & sort each · ${groups.length} groups`, {
      range: [lo, hi],
      extra: {
        kind: 'mom',
        k,
        groups: groups.map((g) => g.slice()),
        medIdx: [],
        lo,
        hi,
        phase: 'groups',
      },
    });

    const medIdx = [];
    for (const [gs, ge] of groups) {
      medIdx.push(gs + ((ge - gs) >> 1));
    }
    push('info', `group medians at ${medIdx.map((i) => `${i}:${arr[i]}`).join(' ')}`, {
      range: [lo, hi],
      extra: {
        kind: 'mom',
        k,
        groups: groups.map((g) => g.slice()),
        medIdx: medIdx.slice(),
        lo,
        hi,
        phase: 'medians',
      },
    });

    for (let i = 0; i < medIdx.length; i += 1) {
      const t = arr[lo + i];
      arr[lo + i] = arr[medIdx[i]];
      arr[medIdx[i]] = t;
    }
    push('swap', `move medians to front of [${lo}..${hi}]`, {
      range: [lo, hi],
      extra: {
        kind: 'mom',
        k,
        groups: groups.map((g) => g.slice()),
        medIdx: medIdx.map((i) => lo + i),
        lo,
        hi,
        phase: 'gather',
      },
    });

    const mom = select(arr, lo, lo + medIdx.length - 1, medIdx.length >> 1);
    push('pivot', `median-of-medians pivot = ${mom}`, {
      range: [lo, hi],
      pivot: arr.indexOf(mom),
      extra: {
        kind: 'mom',
        k,
        groups: groups.map((g) => g.slice()),
        median: mom,
        pivot: mom,
        lo,
        hi,
        phase: 'pivot',
      },
    });

    let p = lo;
    for (let i = lo; i <= hi; i += 1) {
      if (arr[i] < mom) {
        const t = arr[p];
        arr[p] = arr[i];
        arr[i] = t;
        p += 1;
      }
    }
    let mi = p;
    for (let i = p; i <= hi; i += 1) {
      if (arr[i] === mom) {
        mi = i;
        break;
      }
    }
    arr[mi] = arr[p];
    arr[p] = mom;
    push('swap', `partition around ${mom} at ${p} · |left|=${p - lo} |right|=${hi - p}`, {
      range: [lo, hi],
      pivot: p,
      extra: {
        kind: 'mom',
        k,
        groups: groups.map((g) => g.slice()),
        median: mom,
        pivot: mom,
        lo,
        hi,
        phase: 'partition',
        left: [lo, p - 1],
        right: [p + 1, hi],
      },
    });

    const left = p - lo;
    if (kk === left) return arr[p];
    if (kk < left) {
      push('info', `k=${kk} is left of pivot · recurse [${lo}..${p - 1}]`, {
        range: [lo, p - 1],
        extra: { kind: 'mom', k, median: mom, lo, hi: p - 1, phase: 'left' },
      });
      return select(arr, lo, p - 1, kk);
    }
    push('info', `k=${kk} is right of pivot · recurse [${p + 1}..${hi}]`, {
      range: [p + 1, hi],
      extra: { kind: 'mom', k, median: mom, lo: p + 1, hi, phase: 'right' },
    });
    return select(arr, p + 1, hi, kk - left - 1);
  }

  const val = select(a, 0, a.length - 1, Math.min(k, a.length - 1));
  push('done', `a[${k}] = ${val} · 30/70 split ⇒ T(n)=T(n/5)+T(7n/10)+O(n)`, {
    sorted: [a.indexOf(val)],
    extra: {
      kind: 'mom',
      k,
      found: a.indexOf(val),
      median: val,
      phase: 'done',
    },
  });
  return frames;
}

export const SELECT_MOM = { medianOfMediansSelect };
