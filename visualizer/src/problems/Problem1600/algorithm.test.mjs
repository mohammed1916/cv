import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (king, operations) => buildTrace(parseInput(JSON.stringify({ king, operations }))).result

test('1600 official example: birth order, then a death', () => {
  const operations = [
    ['birth', 'king', 'andy'], ['birth', 'king', 'bob'], ['birth', 'king', 'catherine'],
    ['birth', 'andy', 'matthew'], ['birth', 'bob', 'alex'], ['birth', 'bob', 'asha'],
    ['order'], ['death', 'bob'], ['order'],
  ]
  assert.deepEqual(solve('king', operations), [
    ['king', 'andy', 'matthew', 'bob', 'alex', 'asha', 'catherine'],
    ['king', 'andy', 'matthew', 'alex', 'asha', 'catherine'],
  ])
})

test('1600 a dead king still passes the throne to his children', () => {
  assert.deepEqual(solve('a', [['birth', 'a', 'b'], ['death', 'a'], ['order']]), [['b']])
})

test('1600 rejects a child whose parent is unknown', () => {
  assert.throws(() => parseInput('{"king":"a","operations":[["birth","x","b"]]}'))
})

// Independent oracle: give each person the path of birth positions from the king, then sort the living by that path.
function oracle(king, operations) {
  const parent = new Map([[king, null]])
  const position = new Map([[king, 0]])
  const nextChild = new Map([[king, 0]])
  const dead = new Set()
  const out = []
  const pathOf = name => {
    const path = []
    for (let cur = name; parent.get(cur) !== null; cur = parent.get(cur)) path.unshift(position.get(cur))
    return path
  }
  const compare = (a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i]
    return a.length - b.length
  }
  for (const op of operations) {
    if (op[0] === 'birth') {
      const k = nextChild.get(op[1])
      nextChild.set(op[1], k + 1)
      parent.set(op[2], op[1])
      position.set(op[2], k)
      nextChild.set(op[2], 0)
    } else if (op[0] === 'death') {
      dead.add(op[1])
    } else {
      const names = [...parent.keys()].filter(n => !dead.has(n))
      names.sort((a, b) => compare(pathOf(a), pathOf(b)))
      out.push(names)
    }
  }
  return out
}

test('1600 random families match a path-sorting oracle', () => {
  let seed = 1600
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pool = 'bcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 300; t++) {
    const names = ['a']
    const free = pool.split('')
    const operations = []
    const steps = 1 + rnd(12)
    for (let i = 0; i < steps; i++) {
      const kind = rnd(5)
      if (kind < 2 && free.length > 0) {
        const child = free.shift()
        operations.push(['birth', names[rnd(names.length)], child])
        names.push(child)
      } else if (kind === 2) {
        operations.push(['death', names[rnd(names.length)]])
      } else {
        operations.push(['order'])
      }
    }
    operations.push(['order'])
    assert.deepEqual(solve('a', operations), oracle('a', operations), JSON.stringify(operations))
  }
})
