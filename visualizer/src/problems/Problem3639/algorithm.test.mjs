import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python } from './algorithm.js'

const pyLines = python.split('\n')
const ids = new Set(phases.map(phase => phase.id))

// Oracle: recount every substring directly after each star.
function bruteCounts(s, order) {
  const star = Array(s.length).fill(false)
  return order.map(index => {
    star[index] = true
    let count = 0
    for (let a = 0; a < s.length; a++) {
      let seen = false
      for (let b = a; b < s.length; b++) {
        seen = seen || star[b]
        if (seen) count++
      }
    }
    return count
  })
}
const bruteAnswer = (s, order, k) => bruteCounts(s, order).findIndex(count => count >= k)

function checkFrames(trace) {
  for (const frame of trace.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(pyLines[frame.pythonLine - 1]?.trim())
    assert.ok(frame.message.length > 0)
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
}

const run = (s, order, k) => buildTrace(parseInput(JSON.stringify({ s, order, k })))

test('3639 hand-computed gains on bridge', () => {
  const trace = run('bridge', [3, 0, 5, 1, 4, 2], 18)
  assert.equal(trace.result, 3)
  assert.deepEqual(trace.frames.at(-1).history.map(row => [row.gain, row.valid]), [[12, 12], [3, 15], [2, 17], [2, 19]])
  checkFrames(trace)
})

test('3639 presets', () => {
  const expected = [3, 0, -1]
  examples.forEach((example, index) => {
    const trace = buildTrace(parseInput(example.input))
    assert.equal(trace.result, expected[index])
    checkFrames(trace)
  })
})

test('3639 exact boundary values of k', () => {
  assert.equal(run('bridge', [3, 0, 5, 1, 4, 2], 12).result, 0)
  assert.equal(run('bridge', [3, 0, 5, 1, 4, 2], 13).result, 1)
  assert.equal(run('bridge', [3, 0, 5, 1, 4, 2], 21).result, 5)
  assert.equal(run('bridge', [3, 0, 5, 1, 4, 2], 22).result, -1)
  assert.equal(run('z', [0], 1).result, 0)
  assert.equal(run('z', [0], 2).result, -1)
})

test('3639 matches recounting every substring on random inputs', () => {
  let seed = 3639
  const next = limit => (seed = (seed * 1103515245 + 12345) % 2147483648) % limit
  for (let round = 0; round < 400; round++) {
    const n = 1 + next(16)
    const s = Array.from({ length: n }, () => String.fromCharCode(97 + next(26))).join('')
    const order = Array.from({ length: n }, (_, index) => index)
    for (let i = n - 1; i > 0; i--) {
      const j = next(i + 1);
      [order[i], order[j]] = [order[j], order[i]]
    }
    const k = 1 + next(n * (n + 1) / 2 + 3)
    const trace = run(s, order, k)
    assert.equal(trace.result, bruteAnswer(s, order, k))
    checkFrames(trace)
    const counts = bruteCounts(s, order)
    trace.frames.at(-1).history.forEach(row => assert.equal(row.valid, counts[row.t]))
  }
})

test('3639 frames keep stars sorted and the gap free of stars', () => {
  const { frames } = run('fountains', [4, 7, 1, 0, 8, 2, 6, 3, 5], 45)
  for (const frame of frames) {
    assert.deepEqual(frame.stars, [...frame.stars].sort((a, b) => a - b))
    if (frame.phase === 'bounds') {
      assert.ok(frame.stars.every(star => star <= frame.left || star >= frame.right))
      assert.ok(frame.left < frame.i && frame.i < frame.right)
    }
  }
})

test('3639 rejects malformed input', () => {
  assert.throws(() => parseInput('{"s":"Ab","order":[0,1],"k":1}'))
  assert.throws(() => parseInput('{"s":"ab","order":[0,0],"k":1}'))
  assert.throws(() => parseInput('{"s":"ab","order":[0],"k":1}'))
  assert.throws(() => parseInput('{"s":"ab","order":[0,1],"k":0}'))
  assert.throws(() => parseInput('{"s":"ab","order":[0,1],"k":1000000001}'))
})
