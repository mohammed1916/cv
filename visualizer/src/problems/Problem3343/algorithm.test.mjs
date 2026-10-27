import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = num => buildTrace(parseInput(JSON.stringify({ num }))).result

test('3343 examples', () => {
  assert.equal(solve('123'), 2)
  assert.equal(solve('11'), 1)
})

test('3343 odd digit sum has no balanced permutation', () => {
  assert.equal(solve('12'), 0)
})

test('3343 rejects bad input', () => {
  assert.throws(() => parseInput('{"num":"1"}'))
  assert.throws(() => parseInput('{"num":"1a"}'))
})

// Independent oracle: list every distinct arrangement of the digits as a string and test the balance rule directly.
function oracle(num) {
  const arrangements = new Set()
  const go = (left, acc) => {
    if (left.length === 0) { arrangements.add(acc); return }
    left.forEach((ch, i) => go([...left.slice(0, i), ...left.slice(i + 1)], acc + ch))
  }
  go([...num], '')
  let count = 0
  for (const s of arrangements) {
    let even = 0
    let odd = 0
    for (let i = 0; i < s.length; i++) {
      if (i % 2 === 0) even += Number(s[i])
      else odd += Number(s[i])
    }
    if (even === odd) count++
  }
  return count % 1000000007
}

test('3343 random digit strings match distinct-arrangement enumeration', () => {
  let seed = 3343
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    let num = ''
    for (let i = 0; i < 2 + rnd(6); i++) num += String(rnd(10))
    assert.equal(solve(num), oracle(num), num)
  }
})
