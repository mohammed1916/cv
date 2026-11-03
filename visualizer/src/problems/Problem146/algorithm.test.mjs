import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const run = (capacity, commands, args) => buildTrace({ capacity, commands, args }).result

test('146 sample operations return the expected outputs', () => {
  assert.deepEqual(
    run(2, ['put', 'put', 'get', 'put', 'get', 'get'], [[1, 10], [2, 20], [1], [3, 30], [2], [1]]),
    [null, null, 10, null, -1, 10],
  )
})

test('146 reading a key refreshes its recency before eviction', () => {
  assert.deepEqual(
    run(2, ['put', 'put', 'get', 'put', 'get', 'get'], [[5, 1], [6, 2], [5], [7, 3], [6], [5]]),
    [null, null, 1, null, -1, 1],
  )
})

test('146 updating an existing key does not use another capacity slot', () => {
  assert.deepEqual(
    run(2, ['put', 'put', 'put', 'get', 'get'], [[1, 1], [2, 2], [1, 9], [1], [2]]),
    [null, null, null, 9, 2],
  )
})

test('146 capacity one evicts on every new key', () => {
  assert.deepEqual(run(1, ['put', 'get', 'put', 'get', 'get'], [[0, 4], [0], [1, 5], [0], [1]]), [null, 4, null, -1, 5])
})

test('146 frames finish with a done phase and record evictions', () => {
  const { frames } = buildTrace({ capacity: 1, commands: ['put', 'put'], args: [[1, 1], [2, 2]] })
  assert.ok(frames.some(f => f.phase === 'evict' && f.snapshot.evicted === 1))
  assert.equal(frames.at(-1).phase, 'done')
})

test('146 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'), /object/)
  assert.throws(() => parseInput('{"capacity":0,"commands":["get"],"args":[[1]]}'), /capacity/)
  assert.throws(() => parseInput('{"capacity":2,"commands":["get"],"args":[]}'), /same length/)
  assert.throws(() => parseInput('{"capacity":2,"commands":["pop"],"args":[[1]]}'), /get" or "put/)
  assert.throws(() => parseInput('{"capacity":2,"commands":["put"],"args":[[1]]}'), /put/)
})

// Independent oracle: a plain array ordered from least to most recent, with linear scans.
function model(capacity, commands, args) {
  let entries = []
  const out = []
  commands.forEach((command, i) => {
    const find = key => entries.findIndex(e => e.key === key)
    if (command === 'get') {
      const at = find(args[i][0])
      if (at === -1) out.push(-1)
      else {
        const [e] = entries.splice(at, 1)
        entries.push(e)
        out.push(e.value)
      }
    } else {
      const [key, value] = args[i]
      const at = find(key)
      if (at !== -1) entries.splice(at, 1)
      else if (entries.length === capacity) entries.shift()
      entries.push({ key, value })
      out.push(null)
    }
  })
  return out
}

test('146 random operation sequences match the array model', () => {
  let seed = 13
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const capacity = 1 + rnd(4)
    const len = 1 + rnd(25)
    const commands = []
    const args = []
    for (let i = 0; i < len; i++) {
      if (rnd(2)) { commands.push('put'); args.push([rnd(6), rnd(100)]) } else { commands.push('get'); args.push([rnd(6)]) }
    }
    assert.deepEqual(run(capacity, commands, args), model(capacity, commands, args), JSON.stringify({ capacity, commands, args }))
  }
})
