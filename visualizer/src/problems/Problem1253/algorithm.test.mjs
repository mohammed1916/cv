import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: track every reachable (ones in top, ones in bottom) pair column by column.
function feasible({ upper, lower, colsum }) {
  let states = new Set(['0,0'])
  for (const total of colsum) {
    const next = new Set()
    for (const key of states) {
      const [a, b] = key.split(',').map(Number)
      if (total === 2) next.add(`${a + 1},${b + 1}`)
      else if (total === 0) next.add(key)
      else { next.add(`${a + 1},${b}`); next.add(`${a},${b + 1}`) }
    }
    states = next
  }
  return states.has(`${upper},${lower}`)
}

function verify({ upper, lower, colsum }, [top, bottom]) {
  assert.equal(top.reduce((s, v) => s + v, 0), upper)
  assert.equal(bottom.reduce((s, v) => s + v, 0), lower)
  colsum.forEach((total, j) => assert.equal(top[j] + bottom[j], total))
}

test('1253 examples', () => {
  assert.deepEqual(solve({ upper: 2, lower: 1, colsum: [1, 1, 1] }), [[1, 1, 0], [0, 0, 1]])
  assert.deepEqual(solve({ upper: 2, lower: 3, colsum: [2, 1, 1, 1] }), [[1, 1, 0, 0], [1, 0, 1, 1]])
  assert.deepEqual(solve({ upper: 1, lower: 0, colsum: [2, 0] }), [])
})

test('1253 rejects a column sum above 2', () => {
  assert.throws(() => parseInput('{"upper":1,"lower":0,"colsum":[3]}'))
})

test('1253 random cases match a reachable-state oracle', () => {
  let seed = 1253
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const cols = 1 + rnd(6)
    const colsum = Array.from({ length: cols }, () => rnd(3))
    const input = { upper: rnd(cols * 2 + 1), lower: rnd(cols * 2 + 1), colsum }
    const result = solve(input)
    assert.equal(result.length > 0, feasible(input), JSON.stringify(input))
    if (result.length) verify(input, result)
  }
})
