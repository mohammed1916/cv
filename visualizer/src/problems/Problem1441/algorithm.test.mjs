import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: replay the operations against the stream 1..n and check the stack equals the target.
function replays(ops, target, n) {
  const stack = []
  let next = 1
  for (const op of ops) {
    if (op === 'Push') {
      if (next > n) return false
      stack.push(next++)
    } else {
      if (!stack.length) return false
      stack.pop()
    }
  }
  return next <= n + 1 && JSON.stringify(stack) === JSON.stringify(target)
}

// All strictly increasing subsets of 1..n (non-empty), used as exhaustive targets.
function targetsUpTo(n) {
  const out = []
  for (let mask = 1; mask < 1 << n; mask++) {
    const t = []
    for (let v = 1; v <= n; v++) if (mask & (1 << (v - 1))) t.push(v)
    out.push(t)
  }
  return out
}

test('a target with a skipped value uses push-pop for the skipped one', () => {
  assert.deepEqual(buildTrace({ target: [1, 3], n: 3 }).result, ['Push', 'Push', 'Pop', 'Push'])
})

test('a target that is the whole stream has only pushes', () => {
  assert.deepEqual(buildTrace({ target: [1, 2, 3], n: 3 }).result, ['Push', 'Push', 'Push'])
})

test('a single late value skips everything before it', () => {
  assert.deepEqual(buildTrace({ target: [4], n: 4 }).result, ['Push', 'Pop', 'Push', 'Pop', 'Push', 'Pop', 'Push'])
})

test('every increasing target up to n = 6 is reproduced by its operations', () => {
  for (let n = 1; n <= 6; n++) {
    for (const target of targetsUpTo(n)) {
      const ops = buildTrace({ target, n }).result
      assert.ok(replays(ops, target, n), `target ${target} with n=${n}`)
    }
  }
})

test('frames use declared phases and existing code lines', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const frame of buildTrace({ target: [2, 5], n: 6 }).frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(code.some(l => l.line === frame.activeLine))
  }
  assert.equal(code.length, python.split('\n').length)
})

test('parseInput rejects unsorted, out-of-range and oversized targets', () => {
  assert.throws(() => parseInput('{"target":[2,1],"n":3}'), /increasing/)
  assert.throws(() => parseInput('{"target":[4],"n":3}'), /from 1 to 3/)
  assert.throws(() => parseInput('{"target":[1,2,3,4],"n":3}'), /between 1 and n/)
  assert.deepEqual(parseInput('{"target":[1,3],"n":3}'), { target: [1, 3], n: 3 })
})
