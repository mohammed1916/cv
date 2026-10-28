import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3609 official examples', () => {
  assert.equal(solve([1, 2, 5, 4]), 2)
  assert.equal(solve([0, 1, 2, 3]), 3)
  assert.equal(solve([1, 1, 2, 2]), -1)
})

test('3609 start equal to target needs no moves', () => {
  assert.equal(solve([4, 7, 4, 7]), 0)
})

test('3609 rejects a start past the target and a wrong length', () => {
  assert.throws(() => parseInput('[2,0,1,0]'))
  assert.throws(() => parseInput('[1,2,3]'))
})

// Independent oracle: forward breadth-first search from the start, moves kept inside a small box.
const BOX = 20
function forward(sx, sy) {
  const dist = new Map([[`${sx},${sy}`, 0]])
  const queue = [[sx, sy]]
  for (let head = 0; head < queue.length; head++) {
    const [x, y] = queue[head]
    const m = Math.max(x, y)
    for (const [nx, ny] of [[x + m, y], [x, y + m]]) {
      if (nx > BOX || ny > BOX || dist.has(`${nx},${ny}`)) continue
      dist.set(`${nx},${ny}`, dist.get(`${x},${y}`) + 1)
      queue.push([nx, ny])
    }
  }
  return dist
}

test('3609 random targets match a forward search oracle', () => {
  let seed = 3609
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const sx = rnd(BOX + 1), sy = rnd(BOX + 1)
    const tx = sx + rnd(BOX + 1 - sx), ty = sy + rnd(BOX + 1 - sy)
    const expected = forward(sx, sy).get(`${tx},${ty}`) ?? -1
    assert.equal(solve([sx, sy, tx, ty]), expected, JSON.stringify([sx, sy, tx, ty]))
  }
})
