import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python, examples } from './algorithm.js'

const solve = (operations, args) => buildTrace({ operations, args }).result

test('1206 sample walkthrough from the presets', () => {
  const { operations, args } = JSON.parse(examples[0].input)
  assert.deepEqual(solve(operations, args), [null, null, null, false, null, true, false, true, false])
})

// Independent oracle: keep a plain array and scan it for every call.
function oracle(operations, args) {
  const bag = []
  return operations.map((op, i) => {
    const num = args[i]
    if (op === 'add') { bag.push(num); return null }
    if (op === 'search') return bag.includes(num)
    const at = bag.indexOf(num)
    if (at !== -1) bag.splice(at, 1)
    return at !== -1
  })
}

let seed = 1206
const rand = n => { seed = (seed * 1664525 + 1013904223) % 4294967296; return Math.floor(seed / 65536) % n }

test('1206 random call sequences match the array oracle', () => {
  for (let trial = 0; trial < 300; trial++) {
    const length = 1 + rand(30)
    const operations = Array.from({ length }, () => ['add', 'search', 'erase'][rand(3)])
    const args = Array.from({ length }, () => rand(12))
    assert.deepEqual(solve(operations, args), oracle(operations, args), JSON.stringify({ operations, args }))
  }
})

test('1206 frames carry snapshots and the bottom level stays sorted', () => {
  const { frames } = buildTrace({ operations: ['add', 'add', 'add', 'erase'], args: [3, 1, 2, 2] })
  assert.ok(frames.every(f => f.snapshot && typeof f.message === 'string' && typeof f.activeLine === 'number'))
  for (const f of frames) {
    const v = f.snapshot.values
    assert.deepEqual([...v].sort((a, b) => a - b), v)
  }
  assert.deepEqual(frames.at(-1).snapshot.values, [1, 3])
})

test('1206 phases and code are exported for the shared shell', () => {
  assert.deepEqual(phases.map(p => p.id), ['start', 'add', 'search', 'erase', 'done'])
  assert.equal(code.length, 33)
  assert.ok(python.includes('def skiplist_operations'))
})

test('1206 rejects bad calls', () => {
  assert.throws(() => parseInput('{"operations":["add"],"args":[1,2]}'), /same length/)
  assert.throws(() => parseInput('{"operations":["pop"],"args":[1]}'), /"add", "search" or "erase"/)
  assert.throws(() => parseInput('{"operations":["add"],"args":[-1]}'), /0 to 20000/)
})
