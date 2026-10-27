import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1610 official examples', () => {
  assert.equal(solve('{"points":[[2,1],[2,2],[3,3]],"angle":90,"location":[1,1]}'), 3)
  // Both points lie in the same direction, so a zero-width view still sees both.
  assert.equal(solve('{"points":[[2,1],[4,1]],"angle":0,"location":[1,1]}'), 2)
  // Two points sit on the viewer (always visible); the point at (2, 2) is one direction away.
  assert.equal(solve('{"points":[[1,1],[2,2],[1,1]],"angle":0,"location":[1,1]}'), 3)
})

test('1610 a full turn sees every point once', () => {
  assert.equal(solve('{"points":[[1,0],[0,1],[-1,0],[0,-1]],"angle":360,"location":[0,0]}'), 4)
})

test('1610 rejects a view angle over 360', () => {
  assert.throws(() => parseInput('{"points":[[1,0]],"angle":361,"location":[0,0]}'))
})

// Independent oracle: start the view at each point's direction and count every point inside the cone.
function oracle({ points, angle, location }) {
  const [lx, ly] = location
  let same = 0
  const dirs = []
  for (const [x, y] of points) {
    if (x === lx && y === ly) same++
    else dirs.push(Math.atan2(y - ly, x - lx) * (180 / Math.PI))
  }
  let best = 0
  for (const start of dirs) {
    let count = 0
    for (const d of dirs) {
      let rel = ((d - start) % 360 + 360) % 360
      if (rel > 360 - 1e-9) rel -= 360
      if (rel >= -1e-9 && rel <= angle + 1e-9) count++
    }
    best = Math.max(best, count)
  }
  return best + same
}

test('1610 random layouts match a start-at-each-point oracle', () => {
  let seed = 1610
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(10)
    const points = []
    for (let k = 0; k < count; k++) points.push([rnd(9) - 4, rnd(9) - 4])
    const location = [rnd(9) - 4, rnd(9) - 4]
    const input = { points, angle: rnd(181), location }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
