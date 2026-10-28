import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2766 official examples', () => {
  assert.deepEqual(solve('{"nums":[1,6,7,8],"moveFrom":[1,7,2],"moveTo":[2,9,5]}'), [5, 6, 8, 9])
  assert.deepEqual(solve('{"nums":[1,1,3,3],"moveFrom":[1,3],"moveTo":[2,2]}'), [2])
})

test('2766 a move onto an occupied position merges the two', () => {
  assert.deepEqual(solve('{"nums":[4,5],"moveFrom":[4],"moveTo":[5]}'), [5])
})

test('2766 rejects a move from an empty position', () => {
  assert.throws(() => parseInput('{"nums":[1],"moveFrom":[2],"moveTo":[3]}'), /no marble/)
})

// Independent oracle: keep a list of every marble's position and rewrite each one at every move.
function oracle(nums, moveFrom, moveTo) {
  let marbles = [...nums]
  moveFrom.forEach((from, i) => {
    marbles = marbles.map(p => (p === from ? moveTo[i] : p))
  })
  return [...new Set(marbles)].sort((a, b) => a - b)
}

test('2766 random moves match a per-marble rewrite oracle', () => {
  let seed = 2766
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 300; round++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(12))
    const cur = new Set(nums), moveFrom = [], moveTo = []
    for (let i = 0, count = rnd(6); i < count && cur.size; i++) {
      const list = [...cur]
      const from = list[rnd(list.length)], to = 1 + rnd(12)
      moveFrom.push(from)
      moveTo.push(to)
      cur.delete(from)
      cur.add(to)
    }
    const text = JSON.stringify({ nums, moveFrom, moveTo })
    assert.deepEqual(solve(text), oracle(nums, moveFrom, moveTo), text)
  }
})
