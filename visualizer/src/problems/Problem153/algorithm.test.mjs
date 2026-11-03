import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

test('153 sample arrays give the expected minimum', () => {
  assert.equal(buildTrace([6, 8, 9, 2, 4]).result, 2)
  assert.equal(buildTrace([7, 1, 3, 5]).result, 1)
  assert.equal(buildTrace([1, 2, 3, 4, 5]).result, 1)
  assert.equal(buildTrace([4]).result, 4)
})

test('153 every rotation of random sorted arrays returns the smallest value', () => {
  let seed = 17
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const pool = Array.from({ length: 200 }, (_, i) => i - 100)
    const sorted = []
    for (let i = 0; i < n; i++) sorted.push(pool.splice(rnd(pool.length), 1)[0])
    sorted.sort((x, y) => x - y)
    const shift = rnd(n)
    const nums = [...sorted.slice(shift), ...sorted.slice(0, shift)]
    assert.equal(buildTrace(nums).result, Math.min(...nums), JSON.stringify(nums))
  }
})

test('153 rejects duplicates and arrays that are not a rotation', () => {
  assert.throws(() => parseInput('[2,2,3]'), /distinct/)
  assert.throws(() => parseInput('[1,3,2,4]'), /rotated/)
  assert.throws(() => parseInput('[]'), /1 to 12/)
})

test('153 frames use declared phases and lines inside the solver', () => {
  const run = buildTrace([6, 8, 9, 2, 4])
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
