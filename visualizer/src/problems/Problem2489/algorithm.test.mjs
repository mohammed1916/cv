import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

function checkFrames(run) {
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.seen))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).answer, run.result)
}

// Brute force: test every substring directly against z * num2 === o * num1.
function oracle({ s, num1, num2 }) {
  let count = 0
  for (let i = 0; i < s.length; i++) {
    let zeros = 0
    let ones = 0
    for (let j = i; j < s.length; j++) {
      if (s[j] === '0') zeros++
      else ones++
      if (zeros * num2 === ones * num1) count++
    }
  }
  return count
}

test('2489 local presets are hand-checked', () => {
  assert.equal(solve({ s: '010010', num1: 1, num2: 2 }), oracle({ s: '010010', num1: 1, num2: 2 }))
  assert.equal(solve({ s: '1111', num1: 1, num2: 1 }), 0)
  assert.equal(solve({ s: '01', num1: 1, num2: 1 }), 1)
})

test('2489 a single character never has a positive ratio', () => {
  assert.equal(solve({ s: '0', num1: 1, num2: 1 }), 0)
  assert.equal(solve({ s: '1', num1: 3, num2: 2 }), 0)
})

test('2489 random strings match a substring-enumeration oracle', () => {
  let seed = 2489
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(14)
    const s = Array.from({ length: len }, () => (rnd(2) ? '1' : '0')).join('')
    const num1 = 1 + rnd(4)
    const num2 = 1 + rnd(4)
    assert.equal(solve({ s, num1, num2 }), oracle({ s, num1, num2 }), JSON.stringify({ s, num1, num2 }))
  }
})

test('2489 frame invariants hold', () => {
  checkFrames(buildTrace({ s: '0011101', num1: 2, num2: 3 }))
  checkFrames(buildTrace({ s: '1111', num1: 1, num2: 1 }))
})

test('2489 rejects non-binary strings and bad ratio parts', () => {
  assert.throws(() => parseInput('{"s":"012","num1":1,"num2":1}'))
  assert.throws(() => parseInput('{"s":"01","num1":0,"num2":1}'))
})
