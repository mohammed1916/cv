import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2363 official examples', () => {
  assert.deepEqual(solve('{"items1":[[1,1],[4,5],[3,8]],"items2":[[3,1],[1,5]]}'), [[1, 6], [3, 9], [4, 5]])
  assert.deepEqual(solve('{"items1":[[1,1],[3,2],[2,3]],"items2":[[2,1],[3,2]]}'), [[1, 1], [2, 4], [3, 4]])
  assert.deepEqual(solve('{"items1":[[1,3],[2,2]],"items2":[[7,1],[2,2],[1,4]]}'), [[1, 7], [2, 4], [7, 1]])
})

test('2363 a value present in only one list keeps its own weight', () => {
  assert.deepEqual(solve('{"items1":[[9,4]],"items2":[[2,1]]}'), [[2, 1], [9, 4]])
})

test('2363 rejects a repeated value within one list', () => {
  assert.throws(() => parseInput('{"items1":[[1,1],[1,2]],"items2":[[1,1]]}'), /appears once/)
})

// Independent oracle: for each distinct value, filter both lists and add the weights.
function oracle(items1, items2) {
  const values = [...new Set([...items1, ...items2].map(p => p[0]))].sort((a, b) => a - b)
  return values.map(v => [v, [...items1, ...items2].filter(p => p[0] === v).reduce((sum, p) => sum + p[1], 0)])
}

test('2363 random items match a filter-and-sum oracle', () => {
  let seed = 2363
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const list = () => {
    const pool = Array.from({ length: 8 }, (_, i) => i + 1)
    const out = []
    for (let i = 0, count = 1 + rnd(6); i < count; i++) out.push([pool.splice(rnd(pool.length), 1)[0], 1 + rnd(9)])
    return out
  }
  for (let round = 0; round < 300; round++) {
    const items1 = list(), items2 = list()
    assert.deepEqual(solve(JSON.stringify({ items1, items2 })), oracle(items1, items2), JSON.stringify({ items1, items2 }))
  }
})
