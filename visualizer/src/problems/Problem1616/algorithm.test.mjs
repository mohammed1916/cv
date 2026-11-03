import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (a, b) => buildTrace({ a, b }).result
const isPal = s => s === [...s].reverse().join('')

// Independent oracle: try every split index k and both mirrored concatenations.
function brute(a, b) {
  const n = a.length
  for (let k = 0; k <= n; k++) {
    if (isPal(a.slice(0, k) + b.slice(k))) return true
    if (isPal(b.slice(0, k) + a.slice(k))) return true
  }
  return false
}

test('1616 hand-made pairs give the expected answers', () => {
  assert.equal(solve('abxcd', 'dcyba'), true)
  assert.equal(solve('ab', 'cd'), false)
  assert.equal(solve('aaz', 'bbq'), false)
  assert.equal(solve('q', 'z'), true)
})

test('1616 random pairs over a small alphabet match the brute-force oracle', () => {
  let seed = 11
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  const word = n => Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(7)
    const a = word(n), b = word(n)
    assert.equal(solve(a, b), brute(a, b), `${a} ${b}`)
  }
})

test('1616 frames carry phase, a code line, narration and a snapshot', () => {
  const run = buildTrace({ a: 'abxcd', b: 'dcyba' })
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(phaseIds.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).snapshot.verdict, run.result)
  assert.ok(python.includes('def can_split'))
})

test('1616 rejects malformed input with a readable message', () => {
  assert.throws(() => parseInput('["ab","cd"]'), /object/)
  assert.throws(() => parseInput('{"a":"ab","b":"c"}'), /same length/)
  assert.throws(() => parseInput('{"a":"AB","b":"cd"}'), /lowercase/)
  assert.throws(() => parseInput('{"a":1,"b":"cd"}'), /strings/)
})
