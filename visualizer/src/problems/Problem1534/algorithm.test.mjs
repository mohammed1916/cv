import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: enumerate index combinations with a bitmask instead of nested loops.
function oracle({ arr, a, b, c }) {
  const n = arr.length
  let total = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const idx = []
    for (let t = 0; t < n; t++) if (mask & (1 << t)) idx.push(t)
    if (idx.length !== 3) continue
    const [x, y, z] = idx
    if (Math.abs(arr[x] - arr[y]) <= a && Math.abs(arr[y] - arr[z]) <= b && Math.abs(arr[x] - arr[z]) <= c) total += 1
  }
  return total
}

test('1534 sample inputs give the expected counts', () => {
  assert.equal(buildTrace({ arr: [4, 2, 6, 3, 8], a: 3, b: 2, c: 4 }).result, oracle({ arr: [4, 2, 6, 3, 8], a: 3, b: 2, c: 4 }))
  assert.equal(buildTrace({ arr: [1, 2, 3], a: 1, b: 1, c: 2 }).result, 1)
  assert.equal(buildTrace({ arr: [7, 7, 7, 7], a: 0, b: 0, c: 0 }).result, 4)
})

test('1534 random small inputs match the bitmask oracle', () => {
  let seed = 3
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const arr = Array.from({ length: 3 + rnd(6) }, () => rnd(21))
    const input = { arr, a: rnd(21), b: rnd(21), c: rnd(21) }
    assert.equal(buildTrace(input).result, oracle(input), JSON.stringify(input))
  }
})

test('1534 rejects malformed input', () => {
  assert.throws(() => parseInput('{"arr":[1,2],"a":1,"b":1,"c":1}'), /3 to 12/)
  assert.throws(() => parseInput('{"arr":[1,2,3],"a":-1,"b":1,"c":1}'), /a is/)
  assert.throws(() => parseInput('[1,2,3]'), /object/)
})

test('1534 frames use declared phases and lines inside the solver', () => {
  const run = buildTrace({ arr: [4, 2, 6, 3, 8], a: 3, b: 2, c: 4 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
