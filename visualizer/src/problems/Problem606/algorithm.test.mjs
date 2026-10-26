import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('606 official examples', () => {
  assert.equal(buildTrace([1, 2, 3, 4]).result, '1(2(4))(3)')
  assert.equal(buildTrace([1, 2, 3, null, 4]).result, '1(2()(4))(3)')
  assert.equal(buildTrace([1]).result, '1')
})

test('606 random trees: the string parses back to the same preorder with matching brackets', () => {
  let state = 21
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rand(10)
    const values = [rand(50)]
    const queue = [0]
    let made = 1
    for (let q = 0; q < queue.length && made < size; q++) {
      values.push(rand(3) === 0 ? null : rand(50)); if (values.at(-1) !== null) { queue.push(values.length - 1); made++ }
      if (made < size) { values.push(rand(3) === 0 ? null : rand(50)); if (values.at(-1) !== null) { queue.push(values.length - 1); made++ } }
    }
    const text = buildTrace(values).result
    assert.equal([...text].filter(c => c === '(').length, [...text].filter(c => c === ')').length, text)
    const numbers = text.match(/-?\d+/g).map(Number)
    const expected = buildTrace(values).frames.filter(f => f.phase === 'write').map(f => f.message.replace('Write ', '')).map(Number)
    assert.deepEqual(numbers, expected)
  }
})

test('606 rejects a null root', () => {
  assert.throws(() => parseInput('[null]'))
})
