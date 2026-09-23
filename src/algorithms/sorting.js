/**
 * Sorting algorithms as frame generators.
 * Each generator takes an array and yields visual frames.
 */

/**
 * @param {number[]} input
 * @returns {import('../engine/types.js').Frame[]}
 */
export function bubbleSort(input) {
  const a = input.slice();
  const n = a.length;
  /** @type {import('../engine/types.js').Frame[]} */
  const frames = [];
  const sorted = new Set();
  frames.push({
    type: 'info',
    array: a.slice(),
    sorted: [],
    message: `bubble sort · n=${n} · worst O(n²)`,
  });

  for (let i = 0; i < n - 1; i += 1) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j += 1) {
      frames.push({
        type: 'compare',
        indices: [j, j + 1],
        array: a.slice(),
        sorted: [...sorted],
        range: [0, n - 1 - i],
        message: `compare a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}`,
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        frames.push({
          type: 'swap',
          indices: [j, j + 1],
          array: a.slice(),
          sorted: [...sorted],
          range: [0, n - 1 - i],
          message: `swap a[${j}] ↔ a[${j + 1}]`,
        });
      }
    }
    sorted.add(n - 1 - i);
    frames.push({
      type: 'set',
      indices: [n - 1 - i],
      array: a.slice(),
      sorted: [...sorted],
      message: `a[${n - 1 - i}] is in final place`,
    });
    if (!swapped) break;
  }
  sorted.add(0);
  frames.push({
    type: 'done',
    array: a.slice(),
    sorted: [...sorted],
    message: 'sorted',
  });
  return frames;
}

/**
 * @param {number[]} input
 */
export function selectionSort(input) {
  const a = input.slice();
  const n = a.length;
  const frames = [];
  const sorted = new Set();
  frames.push({
    type: 'info',
    array: a.slice(),
    sorted: [],
    message: `selection sort · n=${n} · always O(n²)`,
  });

  for (let i = 0; i < n - 1; i += 1) {
    let best = i;
    for (let j = i + 1; j < n; j += 1) {
      frames.push({
        type: 'compare',
        indices: [best, j],
        array: a.slice(),
        sorted: [...sorted],
        range: [i, n - 1],
        pivot: best,
        message: `scan for min · candidate a[${best}]=${a[best]} vs a[${j}]=${a[j]}`,
      });
      if (a[j] < a[best]) {
        best = j;
        frames.push({
          type: 'info',
          indices: [best],
          array: a.slice(),
          sorted: [...sorted],
          range: [i, n - 1],
          pivot: best,
          message: `new min at index ${best} (${a[best]})`,
        });
      }
    }
    if (best !== i) {
      [a[i], a[best]] = [a[best], a[i]];
      frames.push({
        type: 'swap',
        indices: [i, best],
        array: a.slice(),
        sorted: [...sorted],
        message: `place min at a[${i}]`,
      });
    }
    sorted.add(i);
    frames.push({
      type: 'set',
      indices: [i],
      array: a.slice(),
      sorted: [...sorted],
      message: `a[${i}] finalized`,
    });
  }
  sorted.add(n - 1);
  frames.push({ type: 'done', array: a.slice(), sorted: [...sorted], message: 'sorted' });
  return frames;
}

/**
 * @param {number[]} input
 */
export function insertionSort(input) {
  const a = input.slice();
  const n = a.length;
  const frames = [];
  const sorted = new Set([0]);
  frames.push({
    type: 'info',
    array: a.slice(),
    sorted: [0],
    message: `insertion sort · n=${n} · best O(n), worst O(n²)`,
  });

  for (let i = 1; i < n; i += 1) {
    const key = a[i];
    let j = i - 1;
    frames.push({
      type: 'info',
      indices: [i],
      array: a.slice(),
      sorted: [...sorted],
      message: `take key = ${key} at index ${i}`,
    });
    while (j >= 0) {
      frames.push({
        type: 'compare',
        indices: [j, j + 1],
        array: a.slice(),
        sorted: [...sorted],
        range: [0, i],
        message: `compare a[${j}]=${a[j]} with key ${key}`,
      });
      if (a[j] > key) {
        a[j + 1] = a[j];
        frames.push({
          type: 'set',
          indices: [j, j + 1],
          array: a.slice(),
          sorted: [...sorted],
          range: [0, i],
          message: `shift a[${j}] → a[${j + 1}]`,
        });
        j -= 1;
      } else break;
    }
    a[j + 1] = key;
    for (let k = 0; k <= i; k += 1) sorted.add(k);
    frames.push({
      type: 'set',
      indices: [j + 1],
      array: a.slice(),
      sorted: [...sorted],
      message: `insert key ${key} at index ${j + 1}`,
    });
  }
  frames.push({ type: 'done', array: a.slice(), sorted: [...sorted], message: 'sorted' });
  return frames;
}

/**
 * @param {number[]} input
 */
export function mergeSort(input) {
  const a = input.slice();
  const frames = [];
  frames.push({
    type: 'info',
    array: a.slice(),
    sorted: [],
    message: `merge sort · n=${a.length} · Θ(n log n) divide & conquer`,
  });

  /**
   * @param {number} lo @param {number} hi
   */
  function sort(lo, hi) {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    frames.push({
      type: 'range',
      range: [lo, hi],
      array: a.slice(),
      message: `divide [${lo}..${hi}] at ${mid}`,
      extra: { left: [lo, mid], right: [mid + 1, hi] },
    });
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  }

  function merge(lo, mid, hi) {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0;
    let j = 0;
    let k = lo;
    frames.push({
      type: 'range',
      range: [lo, hi],
      array: a.slice(),
      message: `merge [${left.join(',')}] + [${right.join(',')}]`,
      extra: { left: [lo, mid], right: [mid + 1, hi] },
    });
    while (i < left.length && j < right.length) {
      frames.push({
        type: 'compare',
        indices: [lo + i, mid + 1 + j],
        array: a.slice(),
        range: [lo, hi],
        message: `compare ${left[i]} and ${right[j]}`,
      });
      if (left[i] <= right[j]) {
        a[k] = left[i];
        i += 1;
      } else {
        a[k] = right[j];
        j += 1;
      }
      frames.push({
        type: 'set',
        indices: [k],
        array: a.slice(),
        range: [lo, hi],
        message: `write ${a[k]} at index ${k}`,
      });
      k += 1;
    }
    while (i < left.length) {
      a[k] = left[i];
      frames.push({
        type: 'set',
        indices: [k],
        array: a.slice(),
        range: [lo, hi],
        message: `drain left ${a[k]}`,
      });
      i += 1;
      k += 1;
    }
    while (j < right.length) {
      a[k] = right[j];
      frames.push({
        type: 'set',
        indices: [k],
        array: a.slice(),
        range: [lo, hi],
        message: `drain right ${a[k]}`,
      });
      j += 1;
      k += 1;
    }
  }

  sort(0, a.length - 1);
  frames.push({
    type: 'done',
    array: a.slice(),
    sorted: a.map((_, i) => i),
    message: 'sorted',
  });
  return frames;
}

/**
 * @param {number[]} input
 * @param {number} [seedPivot] fixed pivot strategy: 0 last, 1 mid, 2 first
 */
export function quickSort(input, seedPivot = 0) {
  const a = input.slice();
  const frames = [];
  const sorted = new Set();
  frames.push({
    type: 'info',
    array: a.slice(),
    sorted: [],
    message: `quick sort · avg O(n log n), worst O(n²)`,
  });

  /**
   * @param {number} lo @param {number} hi
   */
  function sort(lo, hi) {
    if (lo > hi) return;
    if (lo === hi) {
      sorted.add(lo);
      frames.push({
        type: 'set',
        indices: [lo],
        array: a.slice(),
        sorted: [...sorted],
        message: `singleton ${a[lo]} placed`,
      });
      return;
    }
    const p = partition(lo, hi);
    sorted.add(p);
    frames.push({
      type: 'set',
      indices: [p],
      array: a.slice(),
      sorted: [...sorted],
      pivot: p,
      message: `pivot ${a[p]} locked at ${p}`,
    });
    sort(lo, p - 1);
    sort(p + 1, hi);
  }

  function partition(lo, hi) {
    let pivotIdx = hi;
    if (seedPivot === 1) pivotIdx = (lo + hi) >> 1;
    if (seedPivot === 2) pivotIdx = lo;
    if (pivotIdx !== hi) {
      [a[pivotIdx], a[hi]] = [a[hi], a[pivotIdx]];
    }
    const pivot = a[hi];
    frames.push({
      type: 'pivot',
      indices: [hi],
      array: a.slice(),
      sorted: [...sorted],
      range: [lo, hi],
      pivot: hi,
      message: `pivot = ${pivot} on [${lo}..${hi}]`,
    });
    let i = lo;
    for (let j = lo; j < hi; j += 1) {
      frames.push({
        type: 'compare',
        indices: [j, hi],
        array: a.slice(),
        sorted: [...sorted],
        range: [lo, hi],
        pivot: hi,
        message: `compare a[${j}]=${a[j]} with pivot ${pivot}`,
      });
      if (a[j] < pivot) {
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          frames.push({
            type: 'swap',
            indices: [i, j],
            array: a.slice(),
            sorted: [...sorted],
            range: [lo, hi],
            pivot: hi,
            message: `move ${a[i]} into left partition`,
          });
        }
        i += 1;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    frames.push({
      type: 'swap',
      indices: [i, hi],
      array: a.slice(),
      sorted: [...sorted],
      range: [lo, hi],
      pivot: i,
      message: `place pivot at ${i}`,
    });
    return i;
  }

  sort(0, a.length - 1);
  frames.push({
    type: 'done',
    array: a.slice(),
    sorted: a.map((_, i) => i),
    message: 'sorted',
  });
  return frames;
}

/**
 * @param {number[]} input
 */
export function heapSort(input) {
  const a = input.slice();
  const n = a.length;
  const frames = [];
  const sorted = new Set();
  frames.push({
    type: 'info',
    array: a.slice(),
    sorted: [],
    message: `heap sort · n=${n} · Θ(n log n)`,
  });

  function sift(i, size) {
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let big = i;
      if (l < size) {
        frames.push({
          type: 'compare',
          indices: [big, l],
          array: a.slice(),
          sorted: [...sorted],
          message: `sift: compare ${a[big]} and left child ${a[l]}`,
        });
        if (a[l] > a[big]) big = l;
      }
      if (r < size) {
        frames.push({
          type: 'compare',
          indices: [big, r],
          array: a.slice(),
          sorted: [...sorted],
          message: `sift: compare ${a[big]} and right child ${a[r]}`,
        });
        if (a[r] > a[big]) big = r;
      }
      if (big === i) break;
      [a[i], a[big]] = [a[big], a[i]];
      frames.push({
        type: 'swap',
        indices: [i, big],
        array: a.slice(),
        sorted: [...sorted],
        message: `sift down from ${i} to ${big}`,
      });
      i = big;
    }
  }

  for (let i = (n >> 1) - 1; i >= 0; i -= 1) sift(i, n);
  frames.push({
    type: 'info',
    array: a.slice(),
    sorted: [],
    message: 'max-heap built',
  });

  for (let end = n - 1; end > 0; end -= 1) {
    [a[0], a[end]] = [a[end], a[0]];
    frames.push({
      type: 'swap',
      indices: [0, end],
      array: a.slice(),
      sorted: [...sorted],
      message: `extract max ${a[end]} to index ${end}`,
    });
    sorted.add(end);
    sift(0, end);
  }
  sorted.add(0);
  frames.push({ type: 'done', array: a.slice(), sorted: [...sorted], message: 'sorted' });
  return frames;
}

export const SORTERS = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
  quick: quickSort,
  heap: heapSort,
};
