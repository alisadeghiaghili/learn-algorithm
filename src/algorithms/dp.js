/**
 * Dynamic programming demos as frame generators.
 * Matrix visualizer payload lives in frame.extra.
 */

/**
 * Fibonacci (top-down memo vs bottom-up) — bottom-up DP table.
 * @param {number} n
 */
export function fib(n = 10) {
  const N = Math.max(1, Math.min(20, n));
  const frames = [];
  const dp = Array(N + 1).fill(null);
  dp[0] = 0;
  if (N >= 1) dp[1] = 1;
  frames.push({
    type: 'info',
    message: `fib(${N}) bottom-up · O(n) time / O(n) space`,
    extra: {
      kind: 'dp1d',
      title: 'dp[i] = dp[i-1] + dp[i-2]',
      labels: Array.from({ length: N + 1 }, (_, i) => String(i)),
      cells: dp.map((v) => (v == null ? '' : String(v))),
      active: [],
    },
  });

  for (let i = 2; i <= N; i += 1) {
    frames.push({
      type: 'compare',
      indices: [i - 1, i - 2],
      message: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]}`,
      extra: {
        kind: 'dp1d',
        title: 'dp[i] = dp[i-1] + dp[i-2]',
        labels: Array.from({ length: N + 1 }, (_, k) => String(k)),
        cells: dp.map((v) => (v == null ? '' : String(v))),
        active: [i - 1, i - 2],
        write: i,
      },
    });
    dp[i] = dp[i - 1] + dp[i - 2];
    frames.push({
      type: 'set',
      indices: [i],
      message: `dp[${i}] = ${dp[i]}`,
      extra: {
        kind: 'dp1d',
        title: 'dp[i] = dp[i-1] + dp[i-2]',
        labels: Array.from({ length: N + 1 }, (_, k) => String(k)),
        cells: dp.map((v) => (v == null ? '' : String(v))),
        active: [i],
      },
    });
  }
  frames.push({
    type: 'done',
    message: `fib(${N}) = ${dp[N]}`,
    extra: {
      kind: 'dp1d',
      title: `fib(${N}) = ${dp[N]}`,
      labels: Array.from({ length: N + 1 }, (_, k) => String(k)),
      cells: dp.map((v) => String(v)),
      active: [N],
    },
  });
  return frames;
}

/**
 * Coin change (min coins).
 * @param {number} amount
 * @param {number[]} coins
 */
export function coinChange(amount = 11, coins = [1, 3, 4]) {
  const target = Math.max(1, Math.min(30, amount));
  const frames = [];
  const dp = Array(target + 1).fill(Infinity);
  dp[0] = 0;
  frames.push({
    type: 'info',
    message: `coin change · coins {${coins.join(',')}} · amount ${target}`,
    extra: {
      kind: 'dp1d',
      title: 'dp[x] = 1 + min dp[x-c]',
      labels: Array.from({ length: target + 1 }, (_, i) => String(i)),
      cells: dp.map((v, i) => (i === 0 ? '0' : '∞')),
      active: [0],
    },
  });

  for (let x = 1; x <= target; x += 1) {
    for (const c of coins) {
      if (c > x) continue;
      frames.push({
        type: 'compare',
        indices: [x, x - c],
        message: `dp[${x}] ?= 1 + dp[${x - c}] (coin ${c})`,
        extra: {
          kind: 'dp1d',
          title: 'dp[x] = 1 + min dp[x-c]',
          labels: Array.from({ length: target + 1 }, (_, i) => String(i)),
          cells: dp.map((v) => (v === Infinity ? '∞' : String(v))),
          active: [x, x - c],
          write: x,
        },
      });
      if (dp[x - c] !== Infinity && dp[x - c] + 1 < dp[x]) {
        dp[x] = dp[x - c] + 1;
        frames.push({
          type: 'set',
          indices: [x],
          message: `dp[${x}] = ${dp[x]}`,
          extra: {
            kind: 'dp1d',
            title: 'dp[x] = 1 + min dp[x-c]',
            labels: Array.from({ length: target + 1 }, (_, i) => String(i)),
            cells: dp.map((v) => (v === Infinity ? '∞' : String(v))),
            active: [x],
          },
        });
      }
    }
  }
  const ans = dp[target] === Infinity ? '∞' : String(dp[target]);
  frames.push({
    type: 'done',
    message: `min coins for ${target} = ${ans}`,
    extra: {
      kind: 'dp1d',
      title: `min coins = ${ans}`,
      labels: Array.from({ length: target + 1 }, (_, i) => String(i)),
      cells: dp.map((v) => (v === Infinity ? '∞' : String(v))),
      active: [target],
    },
  });
  return frames;
}

/**
 * LCS table.
 * @param {string} a
 * @param {string} b
 */
export function lcs(a = 'ABCBDAB', b = 'BDCABA') {
  const A = a.toUpperCase().slice(0, 10);
  const B = b.toUpperCase().slice(0, 10);
  const m = A.length;
  const n = B.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  const frames = [];
  frames.push({
    type: 'info',
    message: `LCS("${A}", "${B}") · O(mn)`,
    extra: matrixPayload(A, B, dp, [], 'LCS length table'),
  });

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const active = [
        [i - 1, j],
        [i, j - 1],
        [i - 1, j - 1],
      ];
      if (A[i - 1] === B[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        frames.push({
          type: 'set',
          message: `match ${A[i - 1]} · dp[${i}][${j}] = ${dp[i][j]}`,
          extra: matrixPayload(A, B, dp, active, 'LCS length table', [i, j]),
        });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        frames.push({
          type: 'compare',
          message: `no match · dp[${i}][${j}] = max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}`,
          extra: matrixPayload(A, B, dp, active, 'LCS length table', [i, j]),
        });
      }
    }
  }
  frames.push({
    type: 'done',
    message: `LCS length = ${dp[m][n]}`,
    extra: matrixPayload(A, B, dp, [[m, n]], `LCS length = ${dp[m][n]}`, [m, n]),
  });
  return frames;
}

/**
 * 0/1 knapsack 2-row style full table (small capacity).
 * @param {number[]} weights
 * @param {number[]} values
 * @param {number} capacity
 */
export function knapsack(weights = [2, 3, 4, 5], values = [3, 4, 5, 6], capacity = 8) {
  const W = Math.max(1, Math.min(16, capacity));
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  const frames = [];
  frames.push({
    type: 'info',
    message: `0/1 knapsack · n=${n} cap=${W} · O(nW)`,
    extra: knapPayload(weights, values, dp, [], 'value table'),
  });

  for (let i = 1; i <= n; i += 1) {
    for (let w = 0; w <= W; w += 1) {
      const skip = dp[i - 1][w];
      let take = 0;
      if (weights[i - 1] <= w) take = dp[i - 1][w - weights[i - 1]] + values[i - 1];
      dp[i][w] = Math.max(skip, take);
      frames.push({
        type: take > skip ? 'set' : 'compare',
        message: `item ${i} w=${weights[i - 1]} v=${values[i - 1]} · dp[${i}][${w}]=${dp[i][w]} (${take > skip ? 'take' : 'skip'})`,
        extra: knapPayload(
          weights,
          values,
          dp,
          [
            [i - 1, w],
            [i - 1, w - weights[i - 1]],
          ],
          'value table',
          [i, w],
        ),
      });
    }
  }
  frames.push({
    type: 'done',
    message: `best value = ${dp[n][W]}`,
    extra: knapPayload(weights, values, dp, [[n, W]], `best value = ${dp[n][W]}`, [n, W]),
  });
  return frames;
}

export const DPS = {
  fib,
  coin: coinChange,
  lcs,
  knapsack,
};

function matrixPayload(A, B, dp, active, title, write) {
  return {
    kind: 'dp2d',
    title,
    rows: ['∅', ...A.split('')],
    cols: ['∅', ...B.split('')],
    cells: dp.map((row) => row.map((v) => String(v))),
    active: active.filter(([i, j]) => i >= 0 && j >= 0),
    write: write || null,
  };
}

function knapPayload(weights, values, dp, active, title, write) {
  return {
    kind: 'dp2d',
    title,
    rows: ['∅', ...weights.map((w, i) => `w${w}v${values[i]}`)],
    cols: Array.from({ length: dp[0].length }, (_, w) => String(w)),
    cells: dp.map((row) => row.map((v) => String(v))),
    active: active.filter(([i, j]) => i >= 0 && j >= 0),
    write: write || null,
  };
}
