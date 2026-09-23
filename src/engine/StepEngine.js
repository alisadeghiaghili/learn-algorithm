import { clone, cloneArr } from './types.js';

/**
 * Step engine: stores frames produced by algorithms or player moves,
 * supports play / step / pause / reset / undo of *player* command history.
 */
export class StepEngine {
  constructor() {
    /** @type {import('./types.js').Frame[]} */
    this.frames = [];
    this.cursor = -1;
    this.playing = false;
    this.speed = 5; // 1..10
    this._timer = null;
    /** @type {Set<() => void>} */
    this._listeners = new Set();
    /** player undo stack of high-level command snapshots */
    this.history = [];
  }

  /** @param {() => void} fn */
  onChange(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _emit() {
    for (const fn of this._listeners) fn();
  }

  /**
   * Load a full frame list (auto-run / demo / algorithm execution).
   * @param {import('./types.js').Frame[]} frames
   */
  loadFrames(frames) {
    this.pause();
    this.frames = frames;
    this.cursor = frames.length ? 0 : -1;
    this._emit();
  }

  /**
   * Append one player-driven frame and show it.
   * @param {import('./types.js').Frame} frame
   */
  pushFrame(frame) {
    this.pause();
    this.frames.push(frame);
    this.cursor = this.frames.length - 1;
    this._emit();
  }

  /** Current frame or null. */
  current() {
    if (this.cursor < 0 || this.cursor >= this.frames.length) return null;
    return this.frames[this.cursor];
  }

  /** 0..1 progress through frames. */
  progress() {
    if (!this.frames.length) return 0;
    return (this.cursor + 1) / this.frames.length;
  }

  get done() {
    return this.frames.length > 0 && this.cursor >= this.frames.length - 1;
  }

  step() {
    if (!this.frames.length) return false;
    if (this.cursor < this.frames.length - 1) {
      this.cursor += 1;
      this._emit();
      return true;
    }
    this.pause();
    return false;
  }

  stepBack() {
    if (this.cursor > 0) {
      this.cursor -= 1;
      this._emit();
      return true;
    }
    return false;
  }

  toStart() {
    if (this.frames.length) {
      this.cursor = 0;
      this._emit();
    }
  }

  toEnd() {
    if (this.frames.length) {
      this.cursor = this.frames.length - 1;
      this._emit();
    }
  }

  delayMs() {
    // 1 slow … 10 fast
    return Math.max(40, 700 - this.speed * 65);
  }

  play() {
    if (this.playing) return;
    if (this.done) this.cursor = 0;
    this.playing = true;
    this._emit();
    const tick = () => {
      if (!this.playing) return;
      const moved = this.step();
      if (moved) {
        this._timer = setTimeout(tick, this.delayMs());
      } else {
        this.playing = false;
        this._emit();
      }
    };
    this._timer = setTimeout(tick, this.delayMs());
  }

  pause() {
    this.playing = false;
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    this._emit();
  }

  togglePlay() {
    if (this.playing) this.pause();
    else this.play();
  }

  setSpeed(speed) {
    this.speed = Math.min(10, Math.max(1, speed));
    if (this.playing) {
      this.pause();
      this.play();
    }
    this._emit();
  }

  /** Push a restore-snapshot for undo of last player command. */
  saveHistory(snapshot) {
    this.history.push(snapshot);
    if (this.history.length > 80) this.history.shift();
  }

  popHistory() {
    return this.history.pop() ?? null;
  }

  clearHistory() {
    this.history = [];
  }

  /**
   * Hard reset frames + cursor (keeps history unless cleared).
   * @param {import('./types.js').Frame[]} [initialFrames]
   */
  resetFrames(initialFrames = []) {
    this.loadFrames(initialFrames);
    this._emit();
  }
}

export { clone, cloneArr };
