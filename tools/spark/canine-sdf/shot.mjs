// Spark: render one canine-builder view to PNG with headless Chromium.
// node tools/spark/canine-sdf/shot.mjs <dog> <mode> <yaw> <out.png> [w] [h]
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const [dog = 'wolf', mode = 'clay', yaw = '0', out = 'out.png', w = '1600', h = '1000'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }).catch(() => chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }));
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('console', m => console.log('page:', m.text()));
await page.goto(`file://${here}/render.html?dog=${dog}&mode=${mode}&yaw=${yaw}&w=${w}&h=${h}`);
await page.waitForFunction(() => document.title.startsWith('DONE') || document.title.startsWith('ERR'), null, { timeout: 600000, polling: 500 });
const t = await page.title(); if (t.startsWith('ERR')) { console.error(t); process.exit(1); }
await page.locator('canvas').screenshot({ path: out });
console.log('wrote', out, t);
await browser.close();
