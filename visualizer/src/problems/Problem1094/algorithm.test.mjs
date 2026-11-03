import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (capacity, trips) => buildTrace(parseInput(JSON.stringify({ capacity, trips }))).result

test('1094 sample trips', () => {
  const trips = [[2, 0, 3], [2, 3, 6], [1, 1, 5]]
  assert.equal(solve(4, trips), true)
  assert.equal(solve(3, trips), true)
  assert.equal(solve(2, trips), false)
  assert.equal(solve(2, [[2, 0, 4]]), true)
})

test('1094 drop-off and pickup at one stop do not double count', () => {
  assert.equal(solve(2, [[2, 0, 3], [2, 3, 6]]), true)
  assert.equal(solve(2, [[2, 0, 3], [1, 2, 4]]), false)
})

test('1094 rejects malformed input', () => {
  assert.throws(() => parseInput('{"capacity":0,"trips":[[1,0,1]]}'), /capacity/)
  assert.throws(() => parseInput('{"capacity":3,"trips":[[1,2,2]]}'), /start < end/)
  assert.throws(() => parseInput('{"capacity":3,"trips":[[1,0,21]]}'), /start < end/)
  assert.throws(() => parseInput('{"capacity":3,"trips":[[0,0,1]]}'), /passengers/)
})

test('1094 frames point at real code and Python lines', () => {
  const { frames } = buildTrace({ capacity: 4, trips: [[2, 0, 3]] })
  const pyCount = python.split('\n').length
  for (const frame of frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount, frame.message)
  }
})

// Independent oracle: for each stop, sum the passengers on board by checking every trip directly.
test('1094 random trips match a per-stop oracle', () => {
  let seed = 1094
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const capacity = 1 + rnd(10)
    const trips = Array.from({ length: 1 + rnd(8) }, () => {
      const start = rnd(20)
      const end = start + 1 + rnd(20 - start)
      return [1 + rnd(10), start, end]
    })
    let fits = true
    for (let stop = 0; stop <= 20; stop++) {
      const onBoard = trips.reduce((sum, [p, s, e]) => sum + (s <= stop && stop < e ? p : 0), 0)
      if (onBoard > capacity) fits = false
    }
    assert.equal(solve(capacity, trips), fits, JSON.stringify({ capacity, trips }))
  }
})
