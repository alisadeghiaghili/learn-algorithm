/**
 * High-quality tree/heap/hash/flow/graph renderers used when extra.kind matches.
 * Shared draw helpers so every structure looks consistent and precise.
 */

const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

export const PALETTE = {
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
  red: '#5a2430',
};

/**
 * Layout a binary tree with stable x positions.
 */
export function layoutBinary(node, x = 400, y = 56, spread = 150, pos = new Map()) {
  if (!node) return pos;
  const key = node.key ?? node.label ?? node.id;
  pos.set(key, { x, y, node });
  const l = node.l ?? node.left;
  const r = node.r ?? node.right;
  layoutBinary(l, x - spread, y + 72, spread / 2, pos);
  layoutBinary(r, x + spread, y + 72, spread / 2, pos);
  return pos;
}

export function drawTree(svg, tree, opts = {}) {
  const {
    colorFn = () => PALETTE.cell,
    strokeFn = () => PALETTE.edge,
    labelFn = (n) => String(n.key ?? n.label ?? n.id),
    accentFn = () => false,
  } = opts;
  const pos = layoutBinary(tree);
  for (const { x, y, node } of pos.values()) {
    for (const child of [node.l ?? node.left, node.r ?? node.right]) {
      if (!child) continue;
      const k = child.key ?? child.label ?? child.id;
      const p = pos.get(k);
      if (!p) continue;
      svg.appendChild(el('line', {
        x1: x, y1: y + 18, x2: p.x, y2: p.y - 18,
        stroke: PALETTE.edge, 'stroke-width': 1.5,
      }));
    }
  }
  for (const { x, y, node } of pos.values()) {
    const accent = accentFn(node);
    svg.appendChild(el('circle', {
      cx: x, cy: y, r: 20,
      fill: colorFn(node),
      stroke: strokeFn(node),
      'stroke-width': accent ? 2.5 : 1.5,
    }));
    const t = el('text', {
      x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      fill: PALETTE.text, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 12,
    });
    t.textContent = labelFn(node);
    svg.appendChild(t);
  }
}

export function drawArrayBars(svg, arr, opts = {}) {
  const {
    highlight = new Set(),
    sorted = new Set(),
    pivot = null,
    range = null,
    labels = true,
    top = 250,
    height = 180,
  } = opts;
  const n = arr.length || 1;
  const pad = 28;
  const barW = Math.max(6, (800 - pad * 2) / n - 4);
  const maxVal = Math.max(...arr.map((v) => Math.abs(v)), 1);
  if (range) {
    const [lo, hi] = range;
    svg.appendChild(el('rect', {
      x: pad + lo * (barW + 4) - 4,
      y: 48,
      width: (hi - lo + 1) * (barW + 4),
      height: 230,
      rx: 8,
      fill: 'rgba(91,141,239,0.10)',
      stroke: PALETTE.link,
    }));
  }
  arr.forEach((val, i) => {
    const bh = Math.max(4, (Math.abs(val) / maxVal) * height);
    const x = pad + i * (barW + 4);
    const y = top - bh;
    let fill = PALETTE.base;
    if (sorted.has(i)) fill = PALETTE.sorted;
    if (highlight.has(i)) fill = PALETTE.compare;
    if (pivot === i) fill = PALETTE.pivot;
    svg.appendChild(el('rect', { x, y, width: barW, height: bh, rx: 2, fill }));
    if (labels) {
      const lab = el('text', {
        x: x + barW / 2, y: top + 14, 'text-anchor': 'middle',
        fill: highlight.has(i) ? PALETTE.compare : PALETTE.muted,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 10,
      });
      lab.textContent = String(val);
      svg.appendChild(lab);
    }
  });
}

export function drawMatrix(svg, cells, opts = {}) {
  const { rowLabels = [], colLabels = [], active = new Set(), write = null, x0 = 80, y0 = 80 } = opts;
  const rows = cells.length;
  const cols = cells[0]?.length || 0;
  const cellW = Math.min(40, 700 / Math.max(cols, 1));
  const cellH = Math.min(32, 280 / Math.max(rows, 1));
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      const key = `${i},${j}`;
      let fill = PALETTE.cell;
      if (active.has(key)) fill = PALETTE.compare;
      if (write === key) fill = PALETTE.swap;
      svg.appendChild(el('rect', {
        x: x0 + j * cellW, y: y0 + i * cellH,
        width: cellW - 1, height: cellH - 1, rx: 2,
        fill, stroke: PALETTE.edge,
      }));
      const t = el('text', {
        x: x0 + j * cellW + cellW / 2,
        y: y0 + i * cellH + cellH / 2,
        'text-anchor': 'middle', 'dominant-baseline': 'central',
        fill: active.has(key) || write === key ? '#0b1220' : PALETTE.text,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
      });
      t.textContent = String(cells[i][j]);
      svg.appendChild(t);
    }
    if (rowLabels[i] != null) {
      const lab = el('text', {
        x: x0 - 8, y: y0 + i * cellH + cellH / 2,
        'text-anchor': 'end', 'dominant-baseline': 'central',
        fill: PALETTE.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 10,
      });
      lab.textContent = String(rowLabels[i]);
      svg.appendChild(lab);
    }
  }
  for (let j = 0; j < cols; j += 1) {
    if (colLabels[j] == null) continue;
    const lab = el('text', {
      x: x0 + j * cellW + cellW / 2, y: y0 - 10,
      'text-anchor': 'middle',
      fill: PALETTE.muted, 'font-family': 'IBM Plex Mono, monospace', 'font-size': 10,
    });
    lab.textContent = String(colLabels[j]);
    svg.appendChild(lab);
  }
}

export function drawGraphNodes(svg, nodes, opts = {}) {
  const {
    visited = new Set(),
    active = new Set(),
    covered = new Set(),
    r = 22,
  } = opts;
  for (const n of nodes) {
    let fill = PALETTE.cell;
    if (covered.has(n.id) || visited.has(n.id)) fill = '#1d4d3a';
    if (active.has(n.id)) fill = PALETTE.compare;
    svg.appendChild(el('circle', {
      cx: n.x, cy: n.y, r,
      fill,
      stroke: active.has(n.id) ? PALETTE.compare : visited.has(n.id) ? PALETTE.sorted : PALETTE.link,
      'stroke-width': 2,
    }));
    const t = el('text', {
      x: n.x, y: n.y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      fill: active.has(n.id) ? '#0b1220' : PALETTE.text,
      'font-family': 'IBM Plex Mono, monospace', 'font-size': 12, 'font-weight': 600,
    });
    t.textContent = n.label;
    svg.appendChild(t);
  }
}

export function drawHead(svg, text, y = 32) {
  const t = el('text', {
    x: 20, y, fill: PALETTE.muted,
    'font-family': 'IBM Plex Mono, monospace', 'font-size': 13,
  });
  t.textContent = text;
  svg.appendChild(t);
}

export function drawMsg(svg, text, y = 404) {
  if (!text) return;
  const t = el('text', {
    x: 20, y, fill: PALETTE.muted,
    'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
  });
  t.textContent = String(text).slice(0, 120);
  svg.appendChild(t);
}

export function svgRoot() {
  return el('svg', { viewBox: '0 0 800 420' });
}

export { el };
