import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const sortNumbers = values => [...values].sort((a, b) => a - b)

test('652 official examples', () => {
  assert.deepEqual(sortNumbers(buildTrace([1, 2, 3, 4, null, 2, 4, null, null, 4]).result), [2, 4])
  assert.deepEqual(buildTrace([2, 1, 1]).result, [1])
  assert.deepEqual(sortNumbers(buildTrace([2, 2, 2, 3, null, 3, null]).result), [2, 3])
})

// Oracle: build the same tree independently, walk it in post-order, and report the value of the
// node where each serialization reaches its second copy.
function postOrderOracle(values) {
  const nodes = values.map(v => (v === null ? null : { v, l: null, r: null }))
  const queue = [nodes[0]]
  let c = 1
  for (let q = 0; q < queue.length && c < nodes.length; q++) {
    queue[q].l = nodes[c++]; if (queue[q].l) queue.push(queue[q].l)
    if (c < nodes.length) { queue[q].r = nodes[c++]; if (queue[q].r) queue.push(queue[q].r) }
  }
  const count = new Map()
  const reported = []
  const visit = n => {
    if (!n) return '#'
    const key = `${n.v}[${visit(n.l)}][${visit(n.r)}]`
    const seen = (count.get(key) ?? 0) + 1
    count.set(key, seen)
    if (seen === 2) reported.push(n.v)
    return key
  }
  visit(nodes[0])
  return sortNumbers(reported)
}

test('652 random trees report the first post-order occurrence of each repeated subtree', () => {
  let state = 57
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rand(10)
    const values = Array.from({ length: size }, () => (rand(3) === 0 ? null : rand(3)))
    values[0] = values[0] ?? 1
    assert.deepEqual(sortNumbers(buildTrace(values).result), postOrderOracle(values), JSON.stringify(values))
  }
})

test('652 rejects a null root', () => {
  assert.throws(() => parseInput('[null]'))
})
