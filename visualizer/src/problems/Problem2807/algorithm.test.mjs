import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = head => buildTrace({ head }).result

test('2807 official examples', () => {
  assert.deepEqual(solve([18, 6, 10, 3]), [18, 6, 6, 2, 10, 1, 3])
  assert.deepEqual(solve([7, 5]), [7, 1, 5])
})

test('2807 a single node is returned unchanged', () => {
  assert.deepEqual(solve([42]), [42])
})

test('2807 rejects an empty list and a zero value', () => {
  assert.throws(() => parseInput('{"head":[]}'))
  assert.throws(() => parseInput('{"head":[4,0]}'))
})

// Independent oracle: build real linked nodes and splice gcd nodes using subtraction-based gcd.
function oracle(values) {
  let head = null
  for (let i = values.length - 1; i >= 0; i--) head = { val: values[i], next: head }
  const sub = (a, b) => { while (a !== b) { if (a > b) a -= b; else b -= a } return a }
  for (let cur = head; cur && cur.next; cur = cur.next.next || null) {
    const node = { val: sub(cur.val, cur.next.val), next: cur.next }
    cur.next = node
  }
  const out = []
  for (let cur = head; cur; cur = cur.next) out.push(cur.val)
  return out
}

test('2807 random lists match a linked-node oracle', () => {
  let seed = 2807
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const head = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(60))
    assert.deepEqual(solve(head), oracle(head), JSON.stringify(head))
  }
})
