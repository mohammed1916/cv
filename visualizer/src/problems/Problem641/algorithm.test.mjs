import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('641 example sequence', () => {
  const run = buildTrace({ k: 3, ops: [['insertLast', 1], ['insertFront', 2], ['insertFront', 3], ['getRear'], ['isFull'], ['deleteLast'], ['insertFront', 4], ['getFront']] })
  // Three inserts fill the deque, so isFull is true before the delete; the final insert then succeeds.
  assert.deepEqual(run.result, [true, true, true, 1, true, true, true, 4])
})

test('641 random operations match an array deque oracle', () => {
  let state = 88
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const names = ['insertFront', 'insertLast', 'deleteFront', 'deleteLast', 'getFront', 'getRear', 'isEmpty', 'isFull']
  for (let t = 0; t < 300; t++) {
    const k = 1 + rand(5)
    const ops = Array.from({ length: 1 + rand(30) }, () => {
      const name = names[rand(names.length)]
      return name.startsWith('insert') ? [name, rand(50)] : [name]
    })
    const deque = []
    const expected = ops.map(([name, value]) => {
      if (name === 'insertFront') { if (deque.length === k) return false; deque.unshift(value); return true }
      if (name === 'insertLast') { if (deque.length === k) return false; deque.push(value); return true }
      if (name === 'deleteFront') { if (!deque.length) return false; deque.shift(); return true }
      if (name === 'deleteLast') { if (!deque.length) return false; deque.pop(); return true }
      if (name === 'getFront') return deque.length ? deque[0] : -1
      if (name === 'getRear') return deque.length ? deque[deque.length - 1] : -1
      if (name === 'isEmpty') return deque.length === 0
      return deque.length === k
    })
    assert.deepEqual(buildTrace({ k, ops }).result, expected, JSON.stringify({ k, ops }))
  }
})

test('641 rejects unknown operations', () => {
  assert.throws(() => parseInput('{"k":2,"ops":[["push",1]]}'))
})
