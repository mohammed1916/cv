import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const kind = c => (/\d/.test(c) ? 'digit' : 'letter')
const alternates = s => [...s].every((c, i) => i === 0 || kind(c) !== kind(s[i - 1]))

// Independent oracle: try every ordering of the characters and keep those that alternate.
function anyAlternatingOrder(s) {
  const chars = [...s]
  const used = Array(chars.length).fill(false)
  const build = (prefix) => {
    if (prefix.length === chars.length) return alternates(prefix)
    for (let i = 0; i < chars.length; i++) {
      if (used[i]) continue
      if (prefix.length && kind(chars[i]) === kind(prefix.at(-1))) continue
      used[i] = true
      if (build(prefix + chars[i])) { used[i] = false; return true }
      used[i] = false
    }
    return false
  }
  return build('')
}

test('sample strings give alternating results or an empty string', () => {
  assert.equal(buildTrace(parseInput('"a1b2c3"')).result, 'a1b2c3')
  assert.equal(buildTrace(parseInput('"123abc4"')).result, '1a2b3c4')
  assert.equal(buildTrace(parseInput('"ab12cd"')).result, '')
  assert.equal(buildTrace(parseInput('"z9"')).result, 'z9')
})

test('exhaustive short strings agree with the brute-force oracle', () => {
  const alphabet = ['a', 'b', '1', '2']
  let level = ['']
  for (let n = 1; n <= 6; n++) {
    level = level.flatMap(prefix => alphabet.map(c => prefix + c))
    for (const s of level) {
      const { result } = buildTrace(s)
      if (result === '') {
        assert.equal(anyAlternatingOrder(s), false, s)
      } else {
        assert.equal([...result].sort().join(''), [...s].sort().join(''), s)
        assert.ok(alternates(result), s)
      }
    }
  }
})

test('the trace reports the group sizes and a final result frame', () => {
  const run = buildTrace('ab12cd')
  assert.equal(run.frames.at(-1).phase, 'result')
  assert.equal(run.frames.find(f => f.phase === 'check').snapshot.letters.length, 4)
})

test('every frame names a valid phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace('a1b2c3d4e5')
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 5)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.snapshot && Array.isArray(frame.snapshot.output))
  }
  assert.equal(code.length, python.split('\n').length)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('a1b2'), /JSON string/)
  assert.throws(() => parseInput('"A1"'), /lowercase/)
  assert.throws(() => parseInput('""'), /1 to 500/)
})
