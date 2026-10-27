import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1172 official example', () => {
  const input = {
    capacity: 2,
    operations: ['push', 'push', 'push', 'push', 'push', 'popAtStack', 'push', 'push', 'popAtStack', 'popAtStack', 'pop', 'pop', 'pop', 'pop', 'pop'],
    arguments: [[1], [2], [3], [4], [5], [0], [20], [21], [0], [2], [], [], [], [], []],
  }
  assert.deepEqual(solve(input), [null, null, null, null, null, 2, null, null, 20, 21, 5, 4, 3, 1, -1])
})

test('1172 capacity one keeps every value on its own stack', () => {
  const input = { capacity: 1, operations: ['push', 'push', 'popAtStack', 'pop'], arguments: [[1], [2], [0], []] }
  assert.deepEqual(solve(input), [null, null, 1, 2])
})

test('1172 popping an empty plate stack answers -1', () => {
  assert.deepEqual(solve({ capacity: 2, operations: ['pop', 'popAtStack'], arguments: [[], [3]] }), [-1, -1])
})

test('1172 rejects a capacity of zero', () => {
  assert.throws(() => parseInput('{"capacity":0,"operations":["pop"],"arguments":[[]]}'))
})

// Independent oracle: plain lists with linear scans for the first stack with room and the rightmost non-empty stack.
function oracle({ capacity, operations, arguments: args }) {
  const stacks = []
  return operations.map((op, i) => {
    if (op === 'push') {
      let s = stacks.findIndex(x => x.length < capacity)
      if (s === -1) { stacks.push([]); s = stacks.length - 1 }
      stacks[s].push(args[i][0])
      return null
    }
    if (op === 'pop') {
      for (let s = stacks.length - 1; s >= 0; s--) if (stacks[s].length) return stacks[s].pop()
      return -1
    }
    const s = args[i][0]
    if (s >= stacks.length || stacks[s].length === 0) return -1
    return stacks[s].pop()
  })
}

test('1172 random operation sequences match a linear-scan oracle', () => {
  let seed = 1172
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const capacity = 1 + rnd(3)
    const length = 1 + rnd(15)
    const operations = []
    const args = []
    for (let i = 0; i < length; i++) {
      const pick = rnd(3)
      if (pick === 0) { operations.push('push'); args.push([1 + rnd(20)]) }
      else if (pick === 1) { operations.push('pop'); args.push([]) }
      else { operations.push('popAtStack'); args.push([rnd(6)]) }
    }
    const input = { capacity, operations, arguments: args }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
