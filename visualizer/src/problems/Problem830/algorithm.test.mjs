import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(s) {
  const out = []
  for (let i = 0; i < s.length; ) {
    let j = i
    while (j < s.length && s[j] === s[i]) j++
    if (j - i >= 3) out.push([i, j - 1])
    i = j
  }
  return out
}

test('830 worked examples', () => {
  assert.deepEqual(buildTrace('abbxxxxzzy').result, [[3, 6]])
  assert.deepEqual(buildTrace('abc').result, [])
  assert.deepEqual(buildTrace('aaa').result, [[0, 2]])
})

test('830 random strings match a run-by-run search', () => {
  let state = 830
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 500; t++) {
    const s = Array.from({ length: 1 + rand(12) }, () => 'abc'[rand(3)]).join('')
    assert.deepEqual(buildTrace(s).result, brute(s), s)
  }
})

test('830 rejects uppercase letters', () => {
  assert.throws(() => parseInput('"AAA"'))
})
