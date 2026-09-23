# LearnAlgo

An interactive algorithm visualization and tutorial — the algorithms-course
cousin of [LearnGitBranching](https://github.com/pcottle/learnGitBranching).

100% client-side. Command console + live visualizations + golf-scored levels.

## Quick start

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
# outputs ./build — open build/index.html or any static host
```

## What you get

- **Sandbox** — random arrays, graphs, DP tables; run bubble → quicksort, BFS → Dijkstra, fib → knapsack.
- **Command console** — LGB-style text commands (`set sort quick`, `run`, `swap 0 1`, `golf`).
- **Levels** — sequenced lessons with par scores (algorithm golf).
- **Transport** — play / step / pause / speed / reset / undo.

## Commands (short list)

| Command | Effect |
| --- | --- |
| `help` | full list |
| `levels` | level browser |
| `array random 12` | new data |
| `set sort quick` | pick algorithm |
| `run` | generate + play steps |
| `compare i j` / `swap i j` | manual golf moves |
| `probe mid` / `lo mid+1` | binary-search golf |
| `visit 2` / `pick 0 1` | graph golf |
| `golf` | moves vs par |

## Course map

1. intro — step model, golf, asymptotics quiz
2. asymptotics & recurrences — Master Theorem drills
3. sorting — comparison sorts + counting/radix/bucket + theory exam
4. searching & selection — binary search golf, quickselect
5. data structures — BST, heap, union-find, hash
6. graphs — BFS/DFS golf, MST, Dijkstra, Edmonds–Karp max-flow
7. dynamic programming — fib, coins, LCS, knapsack + exam
8. greedy & strings — activity selection, Huffman, KMP, Rabin–Karp
9. divide & conquer — closest pair, Karatsuba via Master Theorem
10. NP-completeness — SAT≤3-SAT≤CLIQUE≤VERTEX-COVER walkthroughs
11. randomized / flow theory — Las Vegas vs Monte Carlo, max-flow exam

Theory packs: `lesson asymptotics|recurrences|sorting|linearSorts|…`  
Analysis quizzes: `quiz asymptotics|recurrences|sorting|ds|graphs|dp|greedy|np|flow`

## Architecture

```
src/
  app/App.js           shell, levels, win logic, console
  engine/              StepEngine, SandboxState, command parser, player moves
  algorithms/          frame generators (sorting, searching, graphs, dp)
  viz/                 SVG visualizers (array bars, graph, DP matrix)
  levels/              sequenced challenges with par + win predicates
  style/main.css       design tokens (lab workstation theme)
```

Each algorithm is a pure function that turns data into an array of **frames**.
The engine plays those frames; the visualizer renders the current frame.
Manual levels push one frame per player command — same pipeline.

## License

MIT
