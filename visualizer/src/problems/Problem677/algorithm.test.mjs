import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('677 official example', () => {
  const run = buildTrace([['insert', 'apple', 3], ['sum', 'ap'], ['insert', 'app', 2], ['insert', 'apple', 2], ['sum', 'ap']])
  assert.deepEqual(run.result, [3, 4])
})

test('677 random operations match a plain dictionary oracle', () => {
  let state = 83
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const key = () => Array.from({ length: 1 + rand(3) }, () => 'ab'[rand(2)]).join('')
  for (let t = 0; t < 300; t++) {
    const ops = Array.from({ length: 1 + rand(12) }, () => (rand(2) ? ['insert', key(), rand(10)] : ['sum', key().slice(0, 1 + rand(2))]))
    const dict = {}
    const expected = []
    for (const op of ops) {
      if (op[0] === 'insert') dict[op[1]] = op[2]
      else expected.push(Object.entries(dict).filter(([k]) => k.startsWith(op[1])).reduce((s, [, v]) => s + v, 0))
    }
    assert.deepEqual(buildTrace(ops).result, expected, JSON.stringify(ops))
  }
})

test('677 rejects malformed operations', () => {
  assert.throws(() => parseInput('[["insert","A",1]]'))
})
