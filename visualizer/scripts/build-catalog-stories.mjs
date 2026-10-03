import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from '@babel/parser';
import { SOLUTION_CODE_REGISTRY } from '../src/config/solutionCodeRegistry.js';
import { catalogStoryOverrides } from '../src/components/shared/catalogStoryOverrides.js';
import { catalogEdgeCases } from '../src/components/shared/catalogEdgeCases.js';

const root = path.resolve('src/problems');
const existing = new Set([12,13,29,47,116,117,118,119,120,121,122,123,124,125,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,1096].map(String));
const cache = new Map();
function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (['loc','start','end','extra','comments','tokens'].includes(key)) continue;
    if (Array.isArray(value)) value.forEach(item => walk(item, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}
const literal = node => node?.type === 'StringLiteral' ? node.value
  : node?.type === 'TemplateLiteral' && !node.expressions.length ? node.quasis[0].value.cooked : null;
function inspect(file, visited = new Set()) {
  if (visited.has(file)) return [];
  visited.add(file);
  if (!cache.has(file)) {
    const source = fs.readFileSync(file, 'utf8');
    cache.set(file, { source, tree: parse(source, { sourceType: 'module', plugins: ['jsx'] }) });
  }
  const entry = { file, ...cache.get(file) };
  const entries = [entry];
  for (const node of entry.tree.program.body) {
    const specifier = node.source?.value;
    if (!specifier?.startsWith('.')) continue;
    const base = path.resolve(path.dirname(file), specifier);
    if (!base.startsWith(root + path.sep)) continue;
    const dependency = [base, base+'.js', base+'.jsx', path.join(base,'index.jsx')]
      .find(candidate => /\.jsx?$/.test(candidate) && fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (dependency && !/Narrative|storyGuide/.test(dependency)) entries.push(...inspect(dependency, visited));
  }
  return entries;
}

const inventory = [], missing = [];
for (const folder of fs.readdirSync(root).sort()) {
  const directory = path.join(root, folder), entry = path.join(directory, 'index.jsx');
  if (!fs.existsSync(entry) || !fs.existsSync(path.join(directory,'meta.js'))) continue;
  const { meta } = await import(pathToFileURL(path.join(directory,'meta.js')));
  if (!meta?.number || !meta?.title) continue; // Same route contract as App.jsx.
  if (existing.has(String(meta.number))) {
    inventory.push({ folder, number: meta.number, title: meta.title, kind: 'authored-workspace' });
    continue;
  }
  const entries = inspect(entry);
  const codeCandidates = [], validation = [], phasePurposes = {}, phases = new Set();
  for (const { tree } of entries) walk(tree, node => {
    if (node.type === 'VariableDeclarator' && /code/i.test(node.id?.name ?? '')) {
      const array = node.init?.type === 'ArrayExpression' ? node.init : node.init?.callee?.object;
      if (array?.type === 'ArrayExpression') {
        const lines = array.elements.map(item => literal(item) ?? literal(item?.properties?.find(p=>p.key?.name==='text')?.value));
        if (lines.length && lines.every(line => typeof line === 'string')) codeCandidates.push(lines);
      }
      let expression = node.init;
      while (expression?.type === 'CallExpression' && expression.callee?.type === 'MemberExpression') expression = expression.callee.object;
      const multiline = literal(expression);
      if (multiline?.includes('\n')) codeCandidates.push(multiline.split('\n'));
      if (array?.type === 'ArrayExpression' && /patterns/i.test(node.id?.name ?? '')) {
        array.elements.map(literal).filter(Boolean).forEach(phase=>phases.add(phase));
      }
    }
    if (node.type === 'VariableDeclarator' && /patterns/i.test(node.id?.name ?? '') && node.init?.type === 'ArrayExpression') {
      node.init.elements.map(literal).filter(Boolean).forEach(phase=>phases.add(phase));
    }
    if (node.type === 'CallExpression' && /^(push|snap|snapshot|addStep|recordStep|emit|record)$/.test(node.callee?.name ?? '')) {
      node.arguments.slice(0,2).map(literal).filter(s=>s && /^[a-z][a-z_-]{1,30}$/.test(s)).forEach(phase=>phases.add(phase));
    }
    if (node.type === 'ObjectExpression') {
      const props = Object.fromEntries(node.properties.filter(p=>p.type==='ObjectProperty').map(p=>[p.key.name ?? p.key.value, p.value]));
      const phase = literal(props.phase) ?? literal(props.id);
      if (phase && /^[a-z][\w-]*$/i.test(phase)) {
        if (props.phase || props.description) phases.add(phase);
        const purpose = literal(props.explanation) ?? literal(props.description);
        if (purpose && purpose.length > 20) phasePurposes[phase] = purpose;
      }
    }
    if ((node.type==='NewExpression'||node.type==='CallExpression') && node.callee?.name==='Error') {
      const message = literal(node.arguments[0]);
      if (message && message.length>10) validation.push(message);
    }
  });
  const override = catalogStoryOverrides[meta.number];
  const strategy = override?.[0] ?? meta.description;
  if (!strategy || strategy.length < 30) missing.push(`${folder}: missing strategy`);
  const code = (SOLUTION_CODE_REGISTRY[meta.slug] ?? []).map(row=>typeof row==='string'?row:row.text);
  const sourceCode = codeCandidates.sort((a,b)=>b.length-a.length)[0] ?? code;
  // Preserve the explicit decision and its effect, rather than guessing an
  // expected result for an unexecuted input. Runtime code is also inspected.
  const checks = [];
  for (let i=0;i<sourceCode.length;i++) {
    const match = sourceCode[i].trim().match(/^(?:if|elif)\s+(.+?):\s*(.*)$/);
    if (!match) continue;
    const action = match[2] || sourceCode[i+1]?.trim();
    if (action && /^(?:return|raise|break|continue)\b/.test(action)) checks.push({ condition: match[1], outcome: action });
  }
  const guide = {
    number: String(meta.number), title: meta.title,
    goal: meta.description && meta.description !== strategy ? meta.description : `Solve ${meta.title}: ${strategy ?? ''}`,
    strategy,
    phases: [...phases], phasePurposes,
    edgeCases: [override?.[1], catalogEdgeCases[meta.number]].filter(Boolean),
    checks: [...new Map(checks.map(check=>[JSON.stringify(check),check])).values()],
    inputRules: [...new Set(validation)].slice(0,12),
    source: entries.map(({file})=>path.relative(path.resolve('.'),file).replaceAll('\\','/')),
  };
  if (!guide.edgeCases.length && !guide.checks.length && !guide.inputRules.length) missing.push(`${folder}: no boundary evidence`);
  fs.writeFileSync(path.join(directory,'storyGuide.json'),JSON.stringify(guide,null,2)+'\n');
  inventory.push({folder,number:meta.number,title:meta.title,kind:'catalog-story',checks:guide.checks.length,rules:guide.inputRules.length,edgeNotes:guide.edgeCases.length});
}
fs.writeFileSync('docs/catalog-story-inventory.json',JSON.stringify({routes:inventory.length,entries:inventory,missing},null,2)+'\n');
console.log(`${inventory.length} routes; ${inventory.filter(x=>x.kind==='catalog-story').length} catalog guides.`);
console.log(missing.join('\n'));
if (missing.length) process.exitCode=1;
