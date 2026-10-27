import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: for each limit, a dynamic program that gives each number to set one, to set two, or to neither.
function oracle({ divisor1, divisor2, uniqueCnt1, uniqueCnt2 }) {
  for (let x = 1; ; x++) {
    const memo = new Map()
    const go = (i, a, b) => {
      if (a === 0 && b === 0) return true
      if (i > x) return false
      const key = `${i},${a},${b}`
      if (memo.has(key)) return memo.get(key)
      let ok = go(i + 1, a, b)
      if (!ok && i % divisor1 !== 0 && a > 0) ok = go(i + 1, a - 1, b)
      if (!ok && i % divisor2 !== 0 && b > 0) ok = go(i + 1, a, b - 1)
      memo.set(key, ok)
      return ok
    }
    if (go(1, uniqueCnt1, uniqueCnt2)) return x
  }
}

test('2513 official examples', () => {
  assert.equal(solve({ divisor1: 2, divisor2: 7, uniqueCnt1: 1, uniqueCnt2: 3 }), 4)
  assert.equal(solve({ divisor1: 3, divisor2: 5, uniqueCnt1: 2, uniqueCnt2: 1 }), 3)
  assert.equal(solve({ divisor1: 2, divisor2: 4, uniqueCnt1: 8, uniqueCnt2: 2 }), 15)
})

test('2513 rejects bad input', () => {
  assert.throws(() => parseInput('{"divisor1":1,"divisor2":2,"uniqueCnt1":1,"uniqueCnt2":1}'))
  assert.throws(() => parseInput('{"divisor1":2,"divisor2":2,"uniqueCnt1":0,"uniqueCnt2":1}'))
})

test('2513 random parameters match a set-filling oracle', () => {
  let seed = 2513
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const input = { divisor1: 2 + rnd(9), divisor2: 2 + rnd(9), uniqueCnt1: 1 + rnd(8), uniqueCnt2: 1 + rnd(8) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
