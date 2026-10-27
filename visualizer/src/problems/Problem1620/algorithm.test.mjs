import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (towers, radius) => buildTrace(parseInput(JSON.stringify({ towers, radius }))).result

test('1620 examples', () => {
  assert.deepEqual(solve([[1, 2, 5], [2, 1, 7], [3, 1, 9]], 2), [2, 1])
  assert.deepEqual(solve([[12, 11, 15]], 9), [12, 11])
})

test('1620 no tower reaches the point, so the origin wins', () => {
  assert.deepEqual(solve([[5, 5, 0]], 3), [0, 0])
})

test('1620 rejects bad input', () => {
  assert.throws(() => parseInput('{"towers":[],"radius":2}'))
  assert.throws(() => parseInput('{"towers":[[1,1,1]],"radius":-1}'))
  assert.throws(() => parseInput('{"towers":[[21,1,1]],"radius":2}'))
})

// Independent oracle: scan a larger box than the code does, using the same quality rule but no bounding argument.
function oracle(towers, radius) {
  let best = null
  let bestQ = -1
  const top = Math.max(...towers.map(t => Math.max(t[0], t[1]))) + 3
  for (let x = 0; x <= top; x++) {
    for (let y = 0; y <= top; y++) {
      let q = 0
      for (const [tx, ty, quality] of towers) {
        const d = Math.sqrt((tx - x) ** 2 + (ty - y) ** 2)
        if (d <= radius) q += Math.floor(quality / (1 + d))
      }
      if (q > bestQ) { bestQ = q; best = [x, y] }
    }
  }
  return best
}

test('1620 random towers match the wider scan oracle', () => {
  let seed = 1620
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const towers = []
    for (let i = 0; i < 1 + rnd(5); i++) towers.push([rnd(21), rnd(21), rnd(21)])
    const radius = rnd(21)
    assert.deepEqual(solve(towers, radius), oracle(towers, radius), JSON.stringify({ towers, radius }))
  }
})
