import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3047 official examples', () => {
  assert.equal(solve('[[1,1,3,3],[2,2,4,4]]'), 1)
  assert.equal(solve('[[1,1,2,2],[3,3,4,4]]'), 0)
  assert.equal(solve('[[1,1,3,3],[1,3,3,5]]'), 0)
})

test('3047 the shorter side limits the square', () => {
  assert.equal(solve('[[0,0,10,2],[1,0,9,10]]'), 4)
})

test('3047 rejects a degenerate rectangle', () => {
  assert.throws(() => parseInput('[[1,1,1,3],[0,0,2,2]]'))
})

// Independent oracle: for each side length from large to small, test every square position against both rectangles.
function oracle(rects) {
  const inside = (sq, r) => sq.x >= r[0] && sq.y >= r[1] && sq.x + sq.s <= r[2] && sq.y + sq.s <= r[3]
  for (let s = 20; s >= 1; s--) {
    for (let x = 0; x <= 20 - s; x++) {
      for (let y = 0; y <= 20 - s; y++) {
        for (let i = 0; i < rects.length; i++) {
          for (let j = i + 1; j < rects.length; j++) {
            if (inside({ x, y, s }, rects[i]) && inside({ x, y, s }, rects[j])) return s * s
          }
        }
      }
    }
  }
  return 0
}

test('3047 random rectangles match a square-by-square oracle', () => {
  let seed = 3047
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const count = 2 + rnd(3)
    const rects = []
    for (let k = 0; k < count; k++) {
      const x1 = rnd(10), y1 = rnd(10)
      rects.push([x1, y1, x1 + 1 + rnd(9), y1 + 1 + rnd(9)])
    }
    assert.equal(solve(JSON.stringify(rects)), oracle(rects), JSON.stringify(rects))
  }
})
