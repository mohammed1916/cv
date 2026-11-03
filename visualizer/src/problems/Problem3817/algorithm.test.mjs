import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = s => buildTrace({ s }).result

function assertFrames(run) {
  const pyLines = python.split('\n').length
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine in ${f.phase}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine in ${f.phase}`)
    assert.ok(f.message.length > 0)
  }
}

// Independent oracle: look at every substring that ends at i and compare it with i's decimal text.
function oracle(s) {
  const out = []
  for (let i = 0; i < s.length; i++) {
    let hit = false
    for (let st = 0; st <= i && !hit; st++) hit = s.slice(st, i + 1) === String(i)
    if (hit) out.push(i)
  }
  return out
}

test('3817 worked cases', () => {
  assert.deepEqual(solve('0110'), [0, 1])
  assert.deepEqual(solve('123'), [])
  assert.deepEqual(solve('0'), [0])
})

test('3817 a multi-digit index can match its own digits', () => {
  // Index 10 is good when the two characters ending at position 10 read "10": s[9..10] = "10".
  assert.ok(solve('01234567810').includes(10))
})

test('3817 frames carry valid pseudocode and python lines', () => {
  assertFrames(buildTrace({ s: '0110' }))
})

test('3817 parseInput rejects non-digits', () => {
  assert.throws(() => parseInput('{"s":"1a"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

test('3817 random digit strings match the substring oracle', () => {
  let seed = 3817
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(25)
    const s = Array.from({ length: len }, () => String(rnd(10))).join('')
    assert.deepEqual(solve(s), oracle(s), s)
  }
})
