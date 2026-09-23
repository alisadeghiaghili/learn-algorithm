/**
 * Command parser + dispatch.
 * LGB-style text commands drive the whole app.
 */

/**
 * @typedef {Object} CommandContext
 * @property {import('./SandboxState.js').SandboxState} state
 * @property {import('./StepEngine.js').StepEngine} engine
 * @property {(msg: string, kind?: 'out'|'ok'|'err'|'sys') => void} log
 * @property {(text: string) => void} setTitle
 * @property {() => void} refresh
 * @property {() => object} app
 */

/**
 * @param {string} line
 * @returns {{ name: string, args: string[] }}
 */
export function parseCommand(line) {
  const trimmed = line.trim();
  if (!trimmed) return { name: '', args: [] };
  const parts = trimmed.split(/\s+/);
  return { name: parts[0].toLowerCase(), args: parts.slice(1) };
}

const HELP_LINES = [
  'commands',
  '  help                 show this list',
  '  levels               open level browser',
  '  sandbox              free-play mode',
  '  clear                clear console log',
  '',
  'data',
  '  array random [n]     random array (default 12)',
  '  array set 5,2,8,1    set exact values',
  '  array show           print current array',
  '  target N             set search target',
  '  graph load NAME      star | cycle | grid | diamond',
  '',
  'algorithms',
  '  set sort NAME        bubble|selection|insertion|merge|quick|heap',
  '  set search NAME      linear|binary',
  '  set graph NAME       bfs|dfs|dijkstra|prim|kruskal',
  '  set dp NAME          fib|coin|lcs|knapsack',
  '  run                  generate steps for current setup',
  '',
  'manual (levels / golf)',
  '  compare i j          compare two cells',
  '  swap i j             swap two cells',
  '  probe mid            binary-search probe at index',
  '  lo mid+1 | hi mid-1  shrink search window',
  '  visit ID             mark graph node visited (BFS/DFS golf)',
  '  relax u v            Dijkstra-style relax edge',
  '  pick u v             add edge to MST',
  '',
  'transport / meta',
  '  step | play | pause | speed N | reset | undo',
  '  next | prev          frame navigation (auto runs)',
  '  golf                 show move count vs par',
  '  build level          (stub) export current challenge JSON',
];

/**
 * @param {CommandContext} ctx
 * @param {string} raw
 */
export function dispatch(ctx, raw) {
  const { name, args } = parseCommand(raw);
  if (!name) return;

  ctx.log(`> ${raw.trim()}`, 'cmd');

  const app = ctx.app();
  switch (name) {
    case 'help':
    case '?':
      for (const line of HELP_LINES) ctx.log(line, line ? 'out' : 'out');
      return;

    case 'levels':
      app.openLevels();
      return;

    case 'sandbox':
      app.enterSandbox();
      return;

    case 'clear':
      app.clearLog();
      return;

    case 'array':
      return handleArray(ctx, args);

    case 'target':
      if (!args[0] || Number.isNaN(Number(args[0]))) {
        ctx.log('usage: target N', 'err');
        return;
      }
      ctx.state.target = Number(args[0]);
      ctx.log(`target = ${ctx.state.target}`, 'ok');
      ctx.refresh();
      return;

    case 'graph':
      return handleGraph(ctx, args);

    case 'set':
      return handleSet(ctx, args);

    case 'run':
      app.runCurrent();
      return;

    case 'step':
      ctx.engine.step();
      return;

    case 'play':
      ctx.engine.play();
      return;

    case 'pause':
      ctx.engine.pause();
      return;

    case 'speed': {
      const s = Number(args[0]);
      if (Number.isNaN(s)) {
        ctx.log('usage: speed 1..10', 'err');
        return;
      }
      ctx.engine.setSpeed(s);
      ctx.log(`speed = ${ctx.engine.speed}`, 'ok');
      return;
    }

    case 'next':
      ctx.engine.step();
      return;

    case 'prev':
    case 'back':
      ctx.engine.stepBack();
      return;

    case 'reset':
      app.resetLevel();
      return;

    case 'undo':
      app.undo();
      return;

    case 'golf':
    case 'score':
      app.showGolf();
      return;

    case 'build':
      if ((args[0] || '').toLowerCase() === 'level') {
        app.buildLevel();
        return;
      }
      ctx.log('usage: build level', 'err');
      return;

    case 'compare':
    case 'swap':
    case 'probe':
    case 'lo':
    case 'hi':
    case 'visit':
    case 'relax':
    case 'pick':
    case 'drop':
    case 'setdp':
    case 'answer':
      app.playerMove(name, args);
      return;

    default:
      ctx.log(`unknown command: ${name} (try help)`, 'err');
  }
}

function handleArray(ctx, args) {
  const sub = (args[0] || '').toLowerCase();
  if (sub === 'random') {
    const n = Number(args[1] || 12);
    ctx.state.randomize(n);
    ctx.log(`array random ${ctx.state.array.length}`, 'ok');
    ctx.app().afterDataChange();
    return;
  }
  if (sub === 'set') {
    const raw = args.slice(1).join(' ');
    const values = raw
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
    if (!values.length) {
      ctx.log('usage: array set 5,2,8,1', 'err');
      return;
    }
    ctx.state.setArray(values);
    ctx.log(`array = [${ctx.state.array.join(', ')}]`, 'ok');
    ctx.app().afterDataChange();
    return;
  }
  if (sub === 'show' || !sub) {
    ctx.log(`[${ctx.state.array.join(', ')}]`, 'out');
    return;
  }
  ctx.log('usage: array random|set|show', 'err');
}

function handleGraph(ctx, args) {
  const sub = (args[0] || '').toLowerCase();
  if (sub !== 'load') {
    ctx.log('usage: graph load star|cycle|grid|diamond', 'err');
    return;
  }
  const name = (args[1] || 'star').toLowerCase();
  const presets = graphPresets();
  if (!presets[name]) {
    ctx.log(`unknown graph: ${name}`, 'err');
    return;
  }
  ctx.state.kind = 'graph';
  ctx.state.mode = 'graph';
  ctx.state.graph = presets[name];
  ctx.state.algo = 'bfs';
  ctx.log(`graph loaded: ${name}`, 'ok');
  ctx.app().afterDataChange();
}

function handleSet(ctx, args) {
  const domain = (args[0] || '').toLowerCase();
  const name = (args[1] || '').toLowerCase();
  const map = {
    sort: ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'],
    search: ['linear', 'binary'],
    graph: ['bfs', 'dfs', 'dijkstra', 'prim', 'kruskal'],
    dp: ['fib', 'coin', 'lcs', 'knapsack'],
  };
  if (!map[domain] || !map[domain].includes(name)) {
    ctx.log(`usage: set ${domain} ${map[domain] ? map[domain].join('|') : '…'}`, 'err');
    return;
  }
  ctx.state.algo = name;
  ctx.state.mode = domain;
  if (domain === 'sort') ctx.state.kind = 'array';
  if (domain === 'search') ctx.state.kind = 'array';
  if (domain === 'graph') ctx.state.kind = 'graph';
  if (domain === 'dp') ctx.state.kind = 'matrix';
  ctx.log(`set ${domain} → ${name}`, 'ok');
  ctx.app().afterDataChange();
}

export function graphPresets() {
  const mkNodes = (coords) =>
    coords.map(([x, y, label], id) => ({ id, label, x, y }));

  return {
    star: {
      directed: false,
      nodes: mkNodes([
        [280, 150, 'S'],
        [120, 70, 'A'],
        [440, 70, 'B'],
        [100, 230, 'C'],
        [460, 230, 'D'],
        [280, 280, 'E'],
      ]),
      edges: [
        { u: 0, v: 1, w: 2 },
        { u: 0, v: 2, w: 4 },
        { u: 0, v: 3, w: 1 },
        { u: 0, v: 4, w: 5 },
        { u: 0, v: 5, w: 3 },
        { u: 1, v: 3, w: 2 },
        { u: 2, v: 4, w: 1 },
        { u: 3, v: 5, w: 4 },
        { u: 4, v: 5, w: 2 },
      ],
    },
    cycle: {
      directed: false,
      nodes: mkNodes([
        [160, 160, 'A'],
        [280, 80, 'B'],
        [400, 160, 'C'],
        [340, 260, 'D'],
        [220, 260, 'E'],
      ]),
      edges: [
        { u: 0, v: 1, w: 3 },
        { u: 1, v: 2, w: 3 },
        { u: 2, v: 3, w: 3 },
        { u: 3, v: 4, w: 3 },
        { u: 4, v: 0, w: 3 },
        { u: 0, v: 2, w: 5 },
      ],
    },
    grid: {
      directed: false,
      nodes: mkNodes([
        [140, 80, 'A'],
        [280, 80, 'B'],
        [420, 80, 'C'],
        [140, 200, 'D'],
        [280, 200, 'E'],
        [420, 200, 'F'],
        [140, 300, 'G'],
        [280, 300, 'H'],
        [420, 300, 'I'],
      ]),
      edges: [
        { u: 0, v: 1, w: 1 },
        { u: 1, v: 2, w: 1 },
        { u: 3, v: 4, w: 1 },
        { u: 4, v: 5, w: 1 },
        { u: 6, v: 7, w: 1 },
        { u: 7, v: 8, w: 1 },
        { u: 0, v: 3, w: 1 },
        { u: 1, v: 4, w: 1 },
        { u: 2, v: 5, w: 1 },
        { u: 3, v: 6, w: 1 },
        { u: 4, v: 7, w: 1 },
        { u: 5, v: 8, w: 1 },
      ],
    },
    diamond: {
      directed: true,
      nodes: mkNodes([
        [120, 160, 'S'],
        [280, 80, 'A'],
        [280, 240, 'B'],
        [440, 160, 'T'],
      ]),
      edges: [
        { u: 0, v: 1, w: 1 },
        { u: 0, v: 2, w: 4 },
        { u: 1, v: 3, w: 3 },
        { u: 2, v: 3, w: 1 },
        { u: 1, v: 2, w: 1 },
      ],
    },
  };
}
