/**
 * Interactive NP gadget builder — student assembles a reduction.
 * Commands:
 *   gadget add-group C1:x C2:y   (or via playerMove)
 *   gadget link a b
 *   gadget k N
 *   gadget verify
 *
 * Educational model of 3-SAT → CLIQUE:
 * - groups = clauses, nodes = literals
 * - edges between non-contradictory literals of different groups
 * - k = #groups
 */

/**
 * @param {{ clauses: string[][] }} model
 */
export function cliquesFrom3sat(model) {
  const clauses = model.clauses || [];
  const frames = [];
  /** @type {{id:number,label:string,group:number,lit:string}[]} */
  const nodes = [];
  clauses.forEach((clause, g) => {
    clause.forEach((lit) => {
      nodes.push({ id: nodes.length, label: lit, group: g, lit });
    });
  });

  /** @type {[number, number][]} */
  const edges = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      if (a.group === b.group) continue;
      if (contradicts(a.lit, b.lit)) continue;
      edges.push([i, j]);
    }
  }

  frames.push({
    type: 'info',
    message: `3-SAT → CLIQUE · ${clauses.length} groups · |V|=${nodes.length} · k=${clauses.length}`,
    extra: {
      kind: 'npbuild',
      clauses,
      nodes,
      edges,
      k: clauses.length,
      phase: 'build',
    },
  });

  frames.push({
    type: 'set',
    message: `built ${edges.length} compatibility edges (skip contradictions + intra-group)`,
    extra: {
      kind: 'npbuild',
      clauses,
      nodes,
      edges,
      k: clauses.length,
      phase: 'edges',
    },
  });

  frames.push({
    type: 'done',
    message: `target k-clique with k=${clauses.length} · one node per group`,
    extra: {
      kind: 'npbuild',
      clauses,
      nodes,
      edges,
      k: clauses.length,
      phase: 'ready',
    },
  });
  return frames;
}

function contradicts(a, b) {
  const na = a.startsWith('!');
  const nb = b.startsWith('!');
  const pa = na ? a.slice(1) : a;
  const pb = nb ? b.slice(1) : b;
  return pa === pb && na !== nb;
}

/**
 * Proof-drill frames: student answers invariant ID / complexity.
 * @param {{ prompt: string, answer: string, why: string }[]} drills
 */
export function proofDrillNarrative(drills) {
  return drills.map((d, i) => ({
    type: i === drills.length - 1 ? 'done' : 'info',
    message: d.prompt,
    extra: {
      kind: 'proof',
      step: i + 1,
      total: drills.length,
      answer: d.answer,
      why: d.why,
    },
  }));
}

export const NP_BUILD = { cliquesFrom3sat, proofDrillNarrative };
