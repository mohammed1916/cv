import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = commands => buildTrace(commands).result

test('2671 official example', () => {
  const commands = [['add', 3], ['add', 3], ['hasFrequency', 2], ['hasFrequency', 1], ['deleteOne', 3], ['hasFrequency', 2]]
  assert.deepEqual(solve(commands), [null, null, true, false, null, false])
})

test('2671 deleting an absent value changes nothing', () => {
  assert.deepEqual(solve([['deleteOne', 4], ['hasFrequency', 1]]), [null, false])
})

test('2671 rejects an unknown operation and an out-of-range value', () => {
  assert.throws(() => parseInput('[["remove",1]]'))
  assert.throws(() => parseInput('[["add",6]]'))
})

// Independent oracle: keep a plain multiset and recount each value on every query.
function oracle(commands) {
  const bag = []
  return commands.map(([op, value]) => {
    if (op === 'add') { bag.push(value); return null }
    if (op === 'deleteOne') {
      const at = bag.indexOf(value)
      if (at >= 0) bag.splice(at, 1)
      return null
    }
    const distinct = [...new Set(bag)]
    return distinct.some(v => bag.filter(x => x === v).length === value)
  })
}

test('2671 random command sequences match a recount oracle', () => {
  let seed = 2671
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const ops = ['add', 'deleteOne', 'hasFrequency']
  for (let t = 0; t < 300; t++) {
    const commands = Array.from({ length: 1 + rnd(12) }, () => [ops[rnd(3)], 1 + rnd(5)])
    assert.deepEqual(solve(commands), oracle(commands), JSON.stringify(commands))
  }
})
