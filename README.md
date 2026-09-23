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

1. intro — step mental model, first golf
2. sorting — bubble, selection, insertion, merge, quick
3. searching — linear, binary
4. graphs — BFS, DFS, MST
5. dynamic programming — fib, coin change, LCS
6. complexity — growth-rate quiz

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
