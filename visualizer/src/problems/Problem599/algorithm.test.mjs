import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('599 official examples', () => {
  assert.deepEqual(buildTrace({ list1: ['Shogun', 'Tapioca Express', 'Burger King', 'KFC'], list2: ['Piatti', 'The Grill at Torrey Pines', 'Hungry Hunter Steakhouse', 'Shogun'] }).result, ['Shogun'])
  assert.deepEqual(buildTrace({ list1: ['Shogun', 'Tapioca Express', 'Burger King', 'KFC'], list2: ['KFC', 'Shogun', 'Burger King'] }).result, ['Shogun'])
  assert.deepEqual(buildTrace({ list1: ['a'], list2: ['b'] }).result, [])
})

test('599 random lists match a quadratic brute-force search', () => {
  let state = 11
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const pool = ['a', 'b', 'c', 'd', 'e', 'f']
  for (let t = 0; t < 500; t++) {
    const list1 = [...new Set(Array.from({ length: 1 + rand(5) }, () => pool[rand(6)]))]
    const list2 = [...new Set(Array.from({ length: 1 + rand(5) }, () => pool[rand(6)]))]
    let best = Infinity, expected = []
    list1.forEach((x, i) => list2.forEach((y, j) => { if (x === y) { if (i + j < best) { best = i + j; expected = [x] } else if (i + j === best && !expected.includes(x)) expected.push(x) } }))
    const got = buildTrace({ list1, list2 }).result
    assert.deepEqual([...got].sort(), [...expected].sort(), JSON.stringify({ list1, list2 }))
  }
})

test('599 rejects empty lists', () => {
  assert.throws(() => parseInput('{"list1":[],"list2":["a"]}'))
})
