import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

// Independent oracle: repeatedly reverse the innermost pair until no brackets remain.
function oracle(s) {
  let t = s
  for (;;) {
    const close = t.indexOf(')')
    if (close < 0) break
    const open = t.lastIndexOf('(', close)
    t = t.slice(0, open) + [...t.slice(open + 1, close)].reverse().join('') + t.slice(close + 1)
  }
  return t
}

test('nested groups change traversal direction repeatedly', () => {
  const s = 'ab(cd(ef)gh)ij(kl)m'
  assert.equal(buildTrace(parseInput(JSON.stringify({ s }))).result, oracle(s))
})

test('no brackets and an empty pair', () => {
  assert.equal(buildTrace({ s: 'cedar' }).result, 'cedar')
  assert.equal(buildTrace({ s: 'ab()cd' }).result, 'abcd')
})

test('deeply nested short text', () => {
  assert.equal(buildTrace({ s: '(((moss)))' }).result, oracle('(((moss)))'))
})

test('random balanced strings agree with the innermost-reversal oracle', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const build = depth => {
    let out = ''
    const parts = 1 + rand(4)
    for (let p = 0; p < parts; p++) {
      if (depth < 4 && rand(3) === 0) out += '(' + build(depth + 1) + ')'
      else out += 'abcxyz'[rand(6)]
    }
    return out
  }
  for (let t = 0; t < 300; t++) {
    const s = build(0)
    assert.equal(buildTrace({ s }).result, oracle(s), s)
  }
})

test('every frame has a valid phase, code line, message and snapshot', () => {
  const run = buildTrace({ s: 'a(bc)d' })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.ok(python.includes('def reverse_in_parentheses'))
})

test('input validation rejects unbalanced brackets and uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"(ab"}'))
  assert.throws(() => parseInput('{"s":"ab)("}'))
  assert.throws(() => parseInput('{"s":"Ab"}'))
})
