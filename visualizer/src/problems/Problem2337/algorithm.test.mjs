import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (start, target) => buildTrace({ start, target }).result

test('2337 official examples', () => {
  assert.equal(solve('_L__R__R_', 'L______RR'), true)
  assert.equal(solve('R_L_', '__LR'), false)
  assert.equal(solve('_R', 'R_'), false)
})

test('2337 edge cases: single pieces and all blanks', () => {
  assert.equal(solve('L', 'L'), true)
  assert.equal(solve('L', 'R'), false)
  assert.equal(solve('__', '__'), true)
  assert.equal(solve('_L', 'L_'), true)
  assert.equal(solve('L_', '_L'), false)
})

test('2337 rejects unequal lengths and unknown characters', () => {
  assert.throws(() => parseInput('{"start":"L_","target":"L"}'))
  assert.throws(() => parseInput('{"start":"X","target":"X"}'))
})

// Independent oracle: breadth-first search over every string reachable by legal moves.
// A legal move is "_L" to "L_" (an L slides left) or "R_" to "_R" (an R slides right).
function oracle(start, target) {
  const seen = new Set([start])
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const s = queue[head]
    const next = []
    for (let k = 0; k + 1 < s.length; k++) {
      if (s[k] === '_' && s[k + 1] === 'L') next.push(s.slice(0, k) + 'L_' + s.slice(k + 2))
      if (s[k] === 'R' && s[k + 1] === '_') next.push(s.slice(0, k) + '_R' + s.slice(k + 2))
    }
    for (const t of next) {
      if (!seen.has(t)) {
        seen.add(t)
        queue.push(t)
      }
    }
  }
  return seen.has(target)
}

test('2337 random strings match a reachability oracle', () => {
  let seed = 2337
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const chars = 'LR_'
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(7)
    const start = Array.from({ length }, () => chars[rnd(3)]).join('')
    const target = Array.from({ length }, () => chars[rnd(3)]).join('')
    assert.equal(solve(start, target), oracle(start, target), JSON.stringify({ start, target }))
  }
})
