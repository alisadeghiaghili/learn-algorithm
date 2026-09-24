import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { medianOfMediansSelect } from '../src/algorithms/mom.js';
import { polyMultiply, matroidGreedy, vertexCover2Approx, redBlackInserts, suffixTreeMatch } from '../src/algorithms/peak.js';
import { clauseTo3Cnf } from '../src/algorithms/gadgets.js';
import { createProofSession, proofBanks } from '../src/algorithms/proofEngine.js';

describe('peak depth', () => {
  it('mom finds kth', () => {
    const frames = medianOfMediansSelect([7, 2, 9, 1, 5, 3, 8, 4, 6, 10], 4);
    const val = frames.at(-1).message.match(/= (\d+)/)?.[1];
    assert.ok(val != null);
  });

  it('poly multiply', () => {
    const frames = polyMultiply([1, 2, 3], [4, 5, 6]);
    assert.deepEqual(frames.at(-1).extra.naive, [4, 13, 28, 27, 18]);
  });

  it('matroid greedy top-k', () => {
    const frames = matroidGreedy([8, 6, 5, 4, 3], 3);
    assert.equal(frames.at(-1).extra.total, 8 + 6 + 5);
  });

  it('vertex cover 2-approx', () => {
    const g = {
      directed: false,
      nodes: [0, 1, 2, 3].map((id) => ({ id, label: String(id), x: 0, y: 0 })),
      edges: [
        { u: 0, v: 1, w: 1 },
        { u: 1, v: 2, w: 1 },
        { u: 2, v: 3, w: 1 },
      ],
    };
    const frames = vertexCover2Approx(g);
    assert.equal(frames.at(-1).extra.approx, 2);
  });

  it('red-black inserts', () => {
    const frames = redBlackInserts([10, 20, 30, 15, 25]);
    assert.equal(frames.at(-1).type, 'done');
  });

  it('suffix tree finds ana in banana', () => {
    const frames = suffixTreeMatch('banana', 'ana');
    assert.equal(frames.at(-1).extra.match, 1);
  });

  it('clause gadget splits long OR', () => {
    const frames = clauseTo3Cnf(['a', 'b', 'c', 'd', 'e']);
    assert.ok(frames.at(-1).extra.output.length >= 2);
  });
});

describe('proof engine', () => {
  it('grades a full bank', () => {
    const bank = proofBanks['insertion-invariant'];
    const s = createProofSession(bank);
    assert.equal(s.submit('b').ok, true);
    assert.equal(s.submit('termination').ok, true);
    assert.equal(s.submit('b').ok, true);
    assert.equal(s.done, true);
    assert.equal(s.allCorrect, true);
  });

  it('rejects wrong and stays on step', () => {
    const bank = proofBanks['binary-invariant'];
    const s = createProofSession(bank);
    assert.equal(s.submit('wrong').ok, false);
    assert.equal(s.index, 0);
  });

  it('has 8 banks', () => {
    assert.ok(Object.keys(proofBanks).length >= 8);
  });
});
