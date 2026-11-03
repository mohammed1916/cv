import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: breadth-first search over strings, where a flip inverts every bit from some index to the end.
function bruteFlips(target) {
  const start = '0'.repeat(target.length)
  const dist = new Map([[start, 0]])
  const queue = [start]
  for (let q = 0; q < queue.length; q++) {
    const cur = queue[q]
    if (cur === target) return dist.get(cur)
    for (let i = 0; i < cur.length; i++) {
      const next = cur.slice(0, i) + cur.slice(i).split('').map(c => (c === '0' ? '1' : '0')).join('')
      if (!dist.has(next)) { dist.set(next, dist.get(cur) + 1); queue.push(next) }
    }
  }
  return -1
}

test('1529 sample strings give the expected flip counts', () => {
  assert.equal(buildTrace('011001').result, 3)
  assert.equal(buildTrace('10').result, 2)
  assert.equal(buildTrace('000').result, 0)
  assert.equal(buildTrace('1').result, 1)
})

test('1529 every string up to length 6 matches the breadth-first oracle', () => {
  for (let n = 1; n <= 6; n++) {
    for (let mask = 0; mask < 1 << n; mask++) {
      const target = mask.toString(2).padStart(n, '0')
      assert.equal(buildTrace(target).result, bruteFlips(target), target)
    }
  }
})

test('1529 rejects malformed input', () => {
  assert.throws(() => parseInput('"0121"'), /binary/)
  assert.throws(() => parseInput('"0101010101010"'), /binary/)
  assert.throws(() => parseInput('[0,1]'), /binary/)
})

test('1529 frames use declared phases and lines inside the solver', () => {
  const run = buildTrace('011001')
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
