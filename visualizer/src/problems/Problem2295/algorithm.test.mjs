import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2295 official examples', () => {
  assert.deepEqual(solve('{"nums":[1,2,4,6],"operations":[[1,3],[4,7],[6,1]]}'), [3, 2, 7, 1])
  assert.deepEqual(solve('{"nums":[1,2],"operations":[[1,3],[2,1],[3,2]]}'), [2, 1])
})

test('2295 a value replaced earlier can be replaced again', () => {
  assert.deepEqual(solve('{"nums":[5],"operations":[[5,6],[6,7],[7,8]]}'), [8])
})

test('2295 rejects a replacement that is already present', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"operations":[[1,2]]}'), /already in the array/)
})

// Independent oracle: find each value by scanning the array, with no table.
function oracle(nums, operations) {
  const out = [...nums]
  for (const [oldValue, newValue] of operations) out[out.indexOf(oldValue)] = newValue
  return out
}

test('2295 random operations match a linear-scan oracle', () => {
  let seed = 2295
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 250; round++) {
    const pool = Array.from({ length: 30 }, (_, i) => i + 1)
    const nums = []
    for (let i = 0, count = 1 + rnd(8); i < count; i++) nums.push(pool.splice(rnd(pool.length), 1)[0])
    const fresh = Array.from({ length: 30 }, (_, i) => i + 31)
    const cur = [...nums], operations = []
    for (let i = 0, count = 1 + rnd(6); i < count; i++) {
      const at = rnd(cur.length), v = fresh.splice(rnd(fresh.length), 1)[0]
      operations.push([cur[at], v])
      cur[at] = v
    }
    const text = JSON.stringify({ nums, operations })
    assert.deepEqual(solve(text), oracle(nums, operations), text)
  }
})
