import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, reversedFrom } from './algorithm.js'

const solve = s => buildTrace(s).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length, 'pseudocode line')
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines, 'python line')
    assert.ok(frame.message.length > 0)
  }
}

const dial = (from, to) => {
  let best = Infinity
  for (let k = 0; k < 10; k++) {
    if ((from + k) % 10 === to || (from - k + 10) % 10 === to) best = Math.min(best, k)
  }
  return best
}
const costOf = s => {
  let cur = 0
  let total = 0
  for (const ch of s) {
    const d = Number(ch)
    total += dial(cur, d)
    cur = d
  }
  return total
}

// Independent oracle: try reversing every suffix (and the empty suffix) and dial each result.
function oracle(s) {
  let best = costOf(s)
  for (let k = 0; k < s.length; k++) {
    best = Math.min(best, costOf(s.slice(0, k) + s.slice(k).split('').reverse().join('')))
  }
  return best
}

test('4071 reversal helps when the tail is better read backwards', () => {
  assert.equal(solve('19'), oracle('19'))
  assert.equal(solve('91'), 3) // 0 to 9 costs 1 and 9 to 1 costs 2; reversing gives 0 to 1 then 1 to 9, also 3
})

test('4071 a single digit or an already smooth string costs what it costs', () => {
  assert.equal(solve('0'), 0)
  assert.equal(solve('0123456789'), oracle('0123456789'))
})

test('4071 random digit strings match the suffix oracle and frames stay valid', () => {
  let seed = 4071
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const s = Array.from({ length: 1 + rnd(9) }, () => String(rnd(10))).join('')
    const run = buildTrace(s)
    assert.equal(run.result, oracle(s), s)
    checkFrames(run)
  }
})

test('4071 reversedFrom preview matches a direct reversal', () => {
  assert.equal(reversedFrom('12345', 2), '12543')
  assert.equal(reversedFrom('12345', 0), '54321')
})

test('4071 rejects empty and non-digit input', () => {
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('12x'))
  assert.throws(() => parseInput('1234567890123456789012345678901'))
})
