import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (floor, numCarpets, carpetLen) => buildTrace(parseInput(JSON.stringify({ floor, numCarpets, carpetLen }))).result

test('2209 worked examples', () => {
  assert.equal(solve('10110101', 2, 2), 2)
  assert.equal(solve('11111', 2, 3), 0)
  assert.equal(solve('0000', 1, 2), 0)
  assert.equal(solve('111', 0, 1), 3)
})

test('2209 rejects invalid input', () => {
  assert.throws(() => parseInput('{"floor":"12","numCarpets":1,"carpetLen":1}'))
  assert.throws(() => parseInput('{"floor":"10","numCarpets":4,"carpetLen":1}'))
  assert.throws(() => parseInput('{"floor":"10","numCarpets":1,"carpetLen":0}'))
})

// Oracle: carpets may overlap. Try every multiset of up to k carpet starts and count the white tiles left uncovered.
function oracle(floor, k, len) {
  const n = floor.length
  let best = Infinity
  const go = (from, carpets, covered) => {
    let white = 0
    for (let i = 0; i < n; i++) if (!covered[i] && floor[i] === '1') white++
    best = Math.min(best, white)
    if (carpets === k) return
    for (let s = from; s + len <= n; s++) {
      const next = covered.slice()
      for (let i = s; i < s + len; i++) next[i] = true
      go(s, carpets + 1, next)
    }
  }
  go(0, 0, Array(n).fill(false))
  return best
}

test('2209 random floors match a placement oracle', () => {
  let seed = 2209
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const floor = Array.from({ length: 1 + rnd(9) }, () => String(rnd(2))).join('')
    const k = rnd(3)
    const len = 1 + rnd(3)
    if (len > floor.length) continue
    assert.equal(solve(floor, k, len), oracle(floor, k, len), JSON.stringify({ floor, k, len }))
  }
})

test('2209 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"floor":"10110101","numCarpets":2,"carpetLen":2}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
