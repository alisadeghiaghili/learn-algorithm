/**
 * Searching algorithms as frame generators.
 */

/**
 * @param {number[]} input
 * @param {number} target
 */
export function linearSearch(input, target) {
  const a = input.slice();
  const frames = [];
  frames.push({
    type: 'info',
    array: a.slice(),
    message: `linear search for ${target} · O(n)`,
    extra: { target },
  });
  for (let i = 0; i < a.length; i += 1) {
    frames.push({
      type: 'compare',
      indices: [i],
      array: a.slice(),
      message: `probe a[${i}] = ${a[i]}`,
      extra: { target, lo: 0, hi: a.length - 1, mid: i },
    });
    if (a[i] === target) {
      frames.push({
        type: 'done',
        indices: [i],
        array: a.slice(),
        sorted: [i],
        message: `found ${target} at index ${i}`,
        extra: { target, found: i },
      });
      return frames;
    }
  }
  frames.push({
    type: 'done',
    array: a.slice(),
    message: `${target} not present`,
    extra: { target, found: -1 },
  });
  return frames;
}

/**
 * @param {number[]} input must be sorted
 * @param {number} target
 */
export function binarySearch(input, target) {
  const a = input.slice();
  const frames = [];
  let lo = 0;
  let hi = a.length - 1;
  frames.push({
    type: 'info',
    array: a.slice(),
    message: `binary search for ${target} · O(log n) · requires sorted input`,
    extra: { target, lo, hi },
  });

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    frames.push({
      type: 'compare',
      indices: [mid],
      array: a.slice(),
      range: [lo, hi],
      pivot: mid,
      message: `lo=${lo} hi=${hi} mid=${mid} → a[mid]=${a[mid]}`,
      extra: { target, lo, hi, mid },
    });
    if (a[mid] === target) {
      frames.push({
        type: 'done',
        indices: [mid],
        array: a.slice(),
        sorted: [mid],
        range: [lo, hi],
        message: `found ${target} at index ${mid}`,
        extra: { target, found: mid, lo, hi, mid },
      });
      return frames;
    }
    if (a[mid] < target) {
      lo = mid + 1;
      frames.push({
        type: 'info',
        indices: [mid],
        array: a.slice(),
        range: [lo, hi],
        message: `discard left half · lo = ${lo}`,
        extra: { target, lo, hi, mid },
      });
    } else {
      hi = mid - 1;
      frames.push({
        type: 'info',
        indices: [mid],
        array: a.slice(),
        range: [lo, hi],
        message: `discard right half · hi = ${hi}`,
        extra: { target, lo, hi, mid },
      });
    }
  }
  frames.push({
    type: 'done',
    array: a.slice(),
    message: `${target} not present`,
    extra: { target, found: -1, lo, hi },
  });
  return frames;
}

export const SEARCHERS = {
  linear: linearSearch,
  binary: binarySearch,
};
