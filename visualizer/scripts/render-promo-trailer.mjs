import { createRequire } from 'node:module';
import { mkdir, access, copyFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Use the desktop's bundled Playwright without changing application dependencies.
const require = createRequire(process.env.PLAYWRIGHT_PACKAGE || 'C:/Users/abd/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs/promo/export');
await mkdir(out, { recursive: true });
const narrationPath = path.join(out, 'voiceover.wav');
await access(narrationPath).catch(() => { throw new Error('Generate neural narration first: run scripts/build-promo-voiceover.py.'); });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const app = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  const base = process.env.PROMO_APP_URL || 'http://127.0.0.1:3011';
  await app.goto(base);
  await app.waitForSelector('.cards-grid');
  await app.evaluate(() => localStorage.setItem('cpviz.welcome.v1', 'dismissed'));
  for (const [name, hash, ready] of (process.env.PROMO_RENDER_ONLY ? [] : [
    ['home', '', '.welcome-hero'], ['sum', '#two-sum', '.pc'],
    ['graph', '#network-delay-time', '.pc'], ['queens', '#n-queens', '.pc'],
    ['dp', '#unique-paths', '.pc'],
    ['learn', '#prerequisites', '.learning-page'],
    ['brace', '#brace-expansion-ii', '.pc'],
    ['playground', 'docs/promo/playground-preview.html', '.runtime-playground'],
  ])) {
    if (process.env.PROMO_CAPTURE_ONLY && name !== process.env.PROMO_CAPTURE_ONLY) continue;
    await app.goto(base + '/' + hash);
    await app.reload();
    await app.waitForSelector(ready, { timeout: 30000 });
    await app.waitForTimeout(1800);
    await app.addStyleTag({ content: '.two-sum-tour-layer,.two-sum-tour-launch,.chat-fab{visibility:hidden!important}' });
    if (['sum', 'graph', 'queens', 'brace', 'dp'].includes(name)) {
      const story = app.locator('summary').filter({ hasText: /^Story:/ }).first();
      if (await story.count()) await story.click();
      const overlay = app.getByLabel('Show pattern overlay', { exact: true }).first();
      if (await overlay.count() && await overlay.isChecked()) await overlay.uncheck();
      if (name === 'sum') {
        const inputs = app.locator('input');
        for (let n = 0; n < await inputs.count(); n++) {
          const input = inputs.nth(n), value = await input.inputValue();
          if (value.startsWith('[')) await input.fill('[2,7,11,15]');
          if (value === '17') await input.fill('9');
        }
      }
      const next = app.locator('.pc button:visible').filter({ hasText: /^Next$/ }).first();
      if (await next.count()) for (let i = 0; i < (name === 'sum' ? 9 : 12); i++) await next.click();
      if (name === 'sum') {
        await app.waitForTimeout(400);
        await app.screenshot({ path: path.join(out, 'floating.png') });
      }
      const dock = app.locator('.floating-panel-pin:visible').first();
      if (await dock.count()) await dock.click();
      await app.waitForTimeout(700);
    }
    if (name === 'playground') {
      await app.getByRole('button', { name: 'Viz script', exact: true }).evaluate(button => button.click());
      await app.waitForTimeout(3000);
    }
    await app.screenshot({ path: path.join(out, `${name}.png`) });
    if (name === 'sum') await copyFile(path.join(out, 'floating.png'), path.join(out, 'sum.png'));
    if (name === 'home') {
      await app.getByRole('button', { name: 'Help & tutorial', exact: true }).click();
      await app.waitForTimeout(600);
      await app.screenshot({ path: path.join(out, 'tutorial.png') });
      await app.getByRole('button', { name: 'End guided tour', exact: true }).click();
    }
    if (name === 'learn') {
      const expand = app.locator('.learning-expand:visible').first();
      if (await expand.count()) await expand.click();
      const guide = app.locator('.learning-node-guide:visible').first();
      if (await guide.count()) await guide.click();
      await app.waitForTimeout(500);
      await app.screenshot({ path: path.join(out, 'guide.png') });
    }
    if (name === 'sum') {
      for (const [label, selector, count] of [
        ['zoom-in', '[aria-label="Zoom in"]', 3],
        ['zoom-out', '[aria-label="Zoom out"]', 5],
        ['hidden', '[aria-label="Collapse Code"]', 1],
        ['restored', '[data-restore-panel="code"]', 1],
      ]) {
        const control = app.locator(selector + ':visible').first();
        if (!(await control.count())) throw new Error(`Missing real workspace control: ${selector}`);
        for (let j = 0; j < count; j++) await control.click();
        await app.waitForTimeout(300);
        await app.screenshot({ path: path.join(out, `${label}.png`) });
      }
      const divider = app.locator('[aria-label="Resize panels"]:visible').first();
      const box = await divider.boundingBox();
      if (!box) throw new Error('Workspace resize divider missing');
      await app.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await app.mouse.down(); await app.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2, { steps: 12 }); await app.mouse.up();
      await app.screenshot({ path: path.join(out, 'resized.png') });
      const float = app.getByRole('button', { name: 'Float', exact: true }).first();
      if (await float.count()) { await float.click(); await app.screenshot({ path: path.join(out, 'floating.png') }); }
      const select = app.locator('.ctp-panel .code-select-toggle:visible').first();
      if (await select.count()) await select.click();
      // Use the real code-selection controls in this isolated fresh browser.
      const lines = app.locator('.ctp-row[data-line]:visible');
      if (await lines.count()) { await lines.nth(1).click(); await lines.nth(3).click({ modifiers: ['Shift'] }); }
      await app.screenshot({ path: path.join(out, 'selection.png') });
      const attach = app.getByRole('button', { name: 'Attach to chat', exact: true }).first();
      if (await attach.isEnabled()) await attach.click();
      await app.waitForTimeout(400);
      await app.screenshot({ path: path.join(out, 'attached.png') });
    }
    console.log(`Captured actual UI: ${name}`);
  }
  await app.close();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(base + '/docs/promo/trailer.html');
  await page.waitForFunction(() => window.renderFrame);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all(['sum','graph','queens','dp','learn','guide','tutorial','brace','playground','selection','attached','zoom-in','zoom-out','hidden','restored','resized','floating'].map(name => new Promise((resolve, reject) => { const img = new Image(); img.onload = resolve; img.onerror = () => reject(new Error(`Missing shot ${name}`)); img.src = `export/${name}.png`; }))));
  const fps = 24, duration = 72;
  const videoPath = path.join(out, 'picture.mp4');
  const encoder = spawn('ffmpeg.exe', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-vcodec', 'mjpeg', '-i', 'pipe:0', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', videoPath], { stdio: ['pipe', 'inherit', 'inherit'] });
  const completed = once(encoder, 'exit');
  encoder.stdin.on('error', error => console.error(error.message));
  for (let frame = 0; frame < fps * duration; frame++) {
    await page.evaluate(t => window.renderFrame(t), frame / fps);
    const data = await page.screenshot({ type: 'jpeg', quality: 94 });
    if (!encoder.stdin.write(data)) await once(encoder.stdin, 'drain');
    if (frame % (fps * 4) === 0) console.log(`Rendered ${frame / fps}s / ${duration}s`);
    if ([48, 168, 312, 384, 456, 504, 600, 648, 696, 744, 792, 840, 888, 936, 1032, 1200, 1392, 1488, 1632].includes(frame)) await page.screenshot({ path: path.join(out, `review-${frame}.png`) });
  }
  encoder.stdin.end();
  const [code] = await completed;
  if (code !== 0) throw new Error(`Video encoder exited with ${code}`);
  // Map only the new narrator track. No original music or effects enter the export.
  const voicedFilm = path.join(out, 'teem-treat-promo-voiceover.mp4');
  const mux = spawn('ffmpeg.exe', ['-hide_banner', '-loglevel', 'error', '-y', '-i', videoPath, '-i', narrationPath, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', voicedFilm], { stdio: 'inherit' });
  const [muxCode] = await once(mux, 'exit');
  if (muxCode) throw new Error('Narration mux failed');
  await copyFile(voicedFilm, path.join(out, 'teem-treat-promo.mp4'));
  console.log('Finished: docs/promo/export/teem-treat-promo-voiceover.mp4 (narration only)');
} finally { await browser.close(); }
