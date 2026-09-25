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
  '  lesson NAME          print a theory pack (asymptotics|recurrences|sorting|…)',
  '  quiz NAME            analysis quiz bank for that topic',
  '',
  'data',
  '  array random [n]     random array (default 12)',
  '  array set 5,2,8,1    set exact values',
  '  array show           print current array',
  '  target N             set search target',
  '  graph load NAME      star | cycle | grid | diamond',
  '',
  'algorithms',
  '  set sort NAME        bubble|selection|insertion|merge|quick|heap|counting|radix|bucket',
  '  set search NAME      linear|binary|select|mom',
  '  set graph NAME       bfs|dfs|dijkstra|prim|kruskal|bellman|floyd|topo|scc|vc',
  '  set dp NAME          fib|coin|lcs|knapsack|rod|chain',
  '  set ds NAME          bst|bst-search|heap|uf|hash|avl|rb',
  '  set greedy NAME      activity|huffman|matroid',
  '  set string NAME      kmp|rk|z|sa|stree',
  '  set flow ek          Edmonds-Karp max-flow',
  '  set np NAME          sat-3sat|3sat-clique|clique-vc|build|gadget',
  '  set dc NAME          closest|master|fft',
  '  set theory master   Master Theorem',
  '  set random freivalds Monte Carlo check',
  '  set proof NAME       autograded bank (insertion-invariant|binary-invariant|…)',
  '  run                  generate steps for current setup',
  '',
  'manual (levels / golf)',
  '  compare i j          compare two cells',
  '  swap i j             swap two cells',
  '  probe mid            binary-search probe at index',
  '  lo mid+1 | hi mid-1  shrink search window',
  '  visit ID             mark node visited',
  '  pick u v             add edge to MST',
  '  insert KEY           BST insert',
  '  answer Q CHOICE      analysis quiz (a|b|c|d|e)',
  '',
  'transport / meta',
  '  step | play | pause | speed N | reset | undo',
  '  next | prev          frame navigation (auto runs)',
  '  golf                 show move count vs par',
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
    case 'field':
    case 'worked':
    case 'insert':
    case 'bst':
      app.playerMove(name, args);
      return;

    case 'lesson':
      app.showLesson((args[0] || '').toLowerCase() || 'asymptotics');
      return;

    case 'quiz':
      app.showLessonQuiz((args[0] || '').toLowerCase() || 'asymptotics');
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
    sort: ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap', 'counting', 'radix', 'bucket'],
    search: ['linear', 'binary', 'select', 'mom'],
    graph: ['bfs', 'dfs', 'dijkstra', 'prim', 'kruskal', 'bellman', 'floyd', 'topo', 'scc', 'vc'],
    dp: ['fib', 'coin', 'lcs', 'knapsack', 'rod', 'chain'],
    ds: ['bst', 'bst-insert', 'bst-search', 'heap', 'uf', 'hash', 'avl', 'rb'],
    greedy: ['activity', 'huffman', 'matroid'],
    string: ['kmp', 'rk', 'z', 'sa', 'stree'],
    flow: ['flow', 'ek'],
    np: ['sat-3sat', '3sat-clique', 'clique-vc', 'build', 'clique-build', 'gadget'],
    dc: ['closest', 'master', 'karatsuba', 'fft', 'poly'],
    theory: ['master', 'asymptotics', 'recurrences'],
    random: ['freivalds', 'mc'],
    proof: ['insertion-invariant', 'binary-invariant', 'dijkstra-invariant', 'greedy-exchange', 'np-reduction', 'master-thm', 'amortized-potential', 'lower-bound'],
    mastery: ['asymptotics', 'recurrences', 'sorting', 'searching', 'structures', 'graphs', 'dp', 'greedy', 'dc', 'strings', 'np', 'randomized', 'proofs'],
    write: ['write-insertion', 'write-dijkstra', 'write-greedy-exchange', 'write-np-reduction', 'write-master-subst'],
    worked: ['wp-sort-inv', 'wp-select-prove', 'wp-dag-sp', 'wp-cut-cite', 'wp-lcs-code', 'wp-np-vc', 'wp-hash-load', 'wp-greedy-ex', 'wp-fft-mul', 'wp-dijkstra-proof'],
  };
  if (!map[domain] || !map[domain].includes(name)) {
    ctx.log(`usage: set ${domain} ${map[domain] ? map[domain].join('|') : '…'}`, 'err');
    return;
  }
  ctx.state.algo = name === 'flow' || name === 'ek' ? 'ek' : name === 'freivalds' || name === 'mc' ? 'freivalds' : name;
  if (domain === 'proof') {
    ctx.state.meta.bank = name;
  }
  ctx.state.mode = domain;
  if (domain === 'sort' || domain === 'search') ctx.state.kind = 'array';
  if (domain === 'graph') {
    ctx.state.kind = 'graph';
    if (name === 'topo' || name === 'scc') ctx.state.graph = graphPresets().dag;
    else if (!ctx.state.graph?.nodes?.length) ctx.state.graph = graphPresets().star;
  }
  if (domain === 'dp') ctx.state.kind = 'matrix';
  if (domain === 'ds' || domain === 'greedy' || domain === 'string' || domain === 'np' || domain === 'dc' || domain === 'theory' || domain === 'random' || domain === 'proof' || domain === 'mastery' || domain === 'write' || domain === 'worked') {
    ctx.state.kind = 'tree';
  }
  if (domain === 'flow') {
    ctx.state.kind = 'graph';
    ctx.state.graph = graphPresets().diamond;
    ctx.state.graph.directed = true;
  }
  ctx.log(`set ${domain} → ${ctx.state.algo}`, 'ok');
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
    dag: {
      directed: true,
      nodes: mkNodes([
        [100, 200, 'A'],
        [220, 100, 'B'],
        [220, 280, 'C'],
        [360, 100, 'D'],
        [360, 280, 'E'],
        [500, 180, 'F'],
      ]),
      edges: [
        { u: 0, v: 1, w: 1 },
        { u: 0, v: 2, w: 1 },
        { u: 1, v: 3, w: 1 },
        { u: 2, v: 3, w: 1 },
        { u: 2, v: 4, w: 1 },
        { u: 3, v: 5, w: 1 },
        { u: 4, v: 5, w: 1 },
        { u: 1, v: 4, w: 1 },
      ],
    },
  };
}
