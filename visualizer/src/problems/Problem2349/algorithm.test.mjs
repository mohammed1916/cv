import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2349 official example sequence', () => {
  const text = '{"operations":[["find",10],["change",2,10],["change",1,10],["change",3,10],["change",5,10],["find",10],["change",1,20],["find",10]]}'
  assert.deepEqual(solve(text), [-1, null, null, null, null, 1, null, 2])
})

test('2349 a moved index leaves its old number', () => {
  assert.deepEqual(solve('{"operations":[["change",4,7],["change",4,8],["find",7],["find",8]]}'), [null, null, -1, 4])
})

test('2349 rejects a number of zero', () => {
  assert.throws(() => parseInput('{"operations":[["change",0,0]]}'))
})

// Independent oracle: keep a plain array of values and scan it for the smallest matching index.
function oracle(operations) {
  const slots = []
  return operations.map(op => {
    if (op[0] === 'change') {
      slots[op[1]] = op[2]
      return null
    }
    return slots.findIndex(value => value === op[1])
  })
}

test('2349 random operations match an array-scan oracle', () => {
  let seed = 2349
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 250; round++) {
    const operations = []
    for (let i = 0, count = 1 + rnd(20); i < count; i++) {
      operations.push(rnd(3) === 0 ? ['find', 1 + rnd(6)] : ['change', rnd(8), 1 + rnd(6)])
    }
    const text = JSON.stringify({ operations })
    assert.deepEqual(solve(text), oracle(operations), text)
  }
})
