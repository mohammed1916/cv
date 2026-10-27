import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2280 official examples', () => {
  assert.equal(solve('[[1,7],[2,6],[3,5],[4,4],[5,4],[6,3],[7,2],[8,1]]'), 3)
  assert.equal(solve('[[3,4],[1,2],[7,8],[2,3]]'), 1)
})

test('2280 one point needs no line and two points need one', () => {
  assert.equal(solve('[[5,5]]'), 0)
  assert.equal(solve('[[9,1],[2,3]]'), 1)
})

test('2280 rejects a repeated day', () => {
  assert.throws(() => parseInput('[[1,1],[1,2]]'))
})

// Independent oracle: reduce each slope to lowest terms and count changes between consecutive reduced slopes.
function oracle(points) {
  const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b))
  const sorted = points.slice().sort((a, b) => a[0] - b[0])
  if (sorted.length === 1) return 0
  const slopes = []
  for (let i = 1; i < sorted.length; i++) {
    let dx = sorted[i][0] - sorted[i - 1][0], dy = sorted[i][1] - sorted[i - 1][1]
    const g = gcd(dx, dy)
    dx /= g; dy /= g
    slopes.push(`${dy}/${dx}`)
  }
  let lines = 1
  for (let i = 1; i < slopes.length; i++) if (slopes[i] !== slopes[i - 1]) lines++
  return lines
}

test('2280 random chains match a reduced-slope oracle', () => {
  let seed = 2280
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(9)
    const days = new Set()
    while (days.size < count) days.add(1 + rnd(20))
    const points = [...days].map(d => [d, 1 + rnd(20)])
    assert.equal(solve(JSON.stringify(points)), oracle(points), JSON.stringify(points))
  }
})
