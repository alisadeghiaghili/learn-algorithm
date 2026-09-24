/**
 * Extra NP gadgets: SAT→3SAT clause splitter, VC from vertex cover kernel notes.
 */

/**
 * Split a long OR-clause into 3-CNF with fresh variables (teaching construction).
 * @param {string[]} clause literals e.g. ['a','b','c','d']
 * @param {number} startIndex for fresh vars
 */
export function clauseTo3Cnf(clause, startIndex = 0) {
  const lits = clause.slice();
  const frames = [];
  frames.push({
    type: 'info',
    message: `split clause (${lits.join(' ∨ ')}) into 3-CNF`,
    extra: { kind: 'gadget', input: lits.slice(), output: [], fresh: startIndex },
  });

  if (lits.length <= 3) {
    while (lits.length < 3) lits.push(lits[lits.length - 1] || 'a');
    frames.push({
      type: 'done',
      message: `already size ≤3 · pad → (${lits.join(' ∨ ')})`,
      extra: { kind: 'gadget', input: clause.slice(), output: [lits.slice()], fresh: startIndex },
    });
    return frames;
  }

  /** @type {string[][]} */
  const out = [];
  let fresh = startIndex;
  // chain: (l1 ∨ l2 ∨ y1) ∧ (¬y1 ∨ l3 ∨ y2) ∧ …
  let y = `y${fresh++}`;
  out.push([lits[0], lits[1], y]);
  frames.push({
    type: 'set',
    message: `(${lits[0]} ∨ ${lits[1]} ∨ ${y})`,
    extra: { kind: 'gadget', input: lits.slice(), output: out.map((c) => c.slice()), fresh },
  });

  for (let i = 2; i < lits.length - 1; i += 1) {
    const ny = `y${fresh++}`;
    out.push([`!${y}`, lits[i], ny]);
    frames.push({
      type: 'set',
      message: `(¬${y} ∨ ${lits[i]} ∨ ${ny})`,
      extra: { kind: 'gadget', input: lits.slice(), output: out.map((c) => c.slice()), fresh },
    });
    y = ny;
  }
  out.push([`!${y}`, lits[lits.length - 2], lits[lits.length - 1]]);
  frames.push({
    type: 'set',
    message: `(¬${y} ∨ ${lits[lits.length - 2]} ∨ ${lits[lits.length - 1]})`,
    extra: { kind: 'gadget', input: lits.slice(), output: out.map((c) => c.slice()), fresh },
  });

  frames.push({
    type: 'done',
    message: `equivalent 3-CNF with fresh vars y${startIndex}…y${fresh - 1}`,
    extra: { kind: 'gadget', input: lits.slice(), output: out.map((c) => c.slice()), fresh },
  });
  return frames;
}

export const GADGETS = { clauseTo3Cnf };
