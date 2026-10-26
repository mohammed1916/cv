import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('705 official example results', () => {
  const run = buildTrace([['add', 1], ['add', 2], ['contains', 1], ['contains', 3], ['add', 2], ['remove', 2], ['contains', 2], ['add', 11], ['contains', 11]])
  assert.deepEqual(run.result, [true, false, false, true])
})

test('705 random operations match a native Set oracle', () => {
  let state = 121
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const ops = Array.from({ length: 1 + rand(20) }, () => [['add', 'remove', 'contains'][rand(3)], rand(40)])
    const set = new Set()
    const expected = []
    for (const [name, key] of ops) {
      if (name === 'add') set.add(key)
      else if (name === 'remove') set.delete(key)
      else expected.push(set.has(key))
    }
    assert.deepEqual(buildTrace(ops).result, expected, JSON.stringify(ops))
  }
})

test('705 rejects unknown operations', () => {
  assert.throws(() => parseInput('[["put",1]]'))
})
