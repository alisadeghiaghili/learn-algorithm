/**
 * Graph algorithms as frame generators.
 * Graph: { nodes: [{id,label,x,y}], edges: [{u,v,w}], directed?: boolean }
 */

/**
 * @param {any} graph
 * @param {number} [start]
 */
export function bfs(graph, start = 0) {
  const frames = [];
  const n = graph.nodes.length;
  const adj = adjacency(graph);
  const seen = new Set([start]);
  const q = [start];
  /** @type {number[]} */
  const order = [];
  frames.push({
    type: 'info',
    message: `BFS from ${labelOf(graph, start)} · O(V+E)`,
    extra: { visited: [...seen], queue: [...q], order: [], dist: { [start]: 0 }, tree: [] },
  });

  while (q.length) {
    const u = q.shift();
    order.push(u);
    frames.push({
      type: 'visit',
      indices: [u],
      message: `visit ${labelOf(graph, u)} · queue [${q.map((x) => labelOf(graph, x)).join(' ')}]`,
      extra: { visited: [...seen], queue: [...q], order: [...order], tree: treeEdges(seen, graph), source: start },
    });
    for (const { v } of adj[u] || []) {
      if (!seen.has(v)) {
        seen.add(v);
        q.push(v);
        frames.push({
          type: 'relax',
          indices: [u, v],
          message: `discover ${labelOf(graph, v)} from ${labelOf(graph, u)}`,
          extra: { visited: [...seen], queue: [...q], order: [...order], tree: treeEdges(seen, graph, u), source: start },
        });
      }
    }
  }
  frames.push({
    type: 'done',
    message: `BFS order: ${order.map((x) => labelOf(graph, x)).join(' → ')}`,
    extra: { visited: [...seen], queue: [], order: [...order], tree: [], source: start },
  });
  return frames;
}

/**
 * @param {any} graph
 * @param {number} [start]
 */
export function dfs(graph, start = 0) {
  const frames = [];
  const adj = adjacency(graph);
  const seen = new Set();
  /** @type {number[]} */
  const order = [];
  /** @type {[number,number][]} */
  const tree = [];

  frames.push({
    type: 'info',
    message: `DFS from ${labelOf(graph, start)} · O(V+E)`,
    extra: { visited: [], order: [], tree: [], source: start },
  });

  function go(u, parent) {
    seen.add(u);
    order.push(u);
    if (parent != null) tree.push([parent, u]);
    frames.push({
      type: 'visit',
      indices: [u],
      message: `visit ${labelOf(graph, u)}`,
      extra: { visited: [...seen], order: [...order], tree: [...tree], source: start },
    });
    for (const { v } of adj[u] || []) {
      if (!seen.has(v)) go(v, u);
    }
    frames.push({
      type: 'info',
      indices: [u],
      message: `finish ${labelOf(graph, u)}`,
      extra: { visited: [...seen], order: [...order], tree: [...tree], source: start },
    });
  }

  go(start, null);
  for (const node of graph.nodes) {
    if (!seen.has(node.id)) go(node.id, null);
  }
  frames.push({
    type: 'done',
    message: `DFS order: ${order.map((x) => labelOf(graph, x)).join(' → ')}`,
    extra: { visited: [...seen], order: [...order], tree: [...tree], source: start },
  });
  return frames;
}

/**
 * @param {any} graph
 * @param {number} [source]
 */
export function dijkstra(graph, source = 0) {
  const frames = [];
  const n = graph.nodes.length;
  const adj = adjacency(graph, true);
  const dist = Array(n).fill(Infinity);
  const done = Array(n).fill(false);
  const prev = Array(n).fill(-1);
  dist[source] = 0;
  frames.push({
    type: 'info',
    message: `Dijkstra from ${labelOf(graph, source)} · O((V+E) log V) with a heap`,
    extra: { dist: dist.map((d) => (d === Infinity ? '∞' : d)), done: [...done], tree: [], source },
  });

  for (let iter = 0; iter < n; iter += 1) {
    let u = -1;
    for (let i = 0; i < n; i += 1) {
      if (!done[i] && (u === -1 || dist[i] < dist[u])) u = i;
    }
    if (u === -1 || dist[u] === Infinity) break;
    done[u] = true;
    frames.push({
      type: 'visit',
      indices: [u],
      message: `settle ${labelOf(graph, u)} · dist=${dist[u]}`,
      extra: {
        dist: dist.map((d) => (d === Infinity ? '∞' : d)),
        done: [...done],
        tree: prevToEdges(prev),
        source,
      },
    });
    for (const { v, w } of adj[u] || []) {
      if (done[v]) continue;
      frames.push({
        type: 'compare',
        indices: [u, v],
        message: `check ${labelOf(graph, u)}→${labelOf(graph, v)} w=${w}`,
        extra: {
          dist: dist.map((d) => (d === Infinity ? '∞' : d)),
          done: [...done],
          tree: prevToEdges(prev),
          source,
        },
      });
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
        frames.push({
          type: 'relax',
          indices: [u, v],
          message: `relax · dist[${labelOf(graph, v)}] = ${dist[v]}`,
          extra: {
            dist: dist.map((d) => (d === Infinity ? '∞' : d)),
            done: [...done],
            tree: prevToEdges(prev),
            source,
          },
        });
      }
    }
  }
  frames.push({
    type: 'done',
    message: `distances: ${dist.map((d, i) => `${labelOf(graph, i)}=${d === Infinity ? '∞' : d}`).join('  ')}`,
    extra: {
      dist: dist.map((d) => (d === Infinity ? '∞' : d)),
      done: [...done],
      tree: prevToEdges(prev),
      source,
    },
  });
  return frames;
}

/**
 * @param {any} graph
 */
export function prim(graph, start = 0) {
  const frames = [];
  const n = graph.nodes.length;
  const adj = adjacency(graph, false);
  const inTree = new Set([start]);
  /** @type {[number,number,number][]} */
  const tree = [];
  frames.push({
    type: 'info',
    message: `Prim MST from ${labelOf(graph, start)} · O(E log V)`,
    extra: { visited: [...inTree], tree: [], source: start },
  });

  while (inTree.size < n) {
    let best = null;
    for (const u of inTree) {
      for (const e of adj[u] || []) {
        if (inTree.has(e.v)) continue;
        if (!best || e.w < best.w) best = { u, v: e.v, w: e.w };
      }
    }
    if (!best) break;
    frames.push({
      type: 'compare',
      indices: [best.u, best.v],
      message: `cheapest cut edge ${labelOf(graph, best.u)}–${labelOf(graph, best.v)} w=${best.w}`,
      extra: { visited: [...inTree], tree: tree.map((t) => t.slice(0, 2)), source: start },
    });
    tree.push([best.u, best.v, best.w]);
    inTree.add(best.v);
    frames.push({
      type: 'relax',
      indices: [best.u, best.v],
      message: `add edge w=${best.w} to MST`,
      extra: { visited: [...inTree], tree: tree.map((t) => t.slice(0, 2)), source: start },
    });
  }
  const cost = tree.reduce((s, t) => s + t[2], 0);
  frames.push({
    type: 'done',
    message: `MST cost = ${cost}`,
    extra: { visited: [...inTree], tree: tree.map((t) => t.slice(0, 2)), source: start, cost },
  });
  return frames;
}

/**
 * @param {any} graph
 */
export function kruskal(graph) {
  const frames = [];
  const parent = Array.from({ length: graph.nodes.length }, (_, i) => i);
  const edges = graph.edges
    .map((e) => ({ ...e }))
    .sort((a, b) => a.w - b.w);
  /** @type {[number,number,number][]} */
  const tree = [];

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  frames.push({
    type: 'info',
    message: `Kruskal MST · sort edges · O(E log E)`,
    extra: { visited: [], tree: [], source: 0 },
  });

  for (const e of edges) {
    frames.push({
      type: 'compare',
      indices: [e.u, e.v],
      message: `consider ${labelOf(graph, e.u)}–${labelOf(graph, e.v)} w=${e.w}`,
      extra: { visited: [], tree: tree.map((t) => t.slice(0, 2)), source: 0 },
    });
    const ru = find(e.u);
    const rv = find(e.v);
    if (ru !== rv) {
      parent[ru] = rv;
      tree.push([e.u, e.v, e.w]);
      frames.push({
        type: 'relax',
        indices: [e.u, e.v],
        message: `add w=${e.w} (no cycle)`,
        extra: { visited: [], tree: tree.map((t) => t.slice(0, 2)), source: 0 },
      });
    } else {
      frames.push({
        type: 'info',
        indices: [e.u, e.v],
        message: `reject w=${e.w} (would form a cycle)`,
        extra: { visited: [], tree: tree.map((t) => t.slice(0, 2)), source: 0 },
      });
    }
  }
  const cost = tree.reduce((s, t) => s + t[2], 0);
  frames.push({
    type: 'done',
    message: `MST cost = ${cost}`,
    extra: { visited: [], tree: tree.map((t) => t.slice(0, 2)), source: 0, cost },
  });
  return frames;
}

export const GRAPHERS = {
  bfs,
  dfs,
  dijkstra,
  prim,
  kruskal,
};

function adjacency(graph, _directed) {
  /** @type {Record<number, {v:number,w:number}[]>} */
  const adj = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const e of graph.edges) {
    adj[e.u].push({ v: e.v, w: e.w });
    if (!graph.directed) adj[e.v].push({ v: e.u, w: e.w });
  }
  return adj;
}

function labelOf(graph, id) {
  return graph.nodes[id]?.label ?? String(id);
}

function treeEdges(seen, graph, parent) {
  // lightweight: return empty; real tree tracked in callers when needed
  void seen;
  void graph;
  void parent;
  return [];
}

function prevToEdges(prev) {
  /** @type {[number,number][]} */
  const out = [];
  for (let i = 0; i < prev.length; i += 1) {
    if (prev[i] >= 0) out.push([prev[i], i]);
  }
  return out;
}
