import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, trianglePoints } from './algorithm.js'

test('3899 official examples and degenerate inputs', () => {
  const run = buildTrace([3, 4, 5])
  for (const [i, expected] of [36.86989764584402, 53.13010235415598, 90].entries()) assert.ok(Math.abs(run.result[i] - expected) < 1e-8)
  assert.deepEqual(buildTrace([2, 4, 2]).result, [])
  assert.deepEqual(buildTrace([1, 2, 10]).result, [])
})

test('3899 exhaustive sides through 30 agree with independent Heron/atan2 angles and geometry', () => {
  for (let a = 1; a <= 30; a++) for (let b = 1; b <= 30; b++) for (let c = 1; c <= 30; c++) {
    const run = buildTrace([a, b, c]), valid = a + b > c && a + c > b && b + c > a
    assert.equal(run.valid, valid)
    if (!valid) { assert.deepEqual(run.result, []); continue }
    const s = (a + b + c) / 2, area = Math.sqrt(s * (s - a) * (s - b) * (s - c))
    const expected = [[a, b, c], [b, a, c], [c, a, b]].map(([opposite, u, v]) => Math.atan2(4 * area, u * u + v * v - opposite * opposite) * 180 / Math.PI).sort((x, y) => x - y)
    expected.forEach((angle, i) => assert.ok(Math.abs(angle - run.result[i]) < 1e-8))
    assert.ok(Math.abs(run.result.reduce((x, y) => x + y, 0) - 180) < 1e-8)
    const points = trianglePoints(run.sides)
    for (let i = 0; i < 3; i++) {
      const p = points[(i + 1) % 3], q = points[(i + 2) % 3]
      assert.ok(Math.abs(Math.hypot(p[0] - q[0], p[1] - q[1]) - run.sides[i]) < 1e-8)
    }
    assert.deepEqual(run.frames.filter(f => f.phase === 'angle').map(f => f.angles.length), [1, 2, 3])
  }
})

test('3899 thin and large triangles preserve precision; validation rejects malformed data', () => {
  for (const sides of [[1, 1000, 1000], [500, 501, 1000], [1000, 1000, 1000]]) {
    const run = buildTrace(parseInput(JSON.stringify(sides)))
    assert.equal(run.result.length, 3)
    assert.ok(run.result.every(v => Number.isFinite(v) && v > 0 && v < 180))
    assert.ok(Math.abs(run.result.reduce((a, b) => a + b) - 180) < 1e-5)
  }
  for (const data of [null, {}, [], [1, 2], [1, 2, 3, 4], [0, 1, 1], [1, 1, 1001], [1.5, 2, 2]]) assert.throws(() => parseInput(JSON.stringify(data)))
})
