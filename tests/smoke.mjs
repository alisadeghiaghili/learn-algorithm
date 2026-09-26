/**
 * Headless smoke test for the LearnAlgo UI.
 * Run: node tests/smoke.mjs
 */
import { chromium } from 'playwright';
import { createServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const server = await createServer({
  root,
  server: { port: 5173, strictPort: false, host: '127.0.0.1' },
  logLevel: 'error',
});
await server.listen();
const urls = server.resolvedUrls?.local ?? [];
const url = urls[0] ?? 'http://127.0.0.1:5173/';
console.log('serving', url);

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    const text = msg.text();
    // favicon / optional font CDNs are non-fatal
    if (/favicon|fonts\.googleapis|fonts\.gstatic|ERR_FAILED|ERR_NAME_NOT_RESOLVED|404/.test(text)) return;
    errors.push(text);
  }
});
page.on('requestfailed', (req) => {
  const u = req.url();
  if (/favicon|fonts\./.test(u)) return;
});

await page.goto(url, { waitUntil: 'networkidle' });

// dismiss welcome
const welcome = page.locator('#welcome-close');
if (await welcome.count()) await welcome.click();

async function cmd(line) {
  await page.fill('#console-input', line);
  await page.press('#console-input', 'Enter');
  await page.waitForTimeout(80);
}

// sandbox algorithm run
await cmd('array set 5,2,8,1,9');
await cmd('set sort bubble');
await cmd('run');
await page.waitForTimeout(400);
const svgBars = await page.locator('#stage svg .bar').count();
if (svgBars < 5) throw new Error(`expected 5 bars, got ${svgBars}`);

// levels browser
await cmd('levels');
await page.waitForSelector('.level-row');
const levelCount = await page.locator('.level-row').count();
if (levelCount < 3) throw new Error('levels list missing');
await page.click('.level-row[data-level="intro-2"]');
await page.waitForTimeout(100);

// manual golf sort 3,1,2 → 1,2,3
await cmd('swap 0 1'); // 1,3,2
await cmd('swap 1 2'); // 1,2,3
await page.waitForTimeout(150);
const win = await page.locator('.win-banner').count();
if (!win) throw new Error('expected win banner after sorting intro-2');
const overlay = await page.locator('.win-overlay').count();
if (!overlay) throw new Error('expected win overlay after solving');

// graph path
await cmd('sandbox');
await cmd('graph load star');
await cmd('set graph dijkstra');
await cmd('run');
await page.waitForTimeout(300);
const nodes = await page.locator('#stage svg .node-circle').count();
if (nodes < 5) throw new Error(`expected graph nodes, got ${nodes}`);

// dp
await cmd('set dp fib');
await cmd('run');
await page.waitForTimeout(200);
const cells = await page.locator('#stage svg .cell').count();
if (cells < 5) throw new Error(`expected dp cells, got ${cells}`);

await page.screenshot({ path: path.join(root, 'tests', 'smoke-sandbox.png'), fullPage: true });

if (errors.length) {
  console.error('page errors:', errors);
  throw new Error('console/page errors present');
}

console.log('smoke ok');
await browser.close();
await server.close();
