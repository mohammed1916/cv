import { launch, waitFor, sleep } from './cdp.mjs';
const [slug, examplesJson, badInput] = process.argv.slice(2);
let examples = examplesJson === 'auto' ? [] : JSON.parse(examplesJson);
const b = await launch('/private/tmp/claude-502/-Volumes-S-Development-a-competitive-programming-visualisations-visualizer/6986ac26-827a-43c7-bd01-b0f1290980ea/scratchpad/browser/profile');
const results = {};
const q = async (expr) => b.evaluate(expr);
const counter = `(() => { const t=[...document.querySelectorAll('span')].map(s=>s.textContent).find(t=>/^\\d+ \\/ \\d+$/.test(t)); return t || null; })()`;
const clickBtn = (label) => `(() => { const btn=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(label)}); if(!btn) return false; btn.click(); return true; })()`;
const setRange = (v) => `(() => { const el=document.querySelector('input[aria-label="Algorithm timeline"]'); const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; set.call(el,'${v}'); el.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`;
const lineText = `(() => { const t=[...document.querySelectorAll('p,div,span')].map(e=>e.textContent).find(t=>t.includes('Pseudocode line')); return t||null; })()`;
const errors = `(() => [...document.querySelectorAll('[role=alert]')].map(e=>e.textContent).join(' | ') || null)()`;
const sleep2 = () => sleep(350);

await b.navigate(`http://127.0.0.1:3010/#${slug}`);
await waitFor(q, `!!document.querySelector('input[aria-label="Algorithm timeline"]')`);
await sleep(800);
if (examplesJson === 'auto') examples = await q(`(() => { const run=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Run input'); if(!run) return []; return [...run.parentElement.querySelectorAll('button')].map(x=>x.textContent.trim()).filter(t=>t && t!=='Run input'); })()`);
results.discoveredExamples = examples;
results.startCounter = await q(counter);
await q(clickBtn('Next')); await sleep2();
results.afterNext = await q(counter);
results.lineAfterNext = await q(lineText);
await q(clickBtn('Prev')); await sleep2();
results.afterPrev = await q(counter);
const total = Number((results.startCounter||'').split('/')[1]);
await q(setRange(String(total - 1))); await sleep2();
results.lastCounter = await q(counter);
results.lastEvent = await q(`document.querySelector('[role=status]')?.textContent || null`);
results.lastLine = await q(lineText);
await q(clickBtn('Reset')); await sleep2();
results.afterReset = await q(counter);
results.hasPython = await q(`[...document.querySelectorAll('button')].some(x=>x.textContent.trim()==='Python')`);
await q(clickBtn('Python')); await sleep2();
results.pythonShowsPython = await q(`document.body.innerText.includes(${JSON.stringify(process.env.PY_MARK || 'def ')})`);
await q(clickBtn('Pseudocode')); await sleep2();
results.pseudoShowsPseudo = await q(`document.body.innerText.includes(${JSON.stringify(process.env.PSEUDO_MARK || '')})`);
results.examples = {};
for (const ex of examples) {
  const clicked = await q(clickBtn(ex));
  await sleep(500);
  results.examples[ex] = { clicked, counter: await q(counter), error: await q(errors) };
}
if (badInput) {
  // type into the run input and submit
  await q(`(() => { const el=document.querySelector('input[type=text], textarea'); if(!el) return false; const set=Object.getOwnPropertyDescriptor(el.constructor.prototype,'value').set; set.call(el, ${JSON.stringify(badInput)}); el.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
  await q(clickBtn('Run input')); await sleep(600);
  results.badInputError = await q(errors);
  results.badInputCounter = await q(counter);
}
console.log(JSON.stringify(results, null, 1));
b.close();
