import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s1, s2) => buildTrace(parseInput(JSON.stringify({ s1, s2 }))).result

test('2840 official examples', () => {
  assert.equal(solve('abcdba', 'cabdab'), true)
  assert.equal(solve('abe', 'bea'), false)
})

test('2840 edge cases: equal strings and a single letter', () => {
  assert.equal(solve('a', 'a'), true)
  assert.equal(solve('ab', 'ba'), false)
})

test('2840 rejects strings of different lengths', () => {
  assert.throws(() => parseInput('{"s1":"ab","s2":"abc"}'))
})

// Independent oracle: breadth-first search over every string reachable by swapping positions two apart.
function oracle(s1, s2) {
  const seen = new Set([s1])
  const queue = [s1]
  while (queue.length > 0) {
    const cur = queue.shift()
    for (let i = 0; i + 2 < cur.length; i++) {
      const arr = [...cur]
      const held = arr[i]
      arr[i] = arr[i + 2]
      arr[i + 2] = held
      const next = arr.join('')
      if (!seen.has(next)) { seen.add(next); queue.push(next) }
    }
  }
  return seen.has(s2)
}

test('2840 random pairs match a reachability oracle', () => {
  let seed = 2840
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(7)
    const s1 = Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
    const s2 = t % 2 === 0
      ? [...s1].sort(() => rnd(3) - 1).join('')
      : Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(s1, s2), oracle(s1, s2), `${s1} ${s2}`)
  }
})
