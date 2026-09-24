/**
 * Extra DP: rod cutting, matrix-chain multiplication.
 */

/**
 * Rod cutting — maximize revenue.
 * @param {number[]} price price[i] = price of length i+1 (1-based lengths)
 * @param {number} n
 */
export function rodCutting(price = [1, 5, 8, 9, 10, 17, 17, 20], n = 8) {
  const p = price.slice(0, Math.max(1, n));
  const N = p.length;
  const dp = Array(N + 1).fill(0);
  const cut = Array(N + 1).fill(0);
  const frames = [];
  frames.push({
    type: 'info',
    message: `rod cutting · n=${N} · O(n²) · prices [${p.join(',')}]`,
    extra: {
      kind: 'dp1d',
      title: 'dp[i] = max_{j≤i} (p[j] + dp[i−j])',
      labels: Array.from({ length: N + 1 }, (_, i) => String(i)),
      cells: dp.map((v) => String(v)),
      active: [],
    },
  });

  for (let i = 1; i <= N; i += 1) {
    for (let j = 1; j <= i; j += 1) {
      frames.push({
        type: 'compare',
        message: `i=${i} try cut ${j} → ${p[j - 1]} + dp[${i - j}]=${dp[i - j]}`,
        extra: {
          kind: 'dp1d',
          title: 'dp[i] = max_{j≤i} (p[j] + dp[i−j])',
          labels: Array.from({ length: N + 1 }, (_, k) => String(k)),
          cells: dp.map((v) => String(v)),
          active: [j - 1, i - j],
          write: i,
        },
      });
      const cand = p[j - 1] + dp[i - j];
      if (cand > dp[i]) {
        dp[i] = cand;
        cut[i] = j;
        frames.push({
          type: 'set',
          message: `dp[${i}] = ${dp[i]} (first cut ${j})`,
          extra: {
            kind: 'dp1d',
            title: 'dp[i] = max_{j≤i} (p[j] + dp[i−j])',
            labels: Array.from({ length: N + 1 }, (_, k) => String(k)),
            cells: dp.map((v) => String(v)),
            active: [i],
          },
        });
      }
    }
  }
  frames.push({
    type: 'done',
    message: `best revenue = ${dp[N]} · first cut = ${cut[N]}`,
    extra: {
      kind: 'dp1d',
      title: `best revenue = ${dp[N]}`,
      labels: Array.from({ length: N + 1 }, (_, k) => String(k)),
      cells: dp.map((v) => String(v)),
      active: [N],
    },
  });
  return frames;
}

/**
 * Matrix-chain multiplication.
 * @param {number[]} dims dimensions array length n+1 for n matrices
 */
export function matrixChain(dims = [10, 30, 5, 60]) {
  const p = dims.slice();
  const n = p.length - 1;
  const dp = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  const split = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  const frames = [];
  frames.push({
    type: 'info',
    message: `matrix chain · dims [${p.join('×')}] · O(n³) · interval DP`,
    extra: matrixPayload(p, dp, [], 'cost[i][j] = min_k cost[i][k]+cost[k+1][j]+p_{i-1}p_k p_j', null),
  });

  for (let len = 2; len <= n; len += 1) {
    for (let i = 1; i + len - 1 <= n; i += 1) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k += 1) {
        frames.push({
          type: 'compare',
          message: `len=${len} i=${i} j=${j} split k=${k}`,
          extra: matrixPayload(p, dp, [[i, k], [k + 1, j], [i, j]], 'matrix-chain', [i, j]),
        });
        const cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];
        if (cost < dp[i][j]) {
          dp[i][j] = cost;
          split[i][j] = k;
          frames.push({
            type: 'set',
            message: `dp[${i}][${j}] = ${cost} (k=${k})`,
            extra: matrixPayload(p, dp, [[i, j]], 'matrix-chain', [i, j]),
          });
        }
      }
    }
  }
  frames.push({
    type: 'done',
    message: `min multiplications = ${dp[1][n]}`,
    extra: matrixPayload(p, dp, [[1, n]], `min cost = ${dp[1][n]}`, [1, n]),
  });
  return frames;
}

function matrixPayload(dims, dp, active, title, write) {
  const n = dims.length - 1;
  return {
    kind: 'dp2d',
    title,
    rows: Array.from({ length: n + 1 }, (_, i) => (i === 0 ? '∅' : `A${i}`)),
    cols: Array.from({ length: n + 1 }, (_, j) => (j === 0 ? '∅' : `A${j}`)),
    cells: dp.map((row) => row.map((v) => (v === Infinity ? '∞' : String(v)))),
    active: active.filter(([i, j]) => i >= 0 && j >= 0),
    write: write || null,
  };
}

export const DPS_EXTRA = {
  rod: rodCutting,
  chain: matrixChain,
};
