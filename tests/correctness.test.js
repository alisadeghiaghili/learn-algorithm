import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { redBlackInserts, validateRedBlack } from '../src/algorithms/redBlack.js';
import { fft, polyMulFft, polyMultiplyFft } from '../src/algorithms/fft.js';
import { suffixTreeMatch } from '../src/algorithms/suffixTree.js';
import { masteryBanks, gradeMastery } from '../src/curriculum/mastery.js';

describe('correctness: red-black CLRS', () => {
  it('properties hold after random inserts', () => {
    const cases = [
      [10, 20, 30],
      [10, 20, 30, 15, 25],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [50, 20, 70, 10, 30, 60, 80, 25, 35],
    ];
    for (const keys of cases) {
      const frames = redBlackInserts(keys);
      const v = validateRedBlack(frames.at(-1).extra.tree);
      assert.equal(v.ok, true, `fail keys=${keys}`);
    }
  });

  it('fires insert-fixup cases', () => {
    const frames = redBlackInserts([10, 20, 30, 15, 25]);
    const cases = frames.filter((f) => f.extra?.case != null && f.extra.case <= 3).map((f) => f.extra.case);
    assert.ok(cases.length >= 1, 'expected at least one fixup case');
  });
});

describe('correctness: real FFT', () => {
  it('polyMulFft matches naive', () => {
    assert.deepEqual(polyMulFft([1, 2, 3], [4, 5, 6]), [4, 13, 28, 27, 18]);
    assert.deepEqual(polyMulFft([1, 1], [1, 1]), [1, 2, 1]);
    assert.deepEqual(polyMulFft([2], [3, 4]), [6, 8]);
  });

  it('fft + inverse is identity', () => {
    const a = [{ re: 1, im: 0 }, { re: 2, im: 0 }, { re: 3, im: 0 }, { re: 4, im: 0 }];
    const copy = a.map((c) => ({ ...c }));
    fft(a, false);
    fft(a, true);
    for (let i = 0; i < 4; i += 1) {
      assert.ok(Math.abs(a[i].re - copy[i].re) < 1e-6);
      assert.ok(Math.abs(a[i].im) < 1e-6);
    }
  });

  it('frame generator reports match', () => {
    const frames = polyMultiplyFft([1, 2, 3], [4, 5, 6]);
    assert.equal(frames.at(-1).extra.match, true);
  });
});

describe('correctness: compacted suffix tree', () => {
  it('finds ana in banana', () => {
    assert.equal(suffixTreeMatch('banana', 'ana').at(-1).extra.match, 1);
  });
  it('misses xyz', () => {
    assert.equal(suffixTreeMatch('banana', 'xyz').at(-1).extra.match, -1);
  });
  it('finds single char', () => {
    assert.equal(suffixTreeMatch('banana', 'n').at(-1).extra.match, 1);
  });
});

describe('mastery banks', () => {
  it('covers all units', () => {
    for (const u of [
      'asymptotics', 'recurrences', 'sorting', 'searching', 'structures',
      'graphs', 'dp', 'greedy', 'dc', 'strings', 'np', 'randomized', 'proofs',
    ]) {
      assert.ok(masteryBanks[u]?.length >= 3, `unit ${u}`);
    }
  });

  it('self-grades sample answers', () => {
    const inv = masteryBanks.sorting[0];
    assert.equal(gradeMastery(inv, '3').ok, true);
    assert.equal(gradeMastery(inv, '4').ok, false);
  });

  it('all items have answers and why', () => {
    for (const [unit, items] of Object.entries(masteryBanks)) {
      for (const it of items) {
        assert.ok(it.answer && it.why, `${unit}/${it.id}`);
      }
    }
  });
});
