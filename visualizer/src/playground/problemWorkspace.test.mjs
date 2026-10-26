import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createProblemWorkspace, readProblemWorkspace, workspaceKeys, staircaseFromTrace } from './problemWorkspace.js';
import { getSolutionCode } from '../config/solutionCodeRegistry.js';
import { PYTHON_TRACER_SOURCE } from './runtime/python/pythonTracerSource.js';
import { compilePythonTrace } from './runtime/python/compilePythonTrace.js';
const source = getSolutionCode('climbing-stairs').map(line => line.text).join('\n');
const storage = () => {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key), data };
};
test('imports arbitrary problems with real inputs and qualified Python methods', () => {
  const store = storage();
  const source = 'class Solution:\n    def myAtoi(self, s):\n        return int(s)';
  const metadata = createProblemWorkspace(store, { source, input: { s: '42' }, slug: 'string-to-integer-atoi', title: 'Atoi' }, 'atoi');
  assert.equal(metadata.entry, 'Solution.myAtoi');
  assert.equal(readProblemWorkspace(store, '?workspace=atoi').slug, 'string-to-integer-atoi');
  assert.deepEqual(JSON.parse(store.getItem(workspaceKeys('atoi').input)), { s: '42' });
  createProblemWorkspace(store, { source: 'def isPalindrome(x: int):\n    return True', slug: 'palindrome-number' }, 'sample');
  assert.deepEqual(JSON.parse(store.getItem(workspaceKeys('sample').input)), { x: 4 });
});
test('imports into isolated persistent keys and never replaces the original draft', () => {
  const store = storage();
  store.setItem(workspaceKeys().pythonSource, 'my existing code');
  createProblemWorkspace(store, { source, input: { n: 5 } }, 'test-workspace');
  assert.equal(store.getItem(workspaceKeys().pythonSource), 'my existing code');
  assert.equal(readProblemWorkspace(store, '?workspace=test-workspace').source, source);
  assert.equal(JSON.parse(store.getItem(workspaceKeys('test-workspace').input)).n, 5);
  assert.throws(() => createProblemWorkspace(store, { source, input: { n: 5 } }, 'test-workspace'));
});
test('failed writes roll back only the new workspace', () => {
  const store = storage();
  store.setItem('existing', 'keep');
  const write = store.setItem;
  let count = 0;
  store.setItem = (key, value) => { if (++count === 3) throw new Error('quota'); write(key, value); };
  assert.throws(() => createProblemWorkspace(store, { source, input: { n: 5 } }, 'quota-test'));
  assert.deepEqual([...store.data], [['existing', 'keep']]);
});
test('unsupported code and invalid inputs cannot drive the staircase', () => {
  assert.equal(staircaseFromTrace({ source: source + '\n# edit', referenceSource: source, input: { n: 5 } }).supported, false);
  assert.equal(staircaseFromTrace({ source, referenceSource: source, input: { n: 0 } }).supported, false);
  assert.equal(staircaseFromTrace({ source, referenceSource: source, input: { n: 5 }, traceFrames: [], index: -1 }).supported, false);
});
test('staircase values follow real executed Python frames at each update', () => {
  for (const [n, expected] of [[1,1], [2,2], [5,8], [10,89], [45,1836311903]]) {
    const globals = { __trace_source: source, __trace_input_json: JSON.stringify({ n }), __trace_entry_json: JSON.stringify('Solution.climbStairs'), __trace_max_frames: 240 };
    const result = spawnSync('python', ['-c', 'import json,sys\nscope=json.loads(sys.argv[1])\nexec(sys.stdin.read(),scope,scope)\nprint(scope["__trace_result_json"])', JSON.stringify(globals)], { input: PYTHON_TRACER_SOURCE, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const trace = JSON.parse(result.stdout);
    assert.equal(trace.error, undefined, trace.error?.message);
    assert.equal(compilePythonTrace(trace).frames.length, trace.traceFrames.length);
    for (let index = 0; index < trace.traceFrames.length; index++) {
      const mapped = staircaseFromTrace({ source, referenceSource: source, input: { n }, traceFrames: trace.traceFrames, index });
      const frame = trace.traceFrames[index];
      if (frame.line === 7) assert.equal(mapped.dp[frame.locals.i + 2], frame.locals.one);
    }
    const final = staircaseFromTrace({ source, referenceSource: source, input: { n }, traceFrames: trace.traceFrames, index: trace.traceFrames.length - 1 });
    assert.equal(final.dp[n], expected);
  }
});
