import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = ops => buildTrace(parseInput(JSON.stringify(ops))).result

test('1670 official example', () => {
  const ops = [['pushFront', 1], ['pushBack', 2], ['pushMiddle', 3], ['pushMiddle', 4], ['popFront'], ['popMiddle'], ['popMiddle'], ['popBack'], ['popFront']]
  assert.deepEqual(solve(ops), [1, 3, 4, 2, -1])
})

test('1670 pops on an empty queue return -1', () => {
  assert.deepEqual(solve([['popFront'], ['popMiddle'], ['popBack']]), [-1, -1, -1])
})

test('1670 the middle of an even-sized queue is the left of the two middles', () => {
  // [1, 2] then pushMiddle 9 gives [1, 9, 2]; popMiddle removes 9.
  assert.deepEqual(solve([['pushBack', 1], ['pushBack', 2], ['pushMiddle', 9], ['popMiddle'], ['popMiddle']]), [9, 1])
})

test('1670 rejects a value outside 1 to 99', () => {
  assert.throws(() => parseInput('[["pushBack",0]]'))
  assert.throws(() => parseInput('[["popMiddle",3]]'))
})

// Independent oracle: a plain array, with splice for the middle operations.
function oracle(ops) {
  const arr = []
  const out = []
  for (const [name, value] of ops) {
    if (name === 'pushFront') arr.unshift(value)
    else if (name === 'pushBack') arr.push(value)
    else if (name === 'pushMiddle') arr.splice(Math.floor(arr.length / 2), 0, value)
    else if (name === 'popFront') out.push(arr.length ? arr.shift() : -1)
    else if (name === 'popBack') out.push(arr.length ? arr.pop() : -1)
    else out.push(arr.length ? arr.splice(Math.floor((arr.length - 1) / 2), 1)[0] : -1)
  }
  return out
}

test('1670 random operation sequences match a plain-array oracle', () => {
  let seed = 1670
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const names = ['pushFront', 'pushMiddle', 'pushBack', 'popFront', 'popMiddle', 'popBack']
  for (let t = 0; t < 300; t++) {
    const ops = []
    for (let i = 0; i < 1 + rnd(20); i++) {
      const name = names[rnd(6)]
      ops.push(name.startsWith('push') ? [name, 1 + rnd(9)] : [name])
    }
    assert.deepEqual(solve(ops), oracle(ops), JSON.stringify(ops))
  }
})
