import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspaceContext, runWorkspaceAgent } from './workspaceContext.js';
import { suggestPythonInputs } from './suggestPythonBindings.js';

test('exact pages recover long source and instruction without losing the tail', () => {
  const source = '# padding\n'.repeat(5000) + 'def important_tail(): return 99';
  const context = createWorkspaceContext({ source });
  let recovered = '', offset = 0;
  do {
    const result = context.execute({ tool: 'read', resource: 'source', offset, count: 2000 });
    recovered += result.text;
    offset = result.nextOffset;
  } while (offset !== null);
  assert.equal(recovered, source);
  const result = context.execute({ tool: 'search', query: 'important_tail' });
  assert.match(result.page.text, /return 99/);
});

test('statistics cover the complete large array and input pages preserve exact values', () => {
  const values = Array.from({ length: 100000 }, (_, i) => i);
  values[99999] = -10;
  const context = createWorkspaceContext({ inputSource: JSON.stringify({ values }) });
  assert.deepEqual(context.execute({ tool: 'stats', path: ['values'] }), {
    count: 100000, min: -10, max: 99998, ascending: false, coverage: 'Entire input array, no sampling',
  });
  assert.deepEqual(context.execute({ tool: 'input', path: ['values'], offset: 99998 }).page, [99998, -10]);
  assert.throws(() => context.execute({ tool: 'input', path: ['__proto__'] }), /does not exist/);
  assert.throws(() => context.execute({ tool: 'read', resource: 'source', offset: -1 }), /Invalid offset/);
});

test('input generation retrieves an instruction tail before producing a validated result', async () => {
  const instruction = 'Use positives. '.repeat(150) + 'Actually include -99.';
  let calls = 0;
  const result = await suggestPythonInputs({ source: 'def solve(nums): return nums', inputSource: '{}', instruction }, {
    config: { provider: 'ollama-local', contextTokens: 16384 },
    stream: async function* (messages) {
      calls++;
      if (calls <= 2) {
        assert.doesNotMatch(messages[1].text, /Actually include/);
        yield JSON.stringify({ contextRequest: { tool: 'read', resource: 'instruction', offset: (calls - 1) * 2000, count: 2000 } });
      } else {
        assert.match(messages.at(-1).text, /Actually include -99/);
        yield '{"inputs":{"nums":[-99]},"summary":"Included the requested negative value."}';
      }
    },
  });
  assert.equal(calls, 3);
  assert.deepEqual(JSON.parse(result.inputSource), { nums: [-99] });
});

test('unread instructions and exhausted budgets fail explicitly', async () => {
  const stream = async function* () { yield '{"inputs":[]}'; };
  const messages = [{ role: 'system', text: 'Generate inputs.' }];
  await assert.rejects(runWorkspaceAgent(messages, { source: '# large program\n'.repeat(100) }, {
    stream, config: { contextTokens: 8192 },
  }), /without inspecting the source/);
  await assert.rejects(runWorkspaceAgent(messages, { instruction: 'x'.repeat(2500) }, {
    stream, config: { contextTokens: 8192 },
  }), /complete request/);
  await assert.rejects(runWorkspaceAgent([{ role: 'system', text: 'x'.repeat(9000) }], {}, {
    stream, config: { contextTokens: 8192 },
  }), /budget is exhausted/);
});

test('input suggestions can inspect a function beyond the former source cutoff', async () => {
  const source = '# padding\n'.repeat(4000) + '\ndef solve(nums):\n    return nums[0]';
  let calls = 0;
  const result = await suggestPythonInputs({ source, inputSource: '{}' }, {
    config: { provider: 'ollama-local', contextTokens: 8192 },
    stream: async function* (messages) {
      calls++;
      if (calls === 1) yield '{"contextRequest":{"tool":"search","query":"def solve"}}';
      else {
        assert.match(messages.at(-1).text, /return nums\[0\]/);
        yield '{"inputs":{"nums":[7]}}';
      }
    },
  });
  assert.deepEqual(JSON.parse(result.inputSource), { nums: [7] });
  assert.equal(calls, 2);
});

test('frame pages expose recorded snapshots and repeated tool calls terminate', async () => {
  const context = createWorkspaceContext({ traceResult: { traceFrames: [{ locals: { n: 7 } }] } });
  assert.deepEqual(JSON.parse(context.execute({ tool: 'frame', index: 0 }).text), { locals: { n: 7 } });
  await assert.rejects(runWorkspaceAgent([{ role: 'system', text: 'Inspect.' }], {}, {
    config: { contextTokens: 65536 },
    stream: async function* () { yield '{"contextRequest":{"tool":"read","resource":"source"}}'; },
  }), /16-step/);
});
