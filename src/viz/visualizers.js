const NS = 'http://www.w3.org/2000/svg';

/**
 * @param {string} tag
 * @param {Record<string, string|number>} [attrs]
 */
function el(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

const COLORS = {
  base: '#3a4d6b',
  compare: '#f0b429',
  swap: '#ff9f43',
  sorted: '#3ddc97',
  pivot: '#a78bfa',
  range: 'rgba(91,141,239,0.18)',
  found: '#3ddc97',
  text: '#e8eef7',
  muted: '#7b8ba3',
  edge: '#2e4263',
  edgeActive: '#5b8def',
  edgeTree: '#3ddc97',
};

/**
 * Array bar visualizer (sorting + search).
 */
export class ArrayViz {
  constructor(root) {
    this.root = root;
  }

  /**
   * @param {import('../engine/types.js').Frame | null} frame
   * @param {{ array: number[], target?: number|null, title?: string }} state
   */
  render(frame, state) {
    const array = (frame && frame.array) || state.array;
    const sorted = new Set((frame && frame.sorted) || []);
    const indices = new Set((frame && frame.indices) || []);
    const pair = new Set((frame && frame.pair) || []);
    const range = frame && frame.range;
    const pivot = frame != null ? frame.pivot : undefined;
    const extra = (frame && frame.extra) || {};
    const target = extra.target ?? state.target;

    const w = 800;
    const h = 420;
    const padX = 36;
    const padBottom = 56;
    const padTop = 48;
    const n = array.length || 1;
    const gap = 8;
    const barW = Math.max(8, (w - padX * 2 - gap * (n - 1)) / n);
    const maxVal = Math.max(...array, 1);
    const usable = h - padTop - padBottom;

    const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img' });

    if (range) {
      const [lo, hi] = range;
      const x = padX + lo * (barW + gap) - 4;
      const ww = (hi - lo + 1) * (barW + gap) - gap + 8;
      svg.appendChild(
        el('rect', {
          x,
          y: padTop - 12,
          width: Math.max(ww, 0),
          height: usable + 20,
          rx: 8,
          fill: COLORS.range,
        }),
      );
    }

    array.forEach((val, i) => {
      const bh = Math.max(6, (val / maxVal) * usable);
      const x = padX + i * (barW + gap);
      const y = padTop + usable - bh;
      let fill = COLORS.base;
      if (sorted.has(i)) fill = COLORS.sorted;
      if (indices.has(i) || pair.has(i)) fill = frame?.type === 'swap' ? COLORS.swap : COLORS.compare;
      if (pivot === i) fill = COLORS.pivot;
      if (frame?.type === 'done') fill = COLORS.sorted;
      if (extra.found === i) fill = COLORS.found;

      const rect = el('rect', {
        class: 'bar',
        x,
        y,
        width: barW,
        height: bh,
        rx: 3,
        fill,
      });
      svg.appendChild(rect);

      const label = el('text', {
        class: 'bar-label',
        x: x + barW / 2,
        y: h - padBottom + 18,
        'text-anchor': 'middle',
        fill: indices.has(i) ? COLORS.compare : COLORS.muted,
      });
      label.textContent = String(val);
      svg.appendChild(label);

      const idx = el('text', {
        x: x + barW / 2,
        y: h - padBottom + 36,
        'text-anchor': 'middle',
        fill: COLORS.muted,
        'font-family': 'IBM Plex Mono, monospace',
        'font-size': 10,
      });
      idx.textContent = String(i);
      svg.appendChild(idx);
    });

    if (target != null) {
      const t = el('text', {
        x: padX,
        y: 24,
        fill: COLORS.compare,
        'font-family': 'IBM Plex Mono, monospace',
        'font-size': 13,
      });
      t.textContent = `target = ${target}`;
      svg.appendChild(t);
    }

    if (frame?.message) {
      const msg = el('text', {
        class: 'msg-box',
        x: padX,
        y: h - 14,
        fill: COLORS.muted,
      });
      msg.textContent = frame.message;
      svg.appendChild(msg);
    }

    this.root.replaceChildren(svg);
  }

  legend() {
    return [
      ['base', COLORS.base],
      ['compare', COLORS.compare],
      ['swap', COLORS.swap],
      ['sorted', COLORS.sorted],
      ['pivot', COLORS.pivot],
    ];
  }
}

/**
 * Graph visualizer.
 */
export class GraphViz {
  constructor(root) {
    this.root = root;
  }

  /**
   * @param {import('../engine/types.js').Frame | null} frame
   * @param {{ graph: any }} state
   */
  render(frame, state) {
    const graph = state.graph;
    const extra = (frame && frame.extra) || {};
    const visited = new Set(extra.visited || []);
    const indices = new Set((frame && frame.indices) || []);
    const tree = new Set((extra.tree || []).map((e) => edgeKey(e[0], e[1])));
    const dist = extra.dist;

    const w = 800;
    const h = 420;
    const svg = el('svg', { viewBox: `0 0 ${w} ${h}` });
    const pos = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));

    for (const e of graph.edges) {
      const a = pos[e.u];
      const b = pos[e.v];
      if (!a || !b) continue;
      const active =
        tree.has(edgeKey(e.u, e.v)) ||
        (indices.has(e.u) && indices.has(e.v));
      const line = el('line', {
        class: 'edge-line',
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        stroke: active ? COLORS.edgeTree : COLORS.edge,
        'stroke-width': active ? 3 : 2,
        'stroke-linecap': 'round',
      });
      svg.appendChild(line);

      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const wl = el('text', {
        x: mx,
        y: my - 6,
        'text-anchor': 'middle',
        fill: COLORS.muted,
        'font-family': 'IBM Plex Mono, monospace',
        'font-size': 11,
      });
      wl.textContent = String(e.w);
      svg.appendChild(wl);
    }

    for (const n of graph.nodes) {
      const isVisited = visited.has(n.id);
      const isActive = indices.has(n.id);
      let fill = '#1a2740';
      if (isVisited) fill = '#1d4d3a';
      if (isActive) fill = COLORS.compare;
      if (frame?.type === 'done' && isVisited) fill = '#1d4d3a';

      const c = el('circle', {
        class: 'node-circle',
        cx: n.x,
        cy: n.y,
        r: 22,
        fill,
        stroke: isActive ? COLORS.compare : isVisited ? COLORS.sorted : COLORS.edge,
        'stroke-width': 2,
      });
      svg.appendChild(c);

      const label = el('text', {
        class: 'node-label',
        x: n.x,
        y: n.y,
        fill: isActive ? '#0b1220' : COLORS.text,
        'font-weight': 600,
      });
      label.textContent = n.label;
      svg.appendChild(label);

      if (dist && dist[n.id] !== undefined) {
        const d = el('text', {
          x: n.x,
          y: n.y + 36,
          'text-anchor': 'middle',
          fill: COLORS.muted,
          'font-family': 'IBM Plex Mono, monospace',
          'font-size': 11,
        });
        d.textContent = `d=${dist[n.id]}`;
        svg.appendChild(d);
      }
    }

    if (frame?.message) {
      const msg = el('text', {
        class: 'msg-box',
        x: 24,
        y: h - 16,
        fill: COLORS.muted,
      });
      msg.textContent = frame.message;
      svg.appendChild(msg);
    }

    this.root.replaceChildren(svg);
  }

  legend() {
    return [
      ['unvisited', COLORS.edge],
      ['frontier / active', COLORS.compare],
      ['visited / tree', COLORS.sorted],
    ];
  }
}

/**
 * DP matrix / 1d table visualizer.
 */
export class MatrixViz {
  constructor(root) {
    this.root = root;
  }

  /**
   * @param {import('../engine/types.js').Frame | null} frame
   * @param {object} _state
   */
  render(frame, _state) {
    const extra = (frame && frame.extra) || null;
    const w = 800;
    const h = 420;
    const svg = el('svg', { viewBox: `0 0 ${w} ${h}` });

    if (!extra || !extra.kind) {
      const t = el('text', {
        x: 40,
        y: 40,
        fill: COLORS.muted,
        'font-family': 'IBM Plex Mono, monospace',
        'font-size': 14,
      });
      t.textContent = 'Run a DP algorithm (set dp fib|coin|lcs|knapsack · run)';
      svg.appendChild(t);
      this.root.replaceChildren(svg);
      return;
    }

    const title = el('text', {
      x: 28,
      y: 36,
      fill: COLORS.muted,
      'font-family': 'IBM Plex Mono, monospace',
      'font-size': 13,
    });
    title.textContent = extra.title || '';
    svg.appendChild(title);

    // dp1d active: number[] | [i][] ; dp2d active: [i,j][]
    const rawActive = extra.active || [];
    const activePairs = new Set(
      rawActive
        .map((a) => (Array.isArray(a) ? a : [a, undefined]))
        .map(([i, j]) => (j === undefined ? `${i}` : `${i},${j}`)),
    );
    const activeSet = activePairs;
    const write = extra.write != null
      ? Array.isArray(extra.write)
        ? `${extra.write[0]},${extra.write[1]}`
        : String(extra.write)
      : null;

    if (extra.kind === 'dp1d') {
      const cells = extra.cells;
      const n = cells.length;
      const cellW = Math.min(52, (w - 56) / n);
      const cellH = 56;
      const x0 = 28;
      const y0 = 150;
      cells.forEach((val, i) => {
        const x = x0 + i * cellW;
        let fill = '#1a2740';
        const isActive = activeSet.has(String(i)) || activeSet.has(`0,${i}`);
        if (isActive) fill = COLORS.compare;
        if (write === String(i)) fill = COLORS.swap;
        svg.appendChild(
          el('rect', {
            class: 'cell',
            x: x + 2,
            y: y0,
            width: cellW - 4,
            height: cellH,
            rx: 4,
            fill,
            stroke: COLORS.edge,
          }),
        );
        const t = el('text', {
          class: 'cell-text',
          x: x + cellW / 2,
          y: y0 + cellH / 2,
          fill: isActive || write === String(i) ? '#0b1220' : COLORS.text,
        });
        t.textContent = val === '' ? '·' : val;
        svg.appendChild(t);

        const lab = el('text', {
          x: x + cellW / 2,
          y: y0 + cellH + 18,
          'text-anchor': 'middle',
          fill: COLORS.muted,
          'font-family': 'IBM Plex Mono, monospace',
          'font-size': 10,
        });
        lab.textContent = extra.labels?.[i] ?? String(i);
        svg.appendChild(lab);
      });
    } else if (extra.kind === 'dp2d') {
      const rows = extra.rows;
      const cols = extra.cols;
      const cellW = Math.min(40, (w - 100) / (cols.length || 1));
      const cellH = Math.min(34, (h - 160) / (rows.length || 1));
      const x0 = 80;
      const y0 = 88;

      cols.forEach((c, j) => {
        const t = el('text', {
          x: x0 + j * cellW + cellW / 2,
          y: y0 - 12,
          'text-anchor': 'middle',
          fill: COLORS.muted,
          'font-family': 'IBM Plex Mono, monospace',
          'font-size': 10,
        });
        t.textContent = c;
        svg.appendChild(t);
      });

      rows.forEach((r, i) => {
        const t = el('text', {
          x: x0 - 10,
          y: y0 + i * cellH + cellH / 2,
          'text-anchor': 'end',
          'dominant-baseline': 'central',
          fill: COLORS.muted,
          'font-family': 'IBM Plex Mono, monospace',
          'font-size': 10,
        });
        t.textContent = r;
        svg.appendChild(t);

        cols.forEach((_, j) => {
          const val = extra.cells[i][j];
          const key = `${i},${j}`;
          let fill = '#1a2740';
          if (activeSet.has(key)) fill = COLORS.compare;
          if (write === key) fill = COLORS.swap;
          svg.appendChild(
            el('rect', {
              class: 'cell',
              x: x0 + j * cellW + 1,
              y: y0 + i * cellH + 1,
              width: cellW - 2,
              height: cellH - 2,
              rx: 2,
              fill,
              stroke: COLORS.edge,
            }),
          );
          const ct = el('text', {
            class: 'cell-text',
            x: x0 + j * cellW + cellW / 2,
            y: y0 + i * cellH + cellH / 2,
            fill: activeSet.has(key) || write === key ? '#0b1220' : COLORS.text,
            'font-size': 11,
          });
          ct.textContent = val;
          svg.appendChild(ct);
        });
      });
    }

    if (frame?.message) {
      const msg = el('text', {
        class: 'msg-box',
        x: 28,
        y: h - 18,
        fill: COLORS.muted,
      });
      msg.textContent = frame.message;
      svg.appendChild(msg);
    }

    this.root.replaceChildren(svg);
  }

  legend() {
    return [
      ['cell', '#1a2740'],
      ['active deps', COLORS.compare],
      ['write', COLORS.swap],
    ];
  }
}

function edgeKey(u, v) {
  return u < v ? `${u}-${v}` : `${v}-${u}`;
}
