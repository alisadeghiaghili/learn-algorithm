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
 * Multi-kind visualizer dispatcher for advanced extras.
 */
export class ExtraViz {
  constructor(root) {
    this.root = root;
  }

  /**
   * @param {any} frame
   * @param {any} state
   * @returns {boolean} true if handled
   */
  render(frame, state) {
    const extra = frame?.extra || state.meta?.viz || null;
    const kind = extra?.kind;
    if (!kind) return false;
    switch (kind) {
      case 'tree':
        this.tree(extra, frame);
        return true;
      case 'heap':
        this.heap(extra, frame);
        return true;
      case 'hash':
        this.hash(extra, frame);
        return true;
      case 'uf':
        this.uf(extra, frame);
        return true;
      case 'flow':
        this.flow(extra, frame);
        return true;
      case 'string':
        this.string(extra, frame);
        return true;
      case 'timeline':
        this.timeline(extra, frame);
        return true;
      case 'huffman':
        this.huffman(extra, frame);
        return true;
      case 'points':
        this.points(extra, frame);
        return true;
      case 'master':
        this.master(extra, frame);
        return true;
      case 'np':
        this.np(extra, frame);
        return true;
      case 'count':
        this.count(extra, frame);
        return true;
      case 'buckets':
        this.buckets(extra, frame);
        return true;
      case 'bf':
        this.bf(extra, frame);
        return true;
      case 'fw':
        this.fw(extra, frame);
        return true;
      case 'topo':
        this.topo(extra, frame);
        return true;
      case 'scc':
        this.scc(extra, frame);
        return true;
      case 'sarray':
        this.sarray(extra, frame);
        return true;
      case 'freivalds':
        this.freivalds(extra, frame);
        return true;
      case 'npbuild':
        this.npbuild(extra, frame);
        return true;
      case 'proof':
        this.proof(extra, frame);
        return true;
      case 'mom':
        this.mom(extra, frame);
        return true;
      case 'poly':
        this.poly(extra, frame);
        return true;
      case 'matroid':
        this.matroid(extra, frame);
        return true;
      case 'vc':
        this.vc(extra, frame);
        return true;
      case 'rb':
        this.rb(extra, frame);
        return true;
      case 'stree':
        this.stree(extra, frame);
        return true;
      case 'gadget':
        this.gadget(extra, frame);
        return true;
      default:
        return false;
    }
  }

  legend() {
    return [
      ['active', C.compare],
      ['settled', C.sorted],
      ['structure', C.edge],
    ];
  }

  mount(svg) {
    this.root.replaceChildren(svg);
  }

  baseSvg() {
    return el('svg', { viewBox: '0 0 800 420' });
  }

  msg(svg, frame) {
    if (!frame?.message) return;
    const t = el('text', { x: 24, y: 400, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 12 });
    t.textContent = frame.message;
    svg.appendChild(t);
  }

  tree(extra, frame) {
    const svg = this.baseSvg();
    const tree = extra.tree;
    const highlight = extra.highlight;
    const path = new Set(extra.path || []);
    const pos = new Map();
    function place(node, x, y, spread) {
      if (!node) return;
      pos.set(node.key, { x, y, node });
      place(node.left, x - spread, y + 70, spread / 2);
      place(node.right, x + spread, y + 70, spread / 2);
    }
    place(tree, 400, 50, 160);
    for (const { x, y, node } of pos.values()) {
      for (const child of [node.left, node.right]) {
        if (!child) continue;
        const p = pos.get(child.key);
        svg.appendChild(el('line', { x1: x, y1: y, x2: p.x, y2: p.y, stroke: C.edge, 'stroke-width': 2 }));
      }
    }
    for (const { x, y, node } of pos.values()) {
      const onPath = path.has(node.key);
      const hl = highlight === node.key;
      svg.appendChild(
        el('circle', {
          cx: x,
          cy: y,
          r: 22,
          fill: hl ? C.compare : onPath ? '#1d4d3a' : C.cell,
          stroke: hl ? C.compare : onPath ? C.sorted : C.edge,
          'stroke-width': 2,
        }),
      );
      const t = el('text', {
        x,
        y,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: hl ? '#0b1220' : C.text,
        'font-family': 'IBM Plex Mono, monospace',
        'font-size': 13,
        'font-weight': 600,
      });
      t.textContent = String(node.key);
      svg.appendChild(t);
    }
    if (!tree) {
      const t = el('text', { x: 400, y: 200, 'text-anchor': 'middle', fill: C.muted, 'font-family': 'IBM Plex Mono, monospace' });
      t.textContent = 'empty tree';
      svg.appendChild(t);
    }
    this.msg(svg, frame);
    this.mount(svg);
  }

  heap(extra, frame) {
    const svg = this.baseSvg();
    const heap = extra.heap || [];
    const active = new Set(extra.active || []);
    const n = heap.length;
    const pos = [];
    heap.forEach((val, i) => {
      const depth = Math.floor(Math.log2(i + 1));
      const levelStart = 2 ** depth - 1;
      const levelCount = 2 ** depth;
      const idxInLevel = i - levelStart;
      const x = ((idxInLevel + 1) / (levelCount + 1)) * 760 + 20;
      const y = 60 + depth * 70;
      pos.push({ x, y, i, val });
    });
    for (let i = 0; i < n; i += 1) {
      for (const c of [2 * i + 1, 2 * i + 2]) {
        if (c >= n) break;
        svg.appendChild(el('line', {
          x1: pos[i].x, y1: pos[i].y, x2: pos[c].x, y2: pos[c].y, stroke: C.edge, 'stroke-width': 2,
        }));
      }
    }
    pos.forEach(({ x, y, i, val }) => {
      const on = active.has(i);
      svg.appendChild(el('circle', {
        cx: x, cy: y, r: 22,
        fill: on ? C.compare : C.cell,
        stroke: on ? C.compare : C.edge,
        'stroke-width': 2,
      }));
      const t = el('text', {
        x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: on ? '#0b1220' : C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
      });
      t.textContent = String(val);
      svg.appendChild(t);
      const idx = el('text', {
        x, y: y + 34, 'text-anchor': 'middle', fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 10,
      });
      idx.textContent = String(i);
      svg.appendChild(idx);
    });
    this.msg(svg, frame);
    this.mount(svg);
  }

  hash(extra, frame) {
    const svg = this.baseSvg();
    const table = extra.table || [];
    const probes = new Set(extra.probes || []);
    const m = table.length || 1;
    const cellW = Math.min(56, 760 / m);
    const y = 160;
    table.forEach((val, i) => {
      const x = 20 + i * cellW;
      const on = probes.has(i);
      svg.appendChild(el('rect', {
        x: x + 2, y, width: cellW - 4, height: 48, rx: 4,
        fill: on ? C.compare : C.cell, stroke: C.edge,
      }));
      const t = el('text', {
        x: x + cellW / 2, y: y + 24, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: on ? '#0b1220' : C.text, 'font-family': 'IBM Plex Mono, monospace',
      });
      t.textContent = val == null ? '·' : String(val);
      svg.appendChild(t);
      const lab = el('text', {
        x: x + cellW / 2, y: y + 64, 'text-anchor': 'middle', fill: C.muted,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 10,
      });
      lab.textContent = String(i);
      svg.appendChild(lab);
    });
    this.msg(svg, frame);
    this.mount(svg);
  }

  uf(extra, frame) {
    const svg = this.baseSvg();
    const edges = extra.edges || [];
    const comps = extra.comps || [];
    const ids = new Set();
    for (const [a, b] of edges) {
      ids.add(a);
      ids.add(b);
    }
    for (const c of comps) ids.add(c);
    const list = [...ids];
    const pos = new Map();
    list.forEach((id, i) => {
      const angle = (i / Math.max(1, list.length)) * Math.PI * 2;
      pos.set(id, {
        x: 400 + 140 * Math.cos(angle),
        y: 190 + 120 * Math.sin(angle),
      });
    });
    for (const [a, b] of edges) {
      const pa = pos.get(a);
      const pb = pos.get(b);
      if (!pa || !pb) continue;
      svg.appendChild(el('line', { x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y, stroke: C.link, 'stroke-width': 2 }));
    }
    for (const id of list) {
      const p = pos.get(id);
      svg.appendChild(el('circle', { cx: p.x, cy: p.y, r: 22, fill: C.cell, stroke: C.edge, 'stroke-width': 2 }));
      const t = el('text', {
        x: p.x, y: p.y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
      });
      t.textContent = String(id);
      svg.appendChild(t);
    }
    if (!list.length) {
      const t = el('text', { x: 400, y: 190, 'text-anchor': 'middle', fill: C.muted, 'font-family': 'IBM Plex Mono, monospace' });
      t.textContent = 'UF forest — try `uf u a b` ops via set ds uf · run';
      svg.appendChild(t);
    }
    this.msg(svg, frame);
    this.mount(svg);
  }

  flow(extra, frame) {
    const svg = this.baseSvg();
    const nodes = extra.nodes || [];
    const flow = extra.flow || [];
    const cap = extra.cap || [];
    const path = extra.path || [];
    const pathSet = new Set(path.map(([u, v]) => `${u}-${v}`));
    const cut = extra.cut;
    for (let u = 0; u < nodes.length; u += 1) {
      for (let v = 0; v < nodes.length; v += 1) {
        if (!cap[u] || !cap[u][v]) continue;
        const a = nodes[u];
        const b = nodes[v];
        const on = pathSet.has(`${u}-${v}`) || pathSet.has(`${v}-${u}`);
        const x1 = a.x;
        const y1 = a.y;
        const x2 = b.x;
        const y2 = b.y;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        svg.appendChild(el('line', {
          x1: x1 + ux * 22, y1: y1 + uy * 22,
          x2: x2 - ux * 22, y2: y2 - uy * 22,
          stroke: on ? C.compare : C.edge,
          'stroke-width': on ? 3 : 2,
          'marker-end': 'url(#arrow)',
        }));
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const lbl = el('text', {
          x: mx, y: my - 8, 'text-anchor': 'middle', fill: C.muted,
          'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
        });
        lbl.textContent = `${flow[u]?.[v] ?? 0}/${cap[u][v]}`;
        svg.appendChild(lbl);
      }
    }
    const defs = el('defs');
    const marker = el('marker', {
      id: 'arrow', viewBox: '0 0 10 10', refX: 8, refY: 5,
      markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse',
    });
    marker.appendChild(el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: C.muted }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    for (const n of nodes) {
      const inS = cut ? cut[n.id] : true;
      let fill = C.cell;
      if (n.id === extra.source) fill = C.sorted;
      if (n.id === extra.sink) fill = C.pivot;
      svg.appendChild(el('circle', {
        cx: n.x, cy: n.y, r: 22,
        fill,
        stroke: inS ? C.link : C.alert,
        'stroke-width': 3,
      }));
      const t = el('text', {
        x: n.x, y: n.y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13, 'font-weight': 600,
      });
      t.textContent = n.label;
      svg.appendChild(t);
    }
    this.msg(svg, frame);
    this.mount(svg);
  }

  string(extra, frame) {
    const svg = this.baseSvg();
    const text = extra.text || '';
    const pat = extra.pat || '';
    const i = extra.i ?? 0;
    const j = extra.j ?? 0;
    const match = extra.match;
    const drawRow = (s, y, offset, hlFrom, hlTo, dim) => {
      const cellW = 28;
      s.split('').forEach((ch, idx) => {
        const x = 40 + (idx + (offset || 0)) * cellW;
        const inHl = hlFrom != null && idx >= hlFrom && idx <= hlTo;
        svg.appendChild(el('rect', {
          x: x + 2, y, width: cellW - 4, height: 36, rx: 3,
          fill: inHl ? (dim ? C.swap : C.compare) : C.cell,
          stroke: C.edge,
        }));
        const t = el('text', {
          x: x + cellW / 2, y: y + 18, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          fill: inHl ? '#0b1220' : C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 14,
        });
        t.textContent = ch;
        svg.appendChild(t);
      });
    };
    drawRow(text, 80, 0, match != null && match >= 0 ? match : i, match != null && match >= 0 ? match + pat.length - 1 : i + Math.max(0, pat.length - 1), false);
    drawRow(pat, 160, 0, 0, Math.max(0, j), true);
    const hint = el('text', {
      x: 40, y: 240, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 12,
    });
    hint.textContent = `i=${i}  j=${j}${extra.lps ? `  lps=[${extra.lps.join(',')}]` : ''}`;
    svg.appendChild(hint);
    if (extra.win) {
      svg.appendChild(el('rect', {
        x: 40 + extra.win[0] * 28, y: 70,
        width: (extra.win[1] - extra.win[0] + 1) * 28, height: 50,
        fill: 'none', stroke: C.sorted, 'stroke-width': 2,
      }));
    }
    this.msg(svg, frame);
    this.mount(svg);
  }

  timeline(extra, frame) {
    const svg = this.baseSvg();
    const jobs = extra.jobs || [];
    const t0 = 0;
    const t1 = Math.max(10, ...jobs.map((j) => j.f));
    const x = (t) => 40 + (t / t1) * 720;
    jobs.forEach((j, idx) => {
      const y = 60 + idx * 36;
      svg.appendChild(el('line', {
        x1: x(j.s), y1: y + 10, x2: x(j.f), y2: y + 10,
        stroke: j.chosen ? C.sorted : C.edge,
        'stroke-width': j.chosen ? 6 : 4,
        'stroke-linecap': 'round',
      }));
      const t = el('text', {
        x: x(j.s) - 6, y: y + 14, 'text-anchor': 'end', fill: C.muted,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
      });
      t.textContent = `#${j.id}`;
      svg.appendChild(t);
    });
    this.msg(svg, frame);
    this.mount(svg);
  }

  huffman(extra, frame) {
    // reuse tree-like layout for forest roots
    this.tree({ tree: extra.forest?.[0] || extra.root || null }, frame);
  }

  points(extra, frame) {
    const svg = this.baseSvg();
    const pts = extra.points || [];
    const active = new Set(extra.active || []);
    const pair = extra.pair || [];
    const scale = 3.2;
    const ox = 80;
    const oy = 40;
    if (extra.splitX != null) {
      svg.appendChild(el('line', {
        x1: ox + extra.splitX * scale,
        y1: 20,
        x2: ox + extra.splitX * scale,
        y2: 380,
        stroke: C.link,
        'stroke-dasharray': '4 4',
      }));
    }
    if (pair.length === 2) {
      const a = pts[pair[0]];
      const b = pts[pair[1]];
      if (a && b) {
        svg.appendChild(el('line', {
          x1: ox + a.x * scale, y1: oy + a.y * scale,
          x2: ox + b.x * scale, y2: oy + b.y * scale,
          stroke: C.sorted, 'stroke-width': 2,
        }));
      }
    }
    pts.forEach((p) => {
      const on = active.has(p.id);
      svg.appendChild(el('circle', {
        cx: ox + p.x * scale, cy: oy + p.y * scale, r: 7,
        fill: on ? C.compare : C.link,
      }));
      const t = el('text', {
        x: ox + p.x * scale + 10, y: oy + p.y * scale,
        fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 10,
      });
      t.textContent = `(${p.x},${p.y})`;
      svg.appendChild(t);
    });
    this.msg(svg, frame);
    this.mount(svg);
  }

  master(extra, frame) {
    const svg = this.baseSvg();
    const lines = [
      `T(n) = ${extra.a} T(n/${extra.b}) + f(n)`,
      `log_b a = ${extra.crit?.toFixed(3)}`,
      `f class: ${extra.fKind} n^${extra.fPower}${extra.logPow ? ` (log n)^${extra.logPow}` : ''}`,
      extra.case ? `Master Theorem case ${extra.case}` : 'compare f(n) with n^{log_b a}',
      extra.result || '',
    ];
    lines.forEach((line, i) => {
      const t = el('text', {
        x: 60, y: 80 + i * 40, fill: i === 4 ? C.sorted : C.text,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 18,
      });
      t.textContent = line;
      svg.appendChild(t);
    });
    this.msg(svg, frame);
    this.mount(svg);
  }

  np(extra, frame) {
    const svg = this.baseSvg();
    const t0 = el('text', {
      x: 40, y: 50, fill: C.compare, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 16, 'font-weight': 600,
    });
    t0.textContent = extra.title || 'NP reduction';
    svg.appendChild(t0);
    const step = el('text', {
      x: 40, y: 110, fill: C.text, 'font-family': 'IBM Plex Sans, sans-serif', 'font-size': 15,
    });
    // wrap message
    const msg = (frame?.message || extra.html || '').replace(/^\d+\.\s*/, '');
    step.textContent = `Step ${extra.step}/${extra.total}:`;
    svg.appendChild(step);
    wrapText(svg, msg, 40, 145, 720, 22, C.text);
    this.mount(svg);
  }

  count(extra, frame) {
    const svg = this.baseSvg();
    const count = extra.count || [];
    count.forEach((v, i) => {
      const x = 40 + i * 48;
      svg.appendChild(el('rect', { x, y: 120, width: 40, height: 40, rx: 4, fill: C.cell, stroke: C.edge }));
      const t = el('text', {
        x: x + 20, y: 140, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: C.text, 'font-family': 'IBM Plex Mono, monospace',
      });
      t.textContent = String(v);
      svg.appendChild(t);
      const lab = el('text', {
        x: x + 20, y: 180, 'text-anchor': 'middle', fill: C.muted,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
      });
      lab.textContent = String(i);
      svg.appendChild(lab);
    });
    if (extra.out) {
      extra.out.forEach((v, i) => {
        const x = 40 + i * 48;
        svg.appendChild(el('rect', { x, y: 240, width: 40, height: 40, rx: 4, fill: C.sorted, stroke: C.edge }));
        const t = el('text', {
          x: x + 20, y: 260, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          fill: '#0b1220', 'font-family': 'IBM Plex Mono, monospace',
        });
        t.textContent = String(v);
        svg.appendChild(t);
      });
    }
    this.msg(svg, frame);
    this.mount(svg);
  }

  buckets(extra, frame) {
    const svg = this.baseSvg();
    const buckets = extra.buckets || [];
    buckets.forEach((b, i) => {
      const x = 40 + i * 60;
      svg.appendChild(el('rect', { x, y: 80, width: 50, height: 240, rx: 4, fill: C.cell, stroke: C.edge }));
      b.forEach((v, j) => {
        svg.appendChild(el('rect', { x: x + 8, y: 280 - (j + 1) * 28, width: 34, height: 24, rx: 2, fill: C.compare }));
        const t = el('text', {
          x: x + 25, y: 280 - j * 28 - 14, 'text-anchor': 'middle', fill: '#0b1220',
          'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
        });
        t.textContent = String(v);
        svg.appendChild(t);
      });
    });
    this.msg(svg, frame);
    this.mount(svg);
  }

  bf(extra, frame) {
    const svg = this.baseSvg();
    const dist = extra.dist || [];
    const round = extra.round ?? 0;
    const t0 = el('text', {
      x: 28, y: 36, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
    });
    t0.textContent = `Bellman-Ford · round ${round} · dist[]`;
    svg.appendChild(t0);
    dist.forEach((d, i) => {
      const x = 40 + i * 70;
      svg.appendChild(el('rect', {
        x, y: 100, width: 60, height: 48, rx: 6,
        fill: extra.active?.includes(i) ? C.compare : C.cell,
        stroke: C.edge,
      }));
      const t = el('text', {
        x: x + 30, y: 124, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: extra.active?.includes(i) ? '#0b1220' : C.text,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 14,
      });
      t.textContent = String(d);
      svg.appendChild(t);
      const lab = el('text', {
        x: x + 30, y: 168, 'text-anchor': 'middle', fill: C.muted,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
      });
      lab.textContent = `v${i}`;
      svg.appendChild(lab);
    });
    if (extra.neg) {
      const w = el('text', { x: 28, y: 240, fill: C.alert, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 14 });
      w.textContent = 'negative-weight cycle';
      svg.appendChild(w);
    }
    this.msg(svg, frame);
    this.mount(svg);
  }

  fw(extra, frame) {
    const svg = this.baseSvg();
    const dist = extra.dist || [];
    const n = extra.n || dist.length;
    const cell = Math.min(48, 700 / n);
    dist.forEach((row, i) => {
      row.forEach((v, j) => {
        const active = (extra.active || []).includes(i) || (extra.active || []).includes(j) || (extra.active || []).includes(extra.k);
        const x = 80 + j * cell;
        const y = 70 + i * cell;
        svg.appendChild(el('rect', {
          x, y, width: cell - 2, height: cell - 2,
          fill: active ? C.compare : C.cell, stroke: C.edge,
        }));
        const t = el('text', {
          x: x + cell / 2 - 1, y: y + cell / 2 - 1,
          'text-anchor': 'middle', 'dominant-baseline': 'central',
          fill: active ? '#0b1220' : C.text,
          'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
        });
        t.textContent = String(v);
        svg.appendChild(t);
      });
    });
    const k = el('text', {
      x: 28, y: 36, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
    });
    k.textContent = `Floyd-Warshall · intermediate k=${extra.k ?? '-'}`;
    svg.appendChild(k);
    this.msg(svg, frame);
    this.mount(svg);
  }

  topo(extra, frame) {
    const svg = this.baseSvg();
    const order = extra.order || [];
    const queue = extra.queue || [];
    const indeg = extra.indeg || [];
    indeg.forEach((d, i) => {
      const x = 40 + i * 90;
      svg.appendChild(el('circle', {
        cx: x + 30, cy: 120, r: 24,
        fill: (extra.done || []).includes(i) ? C.sorted : queue.includes(i) ? C.compare : C.cell,
        stroke: C.edge, 'stroke-width': 2,
      }));
      const t = el('text', {
        x: x + 30, y: 120, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: (extra.done || []).includes(i) || queue.includes(i) ? '#0b1220' : C.text,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
      });
      t.textContent = String(i);
      svg.appendChild(t);
      const lab = el('text', {
        x: x + 30, y: 165, 'text-anchor': 'middle', fill: C.muted,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
      });
      lab.textContent = `deg=${d}`;
      svg.appendChild(lab);
    });
    const o = el('text', {
      x: 28, y: 240, fill: C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
    });
    o.textContent = `order: ${order.join(' → ') || '—'}`;
    svg.appendChild(o);
    this.msg(svg, frame);
    this.mount(svg);
  }

  scc(extra, frame) {
    const svg = this.baseSvg();
    const comps = extra.comps || [];
    const t = el('text', {
      x: 28, y: 36, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
    });
    t.textContent = `Kosaraju · phase ${extra.phase ?? 1} · SCCs so far: ${comps.length}`;
    svg.appendChild(t);
    comps.forEach((comp, i) => {
      const y = 80 + i * 50;
      svg.appendChild(el('rect', {
        x: 40, y, width: 360, height: 40, rx: 8, fill: C.cell, stroke: C.link,
      }));
      const lab = el('text', {
        x: 56, y: y + 22, fill: C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
      });
      lab.textContent = `SCC ${i + 1}: {${comp.join(', ')}}`;
      svg.appendChild(lab);
    });
    this.msg(svg, frame);
    this.mount(svg);
  }

  sarray(extra, frame) {
    const svg = this.baseSvg();
    const text = extra.text || '';
    const sa = extra.sa || [];
    const rank = extra.rank || [];
    const t0 = el('text', {
      x: 28, y: 36, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
    });
    t0.textContent = `suffix array · width ${extra.k ?? 1}`;
    svg.appendChild(t0);
    text.split('').forEach((ch, i) => {
      svg.appendChild(el('rect', { x: 40 + i * 28, y: 70, width: 26, height: 32, rx: 3, fill: C.cell, stroke: C.edge }));
      const t = el('text', {
        x: 40 + i * 28 + 13, y: 86, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: C.text, 'font-family': 'IBM Plex Mono, monospace',
      });
      t.textContent = ch;
      svg.appendChild(t);
    });
    sa.forEach((idx, i) => {
      const y = 130 + i * 28;
      const t = el('text', {
        x: 40, y, fill: C.link, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
      });
      t.textContent = `[${idx}] rank=${rank[idx]}  ${text.slice(idx)}`;
      svg.appendChild(t);
    });
    this.msg(svg, frame);
    this.mount(svg);
  }

  freivalds(extra, frame) {
    const svg = this.baseSvg();
    const rows = [
      `r   = [${(extra.r || []).join(', ')}]`,
      `Br  = [${(extra.Br || []).join(', ')}]`,
      `A(Br)=[${(extra.ABr || []).join(', ')}]`,
      `Cr  = [${(extra.Cr || []).join(', ')}]`,
      extra.ok ? 'accept' : extra.phase === 'done' ? 'reject' : '…',
    ];
    rows.forEach((line, i) => {
      const t = el('text', {
        x: 60, y: 80 + i * 40,
        fill: i === 4 ? (extra.ok ? C.sorted : C.alert) : C.text,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 16,
      });
      t.textContent = line;
      svg.appendChild(t);
    });
    this.msg(svg, frame);
    this.mount(svg);
  }

  npbuild(extra, frame) {
    const svg = this.baseSvg();
    const nodes = extra.nodes || [];
    const edges = extra.edges || [];
    const groups = extra.clauses?.length || 1;
    nodes.forEach((n) => {
      const gi = n.group;
      const inside = nodes.filter((x) => x.group === gi);
      const idx = inside.indexOf(n);
      const x = 80 + gi * 120;
      const y = 80 + idx * 70;
      n._x = x;
      n._y = y;
    });
    for (const [i, j] of edges) {
      const a = nodes[i];
      const b = nodes[j];
      if (!a || !b) continue;
      svg.appendChild(el('line', {
        x1: a._x, y1: a._y, x2: b._x, y2: b._y, stroke: C.edge, 'stroke-width': 1.5,
      }));
    }
    nodes.forEach((n) => {
      svg.appendChild(el('circle', {
        cx: n._x, cy: n._y, r: 18,
        fill: n.lit.startsWith('!') ? '#3a2040' : C.cell,
        stroke: C.link, 'stroke-width': 2,
      }));
      const t = el('text', {
        x: n._x, y: n._y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
      });
      t.textContent = n.label;
      svg.appendChild(t);
    });
    const head = el('text', {
      x: 28, y: 36, fill: C.compare, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
    });
    head.textContent = `3-SAT → CLIQUE · k=${extra.k} · groups = clauses`;
    svg.appendChild(head);
    this.msg(svg, frame);
    this.mount(svg);
  }

  proof(extra, frame) {
    const svg = this.baseSvg();
    const t0 = el('text', {
      x: 40, y: 60, fill: C.compare, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 14,
    });
    t0.textContent = `proof drill ${extra.step ?? '—'}/${extra.total ?? '—'}${extra.bank ? ' · ' + extra.bank : ''}`;
    svg.appendChild(t0);
    wrapText(svg, (extra.prompt || frame?.message || '').replace(/^\d+\.\s*/, ''), 40, 110, 720, 24, C.text);
    if (extra.choices) {
      const keys = Object.keys(extra.choices);
      keys.forEach((k, i) => {
        const t = el('text', {
          x: 40, y: 220 + i * 28, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
        });
        t.textContent = `${k}) ${extra.choices[k]}`;
        svg.appendChild(t);
      });
    }
    const hint = el('text', {
      x: 40, y: 380, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 12,
    });
    hint.textContent = 'submit with `answer N <choice|fill>` or side-panel buttons';
    svg.appendChild(hint);
    this.mount(svg);
  }

  mom(extra, frame) {
    const svg = this.baseSvg();
    const groups = extra.groups || [];
    groups.forEach((g, i) => {
      const x = 40 + (i % 6) * 110;
      const y = 80 + Math.floor(i / 6) * 80;
      svg.appendChild(el('rect', {
        x, y, width: 100, height: 50, rx: 6,
        fill: extra.median != null ? C.cell : '#24324a',
        stroke: C.link, 'stroke-width': 2,
      }));
      const t = el('text', {
        x: x + 50, y: y + 25, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
      });
      t.textContent = `grp ${i + 1} [${g[0]}..${g[1]}]`;
      svg.appendChild(t);
    });
    const head = el('text', {
      x: 28, y: 36, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
    });
    head.textContent = `Median of Medians · pivot=${extra.median ?? '…'} · k=${extra.k ?? '-'}`;
    svg.appendChild(head);
    this.msg(svg, frame);
    this.mount(svg);
  }

  poly(extra, frame) {
    const svg = this.baseSvg();
    const rows = [
      `A = [${(extra.a || []).join(', ')}]`,
      `B = [${(extra.b || []).join(', ')}]`,
      `naive = [${(extra.naive || []).join(', ')}]`,
      extra.prod ? `FFT  = [${extra.prod.join(', ')}]` : `stage: ${extra.stage || ''}`,
    ];
    rows.forEach((line, i) => {
      const t = el('text', {
        x: 50, y: 80 + i * 36,
        fill: i === 2 || i === 3 ? C.sorted : C.text,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 15,
      });
      t.textContent = line;
      svg.appendChild(t);
    });
    const n = extra.n || 8;
    const layers = Math.log2(n);
    for (let layer = 0; layer < layers; layer += 1) {
      for (let i = 0; i < n; i += 1) {
        const x = 60 + i * 40;
        const y = 240 + layer * 40;
        const active = extra.layer === 2 ** (layer + 1) || extra.stage === 'fft';
        svg.appendChild(el('circle', {
          cx: x, cy: y, r: 8,
          fill: active ? C.compare : C.cell,
          stroke: C.edge,
        }));
      }
    }
    this.msg(svg, frame);
    this.mount(svg);
  }

  matroid(extra, frame) {
    const svg = this.baseSvg();
    const items = extra.items || [];
    items.forEach((it, i) => {
      const x = 40 + i * 80;
      svg.appendChild(el('rect', {
        x, y: 120, width: 60, height: 80, rx: 6,
        fill: it.chosen ? C.sorted : C.cell,
        stroke: it.chosen ? C.sorted : C.edge,
      }));
      const t = el('text', {
        x: x + 30, y: 160, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: it.chosen ? '#0b1220' : C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 14,
      });
      t.textContent = String(it.w);
      svg.appendChild(t);
      const lab = el('text', {
        x: x + 30, y: 220, 'text-anchor': 'middle', fill: C.muted,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 10,
      });
      lab.textContent = `#${it.id}${it.chosen ? ' ✓' : ''}`;
      svg.appendChild(lab);
    });
    const head = el('text', {
      x: 28, y: 36, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
    });
    head.textContent = `matroid greedy U_{${extra.k}} · chosen ${ (extra.chosen || []).length }`;
    svg.appendChild(head);
    this.msg(svg, frame);
    this.mount(svg);
  }

  vc(extra, frame) {
    const svg = this.baseSvg();
    const nodes = extra.nodes || [];
    const covered = new Set(extra.covered || []);
    const matching = extra.matching || [];
    const mset = new Set(matching.map(([u, v]) => `${u}-${v}`));
    for (const e of extra.edges || []) {
      const a = nodes[e.u];
      const b = nodes[e.v];
      const on = mset.has(`${e.u}-${e.v}`) || mset.has(`${e.v}-${e.u}`);
      svg.appendChild(el('line', {
        x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        stroke: on ? C.compare : C.edge, 'stroke-width': on ? 3 : 1.5,
      }));
    }
    for (const n of nodes) {
      svg.appendChild(el('circle', {
        cx: n.x, cy: n.y, r: 22,
        fill: covered.has(n.id) ? C.sorted : C.cell,
        stroke: C.link, 'stroke-width': 2,
      }));
      const t = el('text', {
        x: n.x, y: n.y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: covered.has(n.id) ? '#0b1220' : C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 12,
      });
      t.textContent = n.label;
      svg.appendChild(t);
    }
    this.msg(svg, frame);
    this.mount(svg);
  }

  rb(extra, frame) {
    const svg = this.baseSvg();
    const tree = extra.tree;
    const pos = new Map();
    function place(node, x, y, spread) {
      if (!node) return;
      pos.set(node.key, { x, y, node });
      place(node.l, x - spread, y + 70, spread / 2);
      place(node.r, x + spread, y + 70, spread / 2);
    }
    place(tree, 400, 50, 150);
    for (const { x, y, node } of pos.values()) {
      for (const child of [node.l, node.r]) {
        if (!child) continue;
        const p = pos.get(child.key);
        svg.appendChild(el('line', { x1: x, y1: y, x2: p.x, y2: p.y, stroke: C.edge, 'stroke-width': 2 }));
      }
    }
    for (const { x, y, node } of pos.values()) {
      const red = node.color === 'R';
      svg.appendChild(el('circle', {
        cx: x, cy: y, r: 22,
        fill: red ? '#5a2430' : '#0b1220',
        stroke: red ? C.alert : C.text,
        'stroke-width': 2,
      }));
      const t = el('text', {
        x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
      });
      t.textContent = `${node.key}`;
      svg.appendChild(t);
    }
    const head = el('text', {
      x: 28, y: 36, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 12,
    });
    head.textContent = `red-black CLRS insert-fixup · ${extra.case != null ? 'case ' + extra.case : 'insert'}`;
    svg.appendChild(head);
    this.msg(svg, frame);
    this.mount(svg);
  }

  stree(extra, frame) {
    const svg = this.baseSvg();
    const tree = extra.tree;
    const pos = new Map();
    function place(node, x, depth) {
      if (!node) return;
      const y = 50 + depth * 56;
      pos.set(node.id, { x, y, node });
      const kids = node.children || [];
      kids.forEach((c, i) => {
        place(c, x + (i - (kids.length - 1) / 2) * Math.max(48, 100 / (depth + 1)), depth + 1);
      });
    }
    place(tree, 400, 0);
    for (const { x, y, node } of pos.values()) {
      for (const c of node.children || []) {
        const p = pos.get(c.id);
        if (!p) continue;
        svg.appendChild(el('line', { x1: x, y1: y + 10, x2: p.x, y2: p.y - 10, stroke: C.edge }));
        const lab = el('text', {
          x: (x + p.x) / 2, y: (y + p.y) / 2,
          'text-anchor': 'middle', fill: C.link, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
        });
        lab.textContent = c.edge;
        svg.appendChild(lab);
      }
    }
    for (const { x, y } of pos.values()) {
      svg.appendChild(el('circle', { cx: x, cy: y, r: 8, fill: C.cell, stroke: C.link }));
    }
    const head = el('text', {
      x: 28, y: 36, fill: C.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 12,
    });
    head.textContent = `compacted suffix tree · pattern "${extra.pat || ''}" · edges = substrings`;
    svg.appendChild(head);
    this.msg(svg, frame);
    this.mount(svg);
  }

  gadget(extra, frame) {
    const svg = this.baseSvg();
    const inp = extra.input || [];
    const out = extra.output || [];
    const t0 = el('text', {
      x: 40, y: 50, fill: C.compare, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 14,
    });
    t0.textContent = `clause gadget · input (${inp.join(' ∨ ')})`;
    svg.appendChild(t0);
    out.forEach((c, i) => {
      const t = el('text', {
        x: 50, y: 100 + i * 36, fill: C.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 14,
      });
      t.textContent = `(${c.join(' ∨ ')})`;
      svg.appendChild(t);
    });
    this.msg(svg, frame);
    this.mount(svg);
  }
}

function wrapText(svg, text, x, y, maxW, lh, fill) {
  const words = text.split(/\s+/);
  let line = '';
  let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (test.length * 7.5 > maxW && line) {
      const t = el('text', { x, y: yy, fill, 'font-family': 'IBM Plex Sans, sans-serif', 'font-size': 14 });
      t.textContent = line;
      svg.appendChild(t);
      line = w;
      yy += lh;
    } else line = test;
  }
  if (line) {
    const t = el('text', { x, y: yy, fill, 'font-family': 'IBM Plex Sans, sans-serif', 'font-size': 14 });
    t.textContent = line;
    svg.appendChild(t);
  }
}
