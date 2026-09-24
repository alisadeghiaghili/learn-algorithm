import { StepEngine } from '../engine/StepEngine.js';
import { SandboxState } from '../engine/SandboxState.js';
import { dispatch, graphPresets } from '../engine/commands.js';
import { buildAutoFrames, playerMove } from '../engine/moves.js';
import { ArrayViz, GraphViz, MatrixViz } from '../viz/visualizers.js';
import { ExtraViz } from '../viz/extraViz.js';
import { lessons, analysisQuizzes } from '../theory/lessons.js';
import {
  sequences,
  sequenceOrder,
  findLevel,
  allLevels,
  QUIZ_ANSWERS,
  QUIZ_TEXT,
} from '../levels/index.js';

const STORAGE_KEY = 'learn-algo-progress-v1';

export class App {
  constructor() {
    this.state = new SandboxState();
    this.engine = new StepEngine();
    this.mode = 'sandbox'; // sandbox | level
    this.level = null;
    this.moves = 0;
    this.progress = loadProgress();

    this.dom = {
      stage: document.getElementById('stage'),
      stageTitle: document.getElementById('stage-title'),
      stageSub: document.getElementById('stage-sub'),
      legend: document.getElementById('legend'),
      modeChip: document.getElementById('mode-chip'),
      levelLabel: document.getElementById('level-label'),
      statMoves: document.getElementById('stat-moves'),
      statPar: document.getElementById('stat-par'),
      statSteps: document.getElementById('stat-steps'),
      consoleLog: document.getElementById('console-log'),
      consoleForm: document.getElementById('console-form'),
      consoleInput: document.getElementById('console-input'),
      modalRoot: document.getElementById('modal-root'),
      toast: document.getElementById('toast'),
      workspace: document.querySelector('.workspace'),
      sidePanel: document.getElementById('side-panel'),
      sideKicker: document.getElementById('side-kicker'),
      sideTitle: document.getElementById('side-title'),
      sideBody: document.getElementById('side-body'),
      sideGoal: document.getElementById('side-goal'),
    };

    this.viz = {
      array: new ArrayViz(this.dom.stage),
      graph: new GraphViz(this.dom.stage),
      matrix: new MatrixViz(this.dom.stage),
      extra: new ExtraViz(this.dom.stage),
    };

    this.engine.onChange(() => this.render());
  }

  mount() {
    const { dom } = this;
    dom.consoleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const line = dom.consoleInput.value;
      dom.consoleInput.value = '';
      this.runCommand(line);
    });

    document.getElementById('btn-help').addEventListener('click', () => this.runCommand('help'));
    document.getElementById('btn-levels').addEventListener('click', () => this.openLevels());
    document.getElementById('btn-sandbox').addEventListener('click', () => this.enterSandbox());
    document.getElementById('btn-reset').addEventListener('click', () => this.resetLevel());
    document.getElementById('btn-undo').addEventListener('click', () => this.undo());
    document.getElementById('btn-step').addEventListener('click', () => this.engine.step());
    document.getElementById('btn-play').addEventListener('click', () => this.engine.togglePlay());
    document.getElementById('speed').addEventListener('input', (e) => {
      this.engine.setSpeed(Number(e.target.value));
    });

    // URL params like LGB: ?command=...&level=...&NODEMO
    const params = new URLSearchParams(location.search);
    const levelId = params.get('level');
    if (levelId && findLevel(levelId)) {
      this.loadLevel(levelId);
    } else {
      this.enterSandbox();
      this.log('LearnAlgo — interactive algorithm tutorial', 'sys');
      this.log('Type `help` for commands or `levels` to start the course.', 'sys');
    }
    const cmd = params.get('command');
    if (cmd) {
      for (const part of splitCommands(cmd)) this.runCommand(part);
    }
    if (!params.has('NODEMO') && !levelId) {
      this.showWelcome();
    }

    // history: up/down through commands
    this._hist = [];
    this._histIdx = -1;
    dom.consoleInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this._histIdx < this._hist.length - 1) this._histIdx += 1;
        dom.consoleInput.value = this._hist[this._histIdx] || '';
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this._histIdx > 0) this._histIdx -= 1;
        else this._histIdx = -1;
        dom.consoleInput.value = this._hist[this._histIdx] || '';
      }
    });

    this.render();
    dom.consoleInput.focus();
  }

  // ——— command surface used by commands.js ———
  runCommand(line) {
    if (line.trim()) {
      this._hist.unshift(line.trim());
      if (this._hist.length > 50) this._hist.pop();
      this._histIdx = -1;
    }
    try {
      dispatch(
        {
          state: this.state,
          engine: this.engine,
          log: (m, k) => this.log(m, k),
          setTitle: (t) => {
            this.dom.stageTitle.textContent = t;
          },
          refresh: () => this.render(),
          app: () => this,
        },
        line,
      );
    } catch (err) {
      this.log(String(err.message || err), 'err');
    }
    this.render();
  }

  log(msg, kind = 'out') {
    const line = document.createElement('div');
    line.className = `console-line ${kind}`;
    line.textContent = msg;
    this.dom.consoleLog.appendChild(line);
    this.dom.consoleLog.scrollTop = this.dom.consoleLog.scrollHeight;
    while (this.dom.consoleLog.children.length > 200) {
      this.dom.consoleLog.removeChild(this.dom.consoleLog.firstChild);
    }
  }

  clearLog() {
    this.dom.consoleLog.replaceChildren();
  }

  enterSandbox() {
    this.mode = 'sandbox';
    this.level = null;
    this.moves = 0;
    this.dom.sidePanel.hidden = true;
    this.dom.workspace.classList.remove('has-side');
    this.dom.modeChip.textContent = 'sandbox';
    this.dom.levelLabel.textContent = 'free play';
    this.dom.statPar.textContent = '—';
    this.state = new SandboxState();
    this.engine.resetFrames([]);
    this.engine.clearHistory();
    this.afterDataChange();
    this.log('sandbox mode — explore freely', 'sys');
  }

  openLevels() {
    const activeTab = this._tab || sequenceOrder[0];
    this._tab = activeTab;
    const rows = sequences[activeTab].levels
      .map((lv, i) => {
        const score = this.progress[lv.id];
        const done = score != null;
        const scoreText = done ? `${score} moves` : `par ${lv.par}`;
        return (
          `<button type="button" class="level-row ${done ? 'done' : ''}" data-level="${lv.id}">` +
          `<span class="level-num">${String(i + 1).padStart(2, '0')}</span>` +
          `<span><span class="level-name">${escapeHtml(lv.name)}</span>` +
          `<span class="level-desc">${escapeHtml(lv.desc)}</span></span>` +
          `<span class="level-score">${scoreText}</span>` +
          `</button>`
        );
      })
      .join('');

    const tabs = sequenceOrder
      .map(
        (k) =>
          `<button type="button" class="tab ${k === activeTab ? 'active' : ''}" data-tab="${k}">${escapeHtml(
            sequences[k].name,
          )}</button>`,
      )
      .join('');

    const solved = allLevels().filter((l) => this.progress[l.id] != null).length;
    const total = allLevels().length;

    this.dom.modalRoot.hidden = false;
    this.dom.modalRoot.innerHTML =
      `<div class="modal" role="dialog" aria-label="Levels">` +
      `<div class="modal-head"><div>` +
      `<h2 class="modal-title">Levels</h2>` +
      `<p class="modal-sub">${solved}/${total} solved · golf counts every command</p>` +
      `</div><button type="button" class="btn ghost" id="modal-close">close</button></div>` +
      `<div class="tabs">${tabs}</div>` +
      `<div class="level-list">${rows}</div>` +
      `</div>`;

    this.dom.modalRoot.querySelector('#modal-close').addEventListener('click', () => {
      this.dom.modalRoot.hidden = true;
    });
    this.dom.modalRoot.addEventListener('click', (e) => {
      if (e.target === this.dom.modalRoot) this.dom.modalRoot.hidden = true;
    });
    this.dom.modalRoot.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._tab = btn.getAttribute('data-tab');
        this.openLevels();
      });
    });
    this.dom.modalRoot.querySelectorAll('[data-level]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.dom.modalRoot.hidden = true;
        this.loadLevel(btn.getAttribute('data-level'));
      });
    });
  }

  loadLevel(id) {
    const level = findLevel(id);
    if (!level) {
      this.log(`level not found: ${id}`, 'err');
      return;
    }
    this.mode = 'level';
    this.level = level;
    this.moves = 0;
    this._won = false;
    this.applySetup(level.setup);
    this.engine.resetFrames([]);
    this.engine.clearHistory();

    this.dom.modeChip.textContent = 'level';
    this.dom.levelLabel.textContent = level.name;
    this.dom.statPar.textContent = String(level.par);
    this.dom.sidePanel.hidden = false;
    this.dom.workspace.classList.add('has-side');
    this.dom.sideKicker.textContent = level.kind;
    this.dom.sideTitle.textContent = level.name;
    this.dom.sideBody.innerHTML = level.intro;
    this.dom.sideGoal.textContent = level.goal;
    this.appendLevelActions(level);
    this.dom.stageTitle.textContent = level.name;
    this.dom.stageSub.textContent = level.desc;

    // quiz UI side effects
    if (level.kind === 'quiz') this.renderQuizPanel();

    this.log(`level: ${level.name}`, 'sys');
    this.log(level.goal, 'out');
    this.render();
  }

  appendLevelActions(level) {
    const actions = document.createElement('div');
    actions.className = 'side-actions';
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn';
    reset.textContent = 'reset';
    reset.addEventListener('click', () => this.resetLevel());
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'btn primary';
    next.textContent = 'levels';
    next.addEventListener('click', () => this.openLevels());
    actions.append(reset, next);
    this.dom.sideBody.appendChild(actions);
  }

  renderQuizPanel() {
    const box = document.createElement('div');
    box.style.marginTop = '12px';
    box.innerHTML = [1, 2, 3, 4]
      .map(
        (i) =>
          `<div style="margin-bottom:10px"><div style="color:var(--muted);font-size:12px;margin-bottom:4px">` +
          `${i}. ${escapeHtml(QUIZ_TEXT[i])}</div>` +
          `<div class="tabs" data-q="${i}">` +
          ['a', 'b', 'c', 'd', 'e']
            .map(
              (c) =>
                `<button type="button" class="tab" data-q="${i}" data-choice="${c}">${c}</button>`,
            )
            .join('') +
          `</div></div>`,
      )
      .join('');
    this.dom.sideBody.appendChild(box);
    box.querySelectorAll('[data-choice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-q');
        const choice = btn.getAttribute('data-choice');
        this.playerMove('answer', [q, choice]);
      });
    });
  }

  applySetup(setup) {
    const s = this.state;
    s.kind = setup.kind ?? s.kind;
    s.mode = setup.mode ?? s.mode;
    s.algo = setup.algo ?? s.algo;
    if (setup.array) s.setArray(setup.array);
    if (setup.sorted) s.sorted = setup.sorted.slice();
    if (setup.target !== undefined) s.target = setup.target;
    if (setup.graph === null && s.kind === 'graph') {
      if (s.mode === 'flow') {
        s.graph = graphPresets().diamond;
        s.graph.directed = true;
      } else if (s.algo === 'topo' || s.algo === 'scc') {
        s.graph = graphPresets().dag;
      } else {
        s.graph = graphPresets().star;
      }
    } else if (setup.graph) {
      s.graph = setup.graph;
    }
    if (setup.meta) s.meta = structuredClone(setup.meta);
    if (!setup.array && s.kind === 'array') {
      // keep existing
    }
    if (s.kind === 'graph' && (!s.graph || !s.graph.nodes?.length)) {
      s.graph = s.mode === 'flow' ? graphPresets().diamond : graphPresets().star;
    }
  }

  resetLevel() {
    this.engine.pause();
    if (this.level) {
      this.moves = 0;
      this.applySetup(this.level.setup);
      this.engine.resetFrames([]);
      this.engine.clearHistory();
      this.log('level reset', 'sys');
    } else {
      this.enterSandbox();
    }
    this.render();
  }

  undo() {
    const snap = this.engine.popHistory();
    if (!snap) {
      this.log('nothing to undo', 'err');
      return;
    }
    this.state.restore(snap);
    if (this.engine.frames.length) {
      this.engine.frames.pop();
      this.engine.cursor = this.engine.frames.length - 1;
    }
    this.moves = Math.max(0, this.moves - 1);
    this.log('undo', 'ok');
    this.render();
  }

  afterDataChange() {
    this.engine.resetFrames([
      {
        type: 'info',
        array: this.state.array.slice(),
        message: 'data ready — `run` to generate steps',
        extra: this.state.kind === 'graph' ? { visited: [], tree: [] } : undefined,
      },
    ]);
    this.render();
  }

  runCurrent() {
    const frames = buildAutoFrames(this.state);
    this.engine.loadFrames(frames);
    this.log(`generated ${frames.length} steps`, 'ok');
    this.engine.play();
    this.checkWin();
  }

  playerMove(name, args) {
    if (name === 'answer') {
      this.handleAnswer(args);
      return;
    }
    this.engine.saveHistory(this.state.snapshot());
    try {
      const frame = playerMove(name, args, this.state);
      this.engine.pushFrame(frame);
      this.moves += 1;
      this.log(frame.message, 'ok');
    } catch (err) {
      this.engine.popHistory();
      this.log(String(err.message || err), 'err');
      return;
    }
    this.checkWin();
    this.render();
  }

  handleAnswer(args) {
    const [q, choice] = args;
    const answers = this.state.meta.answers || (this.state.meta.answers = {});
    answers[String(q)] = String(choice).toLowerCase();
    this.moves += 1;
    this.log(`Q${q} → ${choice}`, 'out');
    this.engine.pushFrame({
      type: 'info',
      message: `answer ${q} = ${choice}`,
    });
    this.checkWin();
    this.render();
  }

  showGolf() {
    const par = this.level?.par;
    if (par == null) {
      this.log(`moves: ${this.moves} (sandbox — no par)`, 'out');
      return;
    }
    const delta = this.moves - par;
    const rank = delta <= 0 ? 'under/equal par' : `+${delta} over par`;
    this.log(`golf: ${this.moves} moves · par ${par} · ${rank}`, delta <= 0 ? 'ok' : 'out');
  }

  showLesson(key) {
    const html = lessons[key];
    if (!html) {
      this.log(`lesson not found: ${key}`, 'err');
      this.log(`try: ${Object.keys(lessons).join(' | ')}`, 'out');
      return;
    }
    this.dom.sidePanel.hidden = false;
    this.dom.workspace.classList.add('has-side');
    this.dom.sideKicker.textContent = 'theory';
    this.dom.sideTitle.textContent = key;
    this.dom.sideBody.innerHTML = html;
    this.dom.sideGoal.textContent = `lesson pack · ${key}`;
    this.log(`lesson: ${key}`, 'sys');
  }

  showLessonQuiz(key) {
    const bank = analysisQuizzes[key];
    if (!bank) {
      this.log(`quiz bank not found: ${key}`, 'err');
      return;
    }
    this.dom.sidePanel.hidden = false;
    this.dom.workspace.classList.add('has-side');
    this.dom.sideKicker.textContent = 'analysis quiz';
    this.dom.sideTitle.textContent = key;
    this.dom.sideBody.innerHTML = bank
      .map(
        (q) =>
          `<div style="margin-bottom:14px" data-qid="${q.id}">` +
          `<div style="margin-bottom:6px"><strong>${escapeHtml(q.prompt)}</strong></div>` +
          `<div class="tabs">` +
          Object.entries(q.choices)
            .map(
              ([c, text]) =>
                `<button type="button" class="tab" data-quiz="${q.id}" data-choice="${c}">${c}) ${escapeHtml(text)}</button>`,
            )
            .join('') +
          `</div><div class="q-feedback" style="font-family:var(--font-mono);font-size:11px;color:var(--muted)"></div></div>`,
      )
      .join('');
    this.dom.sideBody.querySelectorAll('[data-quiz]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-quiz');
        const choice = btn.getAttribute('data-choice');
        const item = bank.find((x) => x.id === id);
        const ok = item && item.answer === choice;
        const fb = btn.closest('[data-qid]')?.querySelector('.q-feedback');
        if (fb) {
          fb.textContent = ok ? `correct — ${item.why}` : `wrong — ${item.why}`;
          fb.style.color = ok ? 'var(--settle)' : 'var(--alert)';
        }
        if (ok) this.toast('correct');
      });
    });
    this.log(`analysis quiz: ${key}`, 'sys');
  }

  buildLevel() {
    const payload = {
      name: this.level?.name || 'custom',
      setup: this.state.snapshot(),
      goal: this.level?.goal || 'sorted',
    };
    this.log(JSON.stringify(payload), 'sys');
    this.toast('level JSON printed to console log');
  }

  checkWin() {
    if (!this.level || this._won) return;
    let won = false;
    try {
      won = !!this.level.win({
        state: this.state,
        engine: this.engine,
        moves: this.moves,
      });
    } catch {
      won = false;
    }
    if (!won) return;
    this._won = true;
    const prev = this.progress[this.level.id];
    if (prev == null || this.moves < prev) {
      this.progress[this.level.id] = this.moves;
      saveProgress(this.progress);
    }
    this.showWin();
    this.render();
  }

  showWin() {
    const lv = this.level;
    const par = lv.par;
    const delta = this.moves - par;
    const verdict =
      delta < 0 ? 'under par — sharp' : delta === 0 ? 'on par' : `${delta} over par`;
    const win = document.createElement('div');
    win.className = 'win-banner';
    win.innerHTML =
      `<strong>Solved.</strong> ${escapeHtml(lv.name)} — ${this.moves} moves (par ${par}, ${verdict}).`;
    this.dom.sideBody.appendChild(win);

    this.log(`level solved · ${this.moves} moves · par ${par}`, 'ok');
    this.toast('Level solved');

    const actions = document.createElement('div');
    actions.className = 'side-actions';
    const again = document.createElement('button');
    again.type = 'button';
    again.className = 'btn';
    again.textContent = 'retry';
    again.addEventListener('click', () => {
      this._won = false;
      this.resetLevel();
    });
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn primary';
    nextBtn.textContent = 'next level';
    nextBtn.addEventListener('click', () => this.gotoNextLevel());
    actions.append(again, nextBtn);
    this.dom.sideBody.appendChild(actions);
  }

  gotoNextLevel() {
    const all = allLevels();
    const idx = all.findIndex((l) => l.id === this.level?.id);
    this._won = false;
    if (idx >= 0 && idx < all.length - 1) {
      this.loadLevel(all[idx + 1].id);
    } else {
      this.openLevels();
    }
  }

  showWelcome() {
    this.dom.modalRoot.hidden = false;
    this.dom.modalRoot.innerHTML =
      `<div class="modal" role="dialog" aria-label="Welcome">` +
      `<div class="modal-head"><div>` +
      `<h2 class="modal-title">LearnAlgo</h2>` +
      `<p class="modal-sub">An interactive algorithm visualization and tutorial</p>` +
      `</div></div>` +
      `<div class="side-body">` +
      `<p>Like LearnGitBranching, but for a first course in algorithms: you get a sandbox, a command line, live visualizations, and golf-scored levels.</p>` +
      `<p>Type <code>levels</code> to open the course, or experiment in sandbox:</p>` +
      `<ul>` +
      `<li><code>array random 12</code> · <code>set sort quick</code> · <code>run</code></li>` +
      `<li><code>graph load star</code> · <code>set graph dijkstra</code> · <code>run</code></li>` +
      `<li><code>set dp lcs</code> · <code>run</code></li>` +
      `</ul>` +
      `</div>` +
      `<div class="side-actions"><button type="button" class="btn primary" id="welcome-levels">browse levels</button>` +
      `<button type="button" class="btn" id="welcome-close">sandbox</button></div>` +
      `</div>`;
    this.dom.modalRoot.querySelector('#welcome-levels').addEventListener('click', () => {
      this.dom.modalRoot.hidden = true;
      this.openLevels();
    });
    this.dom.modalRoot.querySelector('#welcome-close').addEventListener('click', () => {
      this.dom.modalRoot.hidden = true;
      this.dom.consoleInput.focus();
    });
  }

  toast(msg) {
    const t = this.dom.toast;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      t.hidden = true;
    }, 2200);
  }

  render() {
    const frame = this.engine.current();
    const kind = this.state.kind;

    const handled = frame?.extra?.kind ? this.viz.extra.render(frame, this.state) : false;
    if (!handled) {
      let targetViz = this.viz.array;
      if (kind === 'graph') targetViz = this.viz.graph;
      else if (kind === 'matrix') targetViz = this.viz.matrix;
      else targetViz = this.viz.array;

      targetViz.render(frame, {
        array: this.state.array,
        target: this.state.target,
        graph: this.state.graph,
      });
    }

    const items = handled
      ? this.viz.extra.legend()
      : kind === 'graph'
        ? this.viz.graph.legend()
        : kind === 'matrix'
          ? this.viz.matrix.legend()
          : this.viz.array.legend();
    this.dom.legend.innerHTML = items
      .map(
        ([name, color]) =>
          `<span class="legend-item"><span class="swatch" style="background:${color}"></span>${escapeHtml(
            name,
          )}</span>`,
      )
      .join('');

    this.dom.statMoves.textContent = String(this.moves);
    this.dom.statSteps.textContent = String(Math.max(0, this.engine.cursor + 1));
    const playBtn = document.getElementById('btn-play');
    playBtn.textContent = this.engine.playing ? 'pause' : 'play';

    if (this.mode === 'sandbox') {
      const algo = `${this.state.mode}:${this.state.algo}`;
      const titles = {
        array: `Array · ${algo}`,
        graph: `Graph · ${algo}`,
        matrix: `DP · ${algo}`,
        tree: `Structure · ${algo}`,
      };
      this.dom.stageTitle.textContent = titles[kind] || `Lab · ${algo}`;
      this.dom.stageSub.textContent =
        'Commands mutate state. `run` generates steps. `levels` for the course.';
    }
  }
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* ignore */
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function splitCommands(cmd) {
  return cmd
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}
