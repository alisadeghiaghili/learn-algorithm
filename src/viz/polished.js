/**
 * Upgrade ExtraViz tree/heap/hash/flow/graph drawings using shared draw.js helpers.
 * Also handled here: matroid, vc, timeline, freivalds with consistent chrome.
 */

import {
  svgRoot, el, drawTree, drawArrayBars, drawMatrix, drawGraphNodes,
  drawHead, drawMsg, PALETTE,
} from './draw.js';

/**
 * @param {any} extra
 * @param {any} frame
 * @param {string} kind
 * @returns {SVGElement|null}
 */
export function renderPolished(extra, frame, kind) {
  const svg = svgRoot();
  switch (kind) {
    case 'tree':
    case 'rb': {
      const tree = extra.tree;
      const highlight = extra.highlight ?? extra.last;
      const path = new Set(extra.path || []);
      drawTree(svg, tree, {
        colorFn: (n) => {
          if (n.color === 'R') return PALETTE.red;
          if (n.key === highlight) return PALETTE.compare;
          if (path.has(n.key)) return '#1d4d3a';
          return PALETTE.cell;
        },
        strokeFn: (n) => {
          if (n.color === 'R') return PALETTE.alert;
          if (n.key === highlight) return PALETTE.compare;
          return PALETTE.edge;
        },
      });
      drawHead(svg, extra.rotate
        ? `tree · ${extra.rotate} · case ${extra.case ?? ''}`
        : 'binary tree · highlight = last op');
      drawMsg(svg, frame?.message);
      return svg;
    }
    case 'heap': {
      const heap = extra.heap || [];
      const active = new Set(extra.active || []);
      heap.forEach((val, i) => {
        const depth = Math.floor(Math.log2(i + 1));
        const levelStart = 2 ** depth - 1;
        const idxInLevel = i - levelStart;
        const levelCount = 2 ** depth;
        const x = ((idxInLevel + 1) / (levelCount + 1)) * 740 + 30;
        const y = 70 + depth * 70;
        // store for edges
        heap[i] = val;
        active.add; // noop keep
      });
      // draw edges via parallel arrays
      const pos = heap.map((val, i) => {
        const depth = Math.floor(Math.log2(i + 1));
        const levelStart = 2 ** depth - 1;
        const idxInLevel = i - levelStart;
        const levelCount = 2 ** depth;
        return {
          x: ((idxInLevel + 1) / (levelCount + 1)) * 740 + 30,
          y: 70 + depth * 70,
          val,
          i,
        };
      });
      for (let i = 0; i < pos.length; i += 1) {
        for (const c of [2 * i + 1, 2 * i + 2]) {
          if (c >= pos.length) break;
          svg.appendChild(el('line', {
            x1: pos[i].x, y1: pos[i].y + 18, x2: pos[c].x, y2: pos[c].y - 18,
            stroke: PALETTE.edge, 'stroke-width': 1.5,
          }));
        }
      }
      pos.forEach(({ x, y, val, i }) => {
        const on = active.has(i);
        svg.appendChild(el('circle', {
          cx: x, cy: y, r: 20,
          fill: on ? PALETTE.compare : PALETTE.cell,
          stroke: on ? PALETTE.compare : PALETTE.edge, 'stroke-width': 2,
        }));
        const t = el('text', {
          x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          fill: on ? '#0b1220' : PALETTE.text,
          'font-family': 'IBM Plex Mono, monospace', 'font-size': 12,
        });
        t.textContent = String(val);
        svg.appendChild(t);
        const idx = el('text', {
          x, y: y + 32, 'text-anchor': 'middle', fill: PALETTE.muted,
          'font-family': 'IBM Plex Mono, monospace', 'font-size': 9,
        });
        idx.textContent = String(i);
        svg.appendChild(idx);
      });
      drawHead(svg, `max-heap · parent(i)=⌊(i-1)/2⌋ · active = last compare/swap`);
      drawMsg(svg, frame?.message);
      return svg;
    }
    case 'hash': {
      const table = extra.table || [];
      const probes = new Set(extra.probes || []);
      const m = table.length || 1;
      const cellW = Math.min(56, 740 / m);
      table.forEach((val, i) => {
        const x = 30 + i * cellW;
        const on = probes.has(i);
        svg.appendChild(el('rect', {
          x: x + 2, y: 150, width: cellW - 4, height: 52, rx: 4,
          fill: on ? PALETTE.compare : PALETTE.cell, stroke: PALETTE.edge,
        }));
        const t = el('text', {
          x: x + cellW / 2, y: 176, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          fill: on ? '#0b1220' : PALETTE.text,
          'font-family': 'IBM Plex Mono, monospace',
        });
        t.textContent = val == null ? '·' : String(val);
        svg.appendChild(t);
        const lab = el('text', {
          x: x + cellW / 2, y: 220, 'text-anchor': 'middle', fill: PALETTE.muted,
          'font-family': 'IBM Plex Mono, monospace', 'font-size': 10,
        });
        lab.textContent = String(i);
        svg.appendChild(lab);
      });
      drawHead(svg, `hash · linear probing · probe chain highlighted`);
      drawMsg(svg, frame?.message);
      return svg;
    }
    case 'flow': {
      const nodes = extra.nodes || [];
      const flow = extra.flow || [];
      const cap = extra.cap || [];
      const path = extra.path || [];
      const pathSet = new Set(path.map(([u, v]) => `${u}-${v}`));
      const cut = extra.cut;
      // edges first
      for (let u = 0; u < nodes.length; u += 1) {
        for (let v = 0; v < nodes.length; v += 1) {
          if (!cap[u] || !cap[u][v]) continue;
          const a = nodes[u];
          const b = nodes[v];
          const on = pathSet.has(`${u}-${v}`);
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          svg.appendChild(el('line', {
            x1: a.x + (dx / len) * 22, y1: a.y + (dy / len) * 22,
            x2: b.x - (dx / len) * 22, y2: b.y - (dy / len) * 22,
            stroke: on ? PALETTE.compare : PALETTE.edge,
            'stroke-width': on ? 3 : 1.5,
            'marker-end': 'url(#arr2)',
          }));
          const lab = el('text', {
            x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 8,
            'text-anchor': 'middle', fill: PALETTE.muted,
            'font-family': 'IBM Plex Mono, monospace', 'font-size': 11,
          });
          lab.textContent = `${flow[u]?.[v] ?? 0}/${cap[u][v]}`;
          svg.appendChild(lab);
        }
      }
      const defs = el('defs');
      const marker = el('marker', {
        id: 'arr2', viewBox: '0 0 10 10', refX: 8, refY: 5,
        markerWidth: 6, markerHeight: 6, orient: 'auto',
      });
      marker.appendChild(el('path', { d: 'M0 0 L10 5 L0 10 z', fill: PALETTE.muted }));
      defs.appendChild(marker);
      svg.appendChild(defs);
      drawGraphNodes(svg, nodes, {
        active: new Set(path.flat()),
        visited: new Set(nodes.filter((n) => cut && cut[n.id]).map((n) => n.id)),
      });
      // recolor s/t
      for (const n of nodes) {
        if (n.id === extra.source) {
          svg.appendChild(el('circle', { cx: n.x, cy: n.y, r: 22, fill: PALETTE.sorted, stroke: PALETTE.link, 'stroke-width': 2 }));
          const t = el('text', {
            x: n.x, y: n.y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
            fill: '#0b1220', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 12, 'font-weight': 600,
          });
          t.textContent = n.label;
          svg.appendChild(t);
        }
        if (n.id === extra.sink) {
          svg.appendChild(el('circle', { cx: n.x, cy: n.y, r: 22, fill: PALETTE.pivot, stroke: PALETTE.link, 'stroke-width': 2 }));
          const t = el('text', {
            x: n.x, y: n.y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
            fill: '#0b1220', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 12, 'font-weight': 600,
          });
          t.textContent = n.label;
          svg.appendChild(t);
        }
      }
      drawHead(svg, `flow · s=${extra.source} t=${extra.sink} · value=${extra.value ?? '…'}`);
      drawMsg(svg, frame?.message);
      return svg;
    }
    case 'matroid': {
      const items = extra.items || [];
      items.forEach((it, i) => {
        const x = 40 + i * 90;
        svg.appendChild(el('rect', {
          x, y: 120, width: 70, height: 90, rx: 8,
          fill: it.chosen ? PALETTE.sorted : PALETTE.cell,
          stroke: it.chosen ? PALETTE.sorted : PALETTE.edge, 'stroke-width': 2,
        }));
        const t = el('text', {
          x: x + 35, y: 165, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          fill: it.chosen ? '#0b1220' : PALETTE.text,
          'font-family': 'IBM Plex Mono, monospace', 'font-size': 18,
        });
        t.textContent = String(it.w);
        svg.appendChild(t);
      });
      drawHead(svg, `matroid U_{${extra.k}} · greedy by weight · chosen ${ (extra.chosen || []).length }/${extra.k}`);
      drawMsg(svg, frame?.message);
      return svg;
    }
    case 'vc': {
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
          stroke: on ? PALETTE.compare : PALETTE.edge,
          'stroke-width': on ? 3 : 1.5,
        }));
      }
      drawGraphNodes(svg, nodes, { covered, r: 22 });
      drawHead(svg, `vertex cover 2-approx · |cover|=${covered.size} · matching highlighted`);
      drawMsg(svg, frame?.message);
      return svg;
    }
    default:
      return null;
  }
}
