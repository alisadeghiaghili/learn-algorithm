import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  proofWritingTasks,
  gradeProofField,
  gradeProofDraft,
} from '../src/algorithms/proofWriter.js';
import { medianOfMediansSelect } from '../src/algorithms/mom.js';
import { PreciseViz } from '../src/viz/preciseViz.js';

describe('proof writer grading', () => {
  const task = proofWritingTasks['write-insertion'];

  it('accepts a good initialization', () => {
    const r = gradeProofField(
      task.fields[0],
      'The prefix a[0] is empty or a singleton hence sorted and a permutation of the original',
    );
    assert.equal(r.ok, true, r.why);
  });

  it('rejects missing keywords', () => {
    const r = gradeProofField(task.fields[0], 'it works fine');
    assert.equal(r.ok, false);
    assert.ok(r.missing.length > 0);
  });

  it('accepts full correct draft', () => {
    const draft = {
      init: 'prefix a[0] is sorted and a permutation of the original',
      maintain: 'insert key into sorted prefix by shift so a[0..j] sorted',
      term: 'at j = n the whole array a[0..n-1] is sorted and a permutation',
    };
    const r = gradeProofDraft(task, draft);
    assert.equal(r.ok, true, JSON.stringify(r.results, null, 2));
  });

  it('all five writing tasks exist with 3 fields', () => {
    for (const id of [
      'write-insertion',
      'write-dijkstra',
      'write-greedy-exchange',
      'write-np-reduction',
      'write-master-subst',
    ]) {
      assert.equal(proofWritingTasks[id].fields.length, 3, id);
    }
  });

  it('dijkstra needs non-negativity', () => {
    const t = proofWritingTasks['write-dijkstra'];
    const bad = gradeProofField(t.fields[0], 'graphs are connected');
    assert.equal(bad.ok, false);
    const good = gradeProofField(t.fields[0], 'all weights w are non-negative');
    assert.equal(good.ok, true, good.why);
  });
});

describe('MOM precise frames', () => {
  it('emits phases and groups', () => {
    const frames = medianOfMediansSelect([9, 1, 8, 2, 7, 3, 6, 4, 5, 10], 3);
    const phases = new Set(frames.map((f) => f.extra?.phase).filter(Boolean));
    assert.ok(phases.has('groups'));
    assert.ok(phases.has('medians'));
    assert.ok(phases.has('partition'));
    assert.equal(frames.at(-1).type, 'done');
    // groups of 5 present in at least one frame
    assert.ok(frames.some((f) => (f.extra?.groups || []).length >= 2));
  });
});

describe('PreciseViz mount (jsdom-free smoke)', () => {
  it('returns true for mom extra', () => {
    // stub minimal document for SVG
    globalThis.document = {
      createElementNS(_ns, tag) {
        return {
          tagName: tag,
          setAttribute() {},
          appendChild() {},
          style: {},
        };
      },
    };
    const stub = { replaceChildren() {} };
    const viz = new PreciseViz(stub);
    const frames = medianOfMediansSelect([1, 2, 3, 4, 5], 0);
    assert.equal(viz.render(frames[0]), true);
    delete globalThis.document;
  });
});
