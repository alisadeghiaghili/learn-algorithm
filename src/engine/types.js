/**
 * Shared types and tiny helpers for algorithm step frames.
 *
 * A Frame is an immutable snapshot the visualizer renders after each step.
 *
 * @typedef {'compare' | 'swap' | 'set' | 'visit' | 'relax' | 'pivot' | 'range' | 'done' | 'info' | 'error'} FrameType
 *
 * @typedef {Object} Frame
 * @property {FrameType} type
 * @property {number[]} [indices] indices involved in this step
 * @property {number[]} [pair] second index set (e.g. swap partners)
 * @property {number[]} [range] inclusive subarray range [lo, hi]
 * @property {number[]} [array] full array snapshot after the step
 * @property {number[]} [sorted] indices marked finalized
 * @property {number} [pivot] pivot index
 * @property {string} message human-readable narration
 * @property {Object} [extra] visualizer-specific payload
 */

/** @param {number[]} a */
export function cloneArr(a) {
  return a.slice();
}

/** @param {number} n @param {number} [lo] @param {number} [hi] */
export function randInt(n, lo = 0, hi = 100) {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/** @param {number} n */
export function randomArray(n, lo = 5, hi = 95) {
  return Array.from({ length: n }, () => randInt(n, lo, hi));
}

/**
 * Deep-ish clone of a plain serializable state object.
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function clone(value) {
  return structuredClone(value);
}
