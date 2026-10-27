import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2580 official examples', () => {
  assert.equal(solve('[[6,10],[5,15]]'), 2)
  assert.equal(solve('[[1,3],[10,20],[2,5],[4,8]]'), 4)
})

test('2580 ranges that only touch at a point stay together', () => {
  assert.equal(solve('[[1,3],[3,5]]'), 2)
  assert.equal(solve('[[1,2],[3,4]]'), 4)
})

test('2580 rejects a reversed range', () => {
  assert.throws(() => parseInput('[[5,1]]'))
})

// Independent oracle: try every two-group assignment and keep those that put every sharing pair together.
function oracle(ranges) {
  const n = ranges.length
  let count = 0n
  for (let mask = 0; mask < 1 << n; mask++) {
    let ok = true
    for (let i = 0; i < n && ok; i++) {
      for (let j = i + 1; j < n && ok; j++) {
        const share = ranges[i][0] <= ranges[j][1] && ranges[j][0] <= ranges[i][1]
        if (share && ((mask >> i) & 1) !== ((mask >> j) & 1)) ok = false
      }
    }
    if (ok) count++
  }
  return Number(count % 1000000007n)
}

test('2580 random ranges match a brute-force assignment oracle', () => {
  let seed = 2580
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(8)
    const ranges = []
    for (let k = 0; k < count; k++) { const l = rnd(15); ranges.push([l, l + rnd(5)]) }
    assert.equal(solve(JSON.stringify(ranges)), oracle(ranges), JSON.stringify(ranges))
  }
})
