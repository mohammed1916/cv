import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('706 official example results', () => {
  const run = buildTrace([['put', 1, 1], ['put', 2, 2], ['get', 1], ['get', 3], ['put', 2, 1], ['get', 2], ['remove', 2], ['get', 2]])
  assert.deepEqual(run.result, [1, -1, 1, -1])
})

test('706 random operations match a native Map oracle', () => {
  let state = 131
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const ops = Array.from({ length: 1 + rand(20) }, () => {
      const name = ['put', 'get', 'remove'][rand(3)]
      return name === 'put' ? [name, rand(30), rand(100)] : [name, rand(30)]
    })
    const map = new Map()
    const expected = []
    for (const [name, key, value] of ops) {
      if (name === 'put') map.set(key, value)
      else if (name === 'remove') map.delete(key)
      else expected.push(map.has(key) ? map.get(key) : -1)
    }
    assert.deepEqual(buildTrace(ops).result, expected, JSON.stringify(ops))
  }
})

test('706 rejects values outside the range', () => {
  assert.throws(() => parseInput('[["put",1,-1]]'))
})
