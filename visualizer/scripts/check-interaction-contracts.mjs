import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parse } from '@babel/parser';
import { createServer } from 'vite';

const files = fs.readdirSync('src', { recursive: true }).filter(f => f.endsWith('.jsx'));
const failures = [], splitHandlers = [], inlineInputs = [];
let controls = 0;
function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (node.type) visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(v => walk(v, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}
function children(node) {
  return (node.children || []).flatMap(n => n.type === 'JSXFragment' ? children(n) : [n]);
}
for (const file of files) {
  const ast = parse(fs.readFileSync(`src/${file}`, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
  walk(ast, node => {
    if (node.type === 'VariableDeclarator' && node.init?.callee?.name === 'usePlaybackState' && node.id.type === 'ObjectPattern') {
      const supported = new Set(['stepIndex','setStepIndex','isPlaying','setIsPlaying','speed','setSpeed','stepForward','stepBack','togglePlay','handleReset','isDone','canNext','canPrev','currentStep','activeStepIndex','setActiveStepIndex','togglePlayback','reset']);
      for (const prop of node.id.properties) if (prop.key && !supported.has(prop.key.name)) failures.push(`${file}: unsupported playback state ${prop.key.name}`);
    }
    if (node.type === 'JSXElement') {
      const names = children(node).map(n => n.openingElement?.name?.name);
      if (names.includes('ManualInputPanel') && names.includes('LuminoDockPanel')) inlineInputs.push(file);
    }
    if (node.type !== 'JSXOpeningElement' || node.name.name !== 'PlaybackControls') return;
    controls++;
    const props = new Map(node.attributes.map(a => [a.name?.name, a.value?.expression]));
    if (!node.attributes.some(a => a.type === 'JSXSpreadAttribute')) {
      for (const name of ['onNext', 'onPrev']) if (!props.has(name) && !(props.has('onStepChange') && props.has('activeStep'))) failures.push(`${file}: missing ${name} handler`);
      if (!props.has('onReset')) failures.push(`${file}: missing reset handler`);
      if (!props.has('onSpeedChange') && props.get('showSpeed')?.value !== false) failures.push(`${file}: visible speed without handler`);
    }
    if (!props.has('onPlayToggle') && !props.has('onTogglePlayback')) {
      if (props.has('onPlay') && props.has('onPause')) splitHandlers.push(file);
      else if (!node.attributes.some(a => a.type === 'JSXSpreadAttribute')) failures.push(`${file}: missing Play/Pause handler`);
    }
    if (props.get('onSpeedChange')?.name === 'setSpeed') failures.push(`${file}: raw state setter receives a DOM event as speed`);
  });
}

// Exercise the actual shared component's rendered buttons, including the
// alternate contract used by Highest Answer Rate. No browser is simulated.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: Controls } = await server.ssrLoadModule('/src/components/PlaybackControls.jsx');
  const find = (node, label) => {
    if (node?.type === 'button' && node.props.children === label) return node;
    return [node?.props?.children].flat(Infinity).map(n => typeof n === 'object' ? find(n, label) : null).find(Boolean);
  };
  for (const isPlaying of [false, true]) {
    let called = '';
    const tree = Controls({ isPlaying, speed: 500, onPlay: () => { called = 'play'; }, onPause: () => { called = 'pause'; } });
    find(tree, isPlaying ? 'Pause' : 'Play').props.onClick();
    assert.equal(called, isPlaying ? 'pause' : 'play');
  }
  for (const key of ['onPlayToggle', 'onTogglePlayback']) {
    let called = false;
    const tree = Controls({ speed: 500, isDone: true, [key]: () => { called = true; } });
    find(tree, 'Replay').props.onClick();
    assert.equal(called, true);
  }
} finally { await server.close(); }
const report = { componentsScanned: files.length, controls, splitHandlers, inlineInputs, failures };
fs.writeFileSync('docs/interaction-contract-audit.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, inlineInputs: inlineInputs.length }, null, 2));
process.exitCode = failures.length ? 1 : 0;
