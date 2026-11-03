import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: try every split point and count the two parts directly.
function oracle(s) {
  let best = -1
  for (let cut = 1; cut < s.length; cut++) {
    const left = s.slice(0, cut), right = s.slice(cut)
    const score = [...left].filter(c => c === '0').length + [...right].filter(c => c === '1').length
    best = Math.max(best, score)
  }
  return best
}

test('sample strings give the best split score', () => {
  assert.equal(buildTrace('10010').result, 3)
  assert.equal(buildTrace('11111').result, 4)
  assert.equal(buildTrace('0000').result, 3)
  assert.equal(buildTrace('01').result, 2)
})

test('every binary string up to length 10 agrees with the oracle', () => {
  for (let n = 2; n <= 10; n++) {
    for (let bits = 0; bits < 2 ** n; bits++) {
      const s = bits.toString(2).padStart(n, '0')
      assert.equal(buildTrace(s).result, oracle(s), s)
    }
  }
})

test('the trace has one split frame per cut and ends on the result', () => {
  const run = buildTrace('10010')
  assert.equal(run.frames.filter(f => f.phase === 'score').length, 4)
  assert.equal(run.frames.at(-1).phase, 'result')
  assert.equal(run.frames.at(-1).snapshot.best, 3)
})

test('every frame names a valid phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const frame of buildTrace('1100101').frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 5)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(code.length, python.split('\n').length)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('"0"'), /2 to 500/)
  assert.throws(() => parseInput('"012"'), /Only the characters/)
  assert.throws(() => parseInput('0101'), /JSON string/)
})
