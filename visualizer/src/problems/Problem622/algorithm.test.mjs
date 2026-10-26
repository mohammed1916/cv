import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('622 official-style sequences return the expected values', () => {
  const run = buildTrace({ k: 3, ops: [['enQueue', 1], ['enQueue', 2], ['enQueue', 3], ['enQueue', 4], ['Rear'], ['isFull'], ['deQueue'], ['enQueue', 4], ['Rear']] })
  assert.deepEqual(run.result, [true, true, true, false, 3, true, true, true, 4])
})

test('622 random operation sequences match an array-based queue oracle', () => {
  let state = 77
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const names = ['enQueue', 'deQueue', 'Front', 'Rear', 'isEmpty', 'isFull']
  for (let t = 0; t < 300; t++) {
    const k = 1 + rand(5)
    const ops = Array.from({ length: 1 + rand(30) }, () => {
      const name = names[rand(names.length)]
      return name === 'enQueue' ? [name, rand(50)] : [name]
    })
    const queue = []
    const expected = ops.map(([name, value]) => {
      if (name === 'enQueue') { if (queue.length === k) return false; queue.push(value); return true }
      if (name === 'deQueue') { if (!queue.length) return false; queue.shift(); return true }
      if (name === 'Front') return queue.length ? queue[0] : -1
      if (name === 'Rear') return queue.length ? queue[queue.length - 1] : -1
      if (name === 'isEmpty') return queue.length === 0
      return queue.length === k
    })
    assert.deepEqual(buildTrace({ k, ops }).result, expected, JSON.stringify({ k, ops }))
  }
})

test('622 validates k and operation names', () => {
  assert.throws(() => parseInput('{"k":0,"ops":[["isEmpty"]]}'))
  assert.throws(() => parseInput('{"k":2,"ops":[["push",1]]}'))
})
