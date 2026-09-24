/**
 * Extra graph algorithms: Bellman-Ford, Floyd-Warshall, topological sort, SCC (Kosaraju).
 * Graph: { nodes: [{id,label,x,y}], edges: [{u,v,w}], directed?: boolean }
 */

function labelOf(graph, id) {
  return graph.nodes[id]?.label ?? String(id);
}

/**
 * @param {any} graph
 * @param {number} [source]
 */
export function bellmanFord(graph, source = 0) {
  const n = graph.nodes.length;
  const edges = graph.edges.map((e) => ({ ...e }));
  const dist = Array(n).fill(Infinity);
  dist[source] = 0;
  const frames = [];
  frames.push({
    type: 'info',
    message: `Bellman-Ford from ${labelOf(graph, source)} · O(V E) · allows negative weights`,
    extra: { kind: 'bf', dist: dist.map((d) => (d === Infinity ? '∞' : d)), n, edges, source, round: 0 },
  });

  for (let round = 1; round <= n - 1; round += 1) {
    let changed = false;
    for (const e of edges) {
      frames.push({
        type: 'compare',
        indices: [e.u, e.v],
        message: `round ${round}: relax ${labelOf(graph, e.u)}→${labelOf(graph, e.v)} w=${e.w}`,
        extra: {
          kind: 'bf',
          dist: dist.map((d) => (d === Infinity ? '∞' : d)),
          n,
          edges,
          source,
          round,
          active: [e.u, e.v],
        },
      });
      if (dist[e.u] !== Infinity && dist[e.u] + e.w < dist[e.v]) {
        dist[e.v] = dist[e.u] + e.w;
        changed = true;
        frames.push({
          type: 'relax',
          indices: [e.u, e.v],
          message: `update dist[${labelOf(graph, e.v)}] = ${dist[e.v]}`,
          extra: {
            kind: 'bf',
            dist: dist.map((d) => (d === Infinity ? '∞' : d)),
            n,
            edges,
            source,
            round,
            active: [e.u, e.v],
          },
        });
      }
    }
    frames.push({
      type: 'info',
      message: `end round ${round}${changed ? '' : ' (no change — early stop)'}`,
      extra: {
        kind: 'bf',
        dist: dist.map((d) => (d === Infinity ? '∞' : d)),
        n,
        edges,
        source,
        round,
      },
    });
    if (!changed) break;
  }

  let neg = false;
  for (const e of edges) {
    if (dist[e.u] !== Infinity && dist[e.u] + e.w < dist[e.v]) {
      neg = true;
      break;
    }
  }
  frames.push({
    type: 'done',
    message: neg
      ? 'negative-weight cycle detected'
      : `distances: ${dist.map((d, i) => `${labelOf(graph, i)}=${d === Infinity ? '∞' : d}`).join(' ')}`,
    extra: {
      kind: 'bf',
      dist: dist.map((d) => (d === Infinity ? '∞' : d)),
      n,
      edges,
      source,
      neg,
    },
  });
  return frames;
}

/**
 * @param {any} graph
 */
export function floydWarshall(graph) {
  const n = graph.nodes.length;
  const dist = Array.from({ length: n }, () => Array(n).fill(Infinity));
  for (let i = 0; i < n; i += 1) dist[i][i] = 0;
  for (const e of graph.edges) {
    dist[e.u][e.v] = Math.min(dist[e.u][e.v], e.w);
    if (!graph.directed) dist[e.v][e.u] = Math.min(dist[e.v][e.u], e.w);
  }
  const frames = [];
  frames.push({
    type: 'info',
    message: `Floyd-Warshall · O(V³) · all-pairs`,
    extra: { kind: 'fw', dist: fmt(dist), n, k: -1 },
  });

  for (let k = 0; k < n; k += 1) {
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          frames.push({
            type: 'relax',
            message: `k=${k}: dist[${i}][${j}] = ${dist[i][j]}`,
            extra: { kind: 'fw', dist: fmt(dist), n, k, active: [i, k, j] },
          });
        }
      }
    }
    frames.push({
      type: 'info',
      message: `finished intermediate k=${k}`,
      extra: { kind: 'fw', dist: fmt(dist), n, k },
    });
  }

  let neg = false;
  for (let i = 0; i < n; i += 1) if (dist[i][i] < 0) neg = true;
  frames.push({
    type: 'done',
    message: neg ? 'negative cycle on diagonal' : 'all-pairs distances ready',
    extra: { kind: 'fw', dist: fmt(dist), n, neg },
  });
  return frames;
}

function fmt(dist) {
  return dist.map((row) => row.map((v) => (v === Infinity ? '∞' : v)));
}

/**
 * Kahn topological sort. Assumes directed graph.
 * @param {any} graph
 */
export function topologicalSort(graph) {
  const n = graph.nodes.length;
  const indeg = Array(n).fill(0);
  const adj = Array.from({ length: n }, () => []);
  for (const e of graph.edges) {
    adj[e.u].push(e.v);
    indeg[e.v] += 1;
    if (!graph.directed) {
      adj[e.v].push(e.u);
      indeg[e.u] += 1;
    }
  }
  const frames = [];
  const order = [];
  const q = [];
  for (let i = 0; i < n; i += 1) if (indeg[i] === 0) q.push(i);
  frames.push({
    type: 'info',
    message: `topological sort (Kahn) · O(V+E) · queue of indegree 0: [${q.map((x) => labelOf(graph, x)).join(',')}]`,
    extra: { kind: 'topo', indeg: indeg.slice(), order: [], queue: q.slice(), done: [] },
  });

  while (q.length) {
    const u = q.shift();
    order.push(u);
    frames.push({
      type: 'visit',
      indices: [u],
      message: `emit ${labelOf(graph, u)}`,
      extra: {
        kind: 'topo',
        indeg: indeg.slice(),
        order: order.slice(),
        queue: q.slice(),
        done: order.slice(),
      },
    });
    for (const v of adj[u]) {
      indeg[v] -= 1;
      frames.push({
        type: 'compare',
        indices: [u, v],
        message: `decrement indeg[${labelOf(graph, v)}] = ${indeg[v]}`,
        extra: {
          kind: 'topo',
          indeg: indeg.slice(),
          order: order.slice(),
          queue: q.slice(),
          done: order.slice(),
        },
      });
      if (indeg[v] === 0) {
        q.push(v);
        frames.push({
          type: 'set',
          indices: [v],
          message: `enqueue ${labelOf(graph, v)}`,
          extra: {
            kind: 'topo',
            indeg: indeg.slice(),
            order: order.slice(),
            queue: q.slice(),
            done: order.slice(),
          },
        });
      }
    }
  }

  const ok = order.length === n;
  frames.push({
    type: 'done',
    message: ok
      ? `topo order: ${order.map((x) => labelOf(graph, x)).join(' → ')}`
      : `cycle detected — only ${order.length}/${n} emitted`,
    extra: {
      kind: 'topo',
      indeg: indeg.slice(),
      order: order.slice(),
      queue: [],
      done: order.slice(),
      ok,
    },
  });
  return frames;
}

/**
 * Kosaraju strong components.
 * @param {any} graph
 */
export function stronglyConnected(graph) {
  const n = graph.nodes.length;
  const adj = Array.from({ length: n }, () => []);
  const radj = Array.from({ length: n }, () => []);
  for (const e of graph.edges) {
    adj[e.u].push(e.v);
    radj[e.v].push(e.u);
    if (!graph.directed) {
      adj[e.v].push(e.u);
      radj[e.u].push(e.v);
    }
  }
  const frames = [];
  const seen = Array(n).fill(false);
  const order = [];

  frames.push({
    type: 'info',
    message: `Kosaraju SCC · O(V+E) · DFS, reverse, DFS`,
    extra: { kind: 'scc', comps: [], phase: 1 },
  });

  function dfs1(u) {
    seen[u] = true;
    frames.push({
      type: 'visit',
      indices: [u],
      message: `dfs1 visit ${labelOf(graph, u)}`,
      extra: { kind: 'scc', comps: [], phase: 1, seen: seen.slice(), order: order.slice() },
    });
    for (const v of adj[u]) if (!seen[v]) dfs1(v);
    order.push(u);
    frames.push({
      type: 'info',
      indices: [u],
      message: `dfs1 finish ${labelOf(graph, u)}`,
      extra: { kind: 'scc', comps: [], phase: 1, seen: seen.slice(), order: order.slice() },
    });
  }

  for (let i = 0; i < n; i += 1) if (!seen[i]) dfs1(i);

  frames.push({
    type: 'info',
    message: `finish order: ${order.map((x) => labelOf(graph, x)).join(' → ')}`,
    extra: { kind: 'scc', comps: [], phase: 2, order: order.slice() },
  });

  seen.fill(false);
  const comps = [];
  function dfs2(u, comp) {
    seen[u] = true;
    comp.push(u);
    frames.push({
      type: 'visit',
      indices: [u],
      message: `dfs2 (Gᵀ) visit ${labelOf(graph, u)}`,
      extra: {
        kind: 'scc',
        comps: comps.map((c) => c.slice()).concat([comp.slice()]),
        phase: 2,
        seen: seen.slice(),
      },
    });
    for (const v of radj[u]) if (!seen[v]) dfs2(v, comp);
  }

  for (let i = order.length - 1; i >= 0; i -= 1) {
    const u = order[i];
    if (!seen[u]) {
      const comp = [];
      dfs2(u, comp);
      comps.push(comp);
    }
  }

  frames.push({
    type: 'done',
    message: `SCCs: ${comps.map((c) => `{${c.map((x) => labelOf(graph, x)).join(',')}}`).join(' ')}`,
    extra: { kind: 'scc', comps, phase: 3 },
  });
  return frames;
}

export const GRAPHERS_EXTRA = {
  bellman: bellmanFord,
  floyd: floydWarshall,
  topo: topologicalSort,
  scc: stronglyConnected,
};
