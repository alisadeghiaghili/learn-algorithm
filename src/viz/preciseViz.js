/**
 * Precise visualizers for MOM / proof writer / cleaner NP-build / graph layout helpers.
 * Mounted by ExtraViz for kind: mom2 | prooWrite | npbuild2 | tree2
 */

const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

const C = {
  base: '#3a4d6b',
  compare: '#f0b429',
  swap: '#ff9f43',
  sorted: '#3ddc97',
  pivot: '#a78bfa',
  text: '#e8eef7',
  muted: '#7b8ba3',
  edge: '#2e4263',
  link: '#5b8def',
  alert: '#ff6b6b',
  cell: '#1a2740',
};

/**
 * @param {HTMLElement} root
 */
export class PreciseViz {
  constructor(root) {
    this.root = root;
  }

  /**
   * @param {any} frame
   * @returns {boolean}
   */
  render(frame) {
    const extra = frame?.extra;
    if (!extra?.kind) return false;
    if (extra.kind === 'mom' || extra.kind === 'mom2') {
      this.mom(extra, frame);
      return true;
    }
    if (extra.kind === 'prooWrite' || extra.kind === 'proofWrite') {
      this.proofWrite(extra, frame);
      return true;
    }
    if (extra.kind === 'npbuild2') {
      this.npbuild2(extra, frame);
      return true;
    }
    return false;
  }

  legend() {
    return [
      ['group', C.link],
      ['median / pivot', C.pivot],
      ['active', C.compare],
      ['final', C.sorted],
    ];
  }

  mount(svg) {
    this.root.replaceChildren(svg);
  }

  base() {
    return el('svg', { viewBox: '0 0 800 420' });
  }

  msg(svg, frame) {
    if (!frame?.message) return;
    const t = el('text', {
      x: 20, y: 404, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
    });
    t.textContent = frame.message.slice(0, 110);
    svg.appendChild(t);
  }

  /** Precise MOM: bands for groups, medians highlighted, pivot locked, lo/hi window. */
  mom(extra, frame) {
    const svg = this.base();
    const arr = frame?.array || [];
    const n = arr.length || 1;
    const lo = extra.lo ?? 0;
    const hi = extra.hi ?? n - 1;
    const groups = extra.groups || [];
    const medIdx = new Set(extra.medIdx || []);
    const pivotVal = extra.pivot ?? extra.median;
    const found = extra.found;

    const pad = 28;
    const usableW = 800 - pad * 2;
    const barW = Math.max(6, usableW / n - 4);
    const maxVal = Math.max(...arr, 1);

    // window
    if (hi >= lo) {
      const x = pad + lo * (barW + 4) - 4;
      const w = (hi - lo + 1) * (barW + 4);
      svg.appendChild(el('rect', {
        x, y: 50, width: w, height: 220, rx: 8,
        fill: 'rgba(91,141,239,0.10)', stroke: C.link, 'stroke-width': 1.5,
      }));
    }

    // group bands
    groups.forEach((g, gi) => {
      const [gs, ge] = g;
      const x = pad + gs * (barW + 4) - 2;
      const w = (ge - gs + 1) * (barW + 4);
      svg.appendChild(el('rect', {
        x, y: 270, width: w, height: 18, rx: 3,
        fill: gi % 2 ? '#1c2a44' : '#24324a',
        stroke: C.edge,
      }));
      const t = el('text', {
        x: x + w / 2, y: 283, 'text-anchor': 'middle',
        fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 9,
      });
      t.textContent = `g${gi + 1}`;
      svg.appendChild(t);
    });

    arr.forEach((val, i) => {
      const bh = Math.max(4, (val / maxVal) * 180);
      const x = pad + i * (barW + 4);
      const y = 250 - bh;
      let fill = C.base;
      if (medIdx.has(i)) fill = C.pivot;
      if (pivotVal != null && val === pivotVal && extra.phase === 'pivot') fill = C.pivot;
      if (found === i) fill = C.sorted;
      if (i < lo || i > hi) fill = '#1a2233';
      svg.appendChild(el('rect', {
        x, y, width: barW, height: bh, rx: 2, fill,
      }));
      const lab = el('text', {
        x: x + barW / 2, y: 258, 'text-anchor': 'middle',
        fill: medIdx.has(i) ? C.pivot : C.muted,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 10,
      });
      lab.textContent = String(val);
      svg.appendChild(lab);
    });

    const head = el('text', {
      x: 20, y: 28, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
    });
    head.textContent =
      `MOM · phase=${extra.phase || '…'} · window[${lo}..${hi}] · k=${extra.k ?? '—'} · pivot=${pivotVal ?? '—'}`;
    svg.appendChild(head);

    const legend = el('text', {
      x: 20, y: 340, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
    });
    legend.textContent = 'bands = groups of 5 · purple = group medians · blue box = recurse window';
    svg.appendChild(legend);

    this.msg(svg, frame);
    this.mount(svg);
  }

  /** Precise proof writer: numbered fields with status chips. */
  proofWrite(extra, frame) {
    const svg = this.base();
    const fields = extra.fields || [];
    const status = extra.status || {};
    const head = el('text', {
      x: 24, y: 36, fill: C.compare, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 14, 'font-weight': 600,
    });
    head.textContent = extra.title || 'proof writer';
    svg.appendChild(head);

    fields.forEach((f, i) => {
      const y = 80 + i * 90;
      const st = status[f.id];
      const chip = st === true ? C.sorted : st === false ? C.alert : C.muted;
      svg.appendChild(el('rect', {
        x: 24, y: y - 18, width: 750, height: 78, rx: 8,
        fill: C.cell, stroke: chip, 'stroke-width': st === true || st === false ? 2 : 1,
      }));
      const lab = el('text', {
        x: 40, y: y + 8, fill: C.text, 'font-family': 'IBM Plex Sans, sans-serif', 'font-size': 14, 'font-weight': 500,
      });
      lab.textContent = `${i + 1}. ${f.label}`;
      svg.appendChild(lab);
      const hint = el('text', {
        x: 40, y: y + 32, fill: C.muted, 'font-family': 'IBM Plex Sans, sans-serif', 'font-size': 12,
      });
      hint.textContent = (f.hint || '').slice(0, 90);
      svg.appendChild(hint);
      const tag = el('text', {
        x: 740, y: y + 8, 'text-anchor': 'end', fill: chip,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 12,
      });
      tag.textContent = st === true ? 'OK' : st === false ? 'MISS' : 'TODO';
      svg.appendChild(tag);
    });

    this.msg(svg, frame);
    this.mount(svg);
  }

  /** Cleaner 2-column clique construction with non-crossing-ish layout. */
  npbuild2(extra, frame) {
    const svg = this.base();
    const nodes = extra.nodes || [];
    const edges = extra.edges || [];
    const clauses = extra.clauses || [];
    // grid: groups as columns
    nodes.forEach((n) => {
      const gi = n.group;
      const inside = nodes.filter((x) => x.group === gi);
      const idx = inside.indexOf(n);
      n._x = 80 + gi * 140;
      n._y = 90 + idx * 80;
    });
    // only draw edges between adjacent groups to reduce clutter
    for (const [i, j] of edges) {
      const a = nodes[i];
      const b = nodes[j];
      if (!a || !b) continue;
      if (Math.abs(a.group - b.group) !== 1) continue;
      svg.appendChild(el('line', {
        x1: a._x, y1: a._y, x2: b._x, y2: b._y,
        stroke: C.edge, 'stroke-width': 1.2,
        opacity: 0.7,
      }));
    }
    // faint far edges
    for (const [i, j] of edges) {
      const a = nodes[i];
      const b = nodes[j];
      if (!a || !b || Math.abs(a.group - b.group) === 1) continue;
      svg.appendChild(el('line', {
        x1: a._x, y1: a._y, x2: b._x, y2: b._y,
        stroke: C.edge, 'stroke-width': 0.6, opacity: 0.25,
      }));
    }
    nodes.forEach((n) => {
      const neg = n.lit.startsWith('!');
      svg.appendChild(el('circle', {
        cx: n._x, cy: n._y, r: 20,
        fill: neg ? '#3a2040' : C.cell,
        stroke: neg ? C.alert : C.link,
        'stroke-width': 2,
      }));
      const t = el('text', {
        x: n._x, y: n._y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
      });
      t.textContent = n.label;
      svg.appendChild(t);
    });
    clauses.forEach((c, i) => {
      const t = el('text', {
        x: 80 + i * 140, y: 50, 'text-anchor': 'middle',
        fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
      });
      t.textContent = `C${i + 1}: (${c.join('∨')})`;
      svg.appendChild(t);
    });
    const head = el('text', {
      x: 20, y: 28, fill: C.compare, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 12,
    });
    head.textContent = `3-SAT→CLIQUE · columns = clause groups · k=${extra.k} · strong = adjacent-group edges`;
    svg.appendChild(head);
    this.msg(svg, frame);
    this.mount(svg);
  }
}
