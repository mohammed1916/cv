import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (series1, series2) => buildTrace({ series1, series2 }).result

test('4001 official examples', () => {
  assert.deepEqual(solve([[1, 3], [4, 1]], [[2, 2], [5, 2]]), [[1, 5], [2, 3], [4, 3], [5, 2]])
  assert.deepEqual(solve([[1, 5], [3, 1]], [[2, 2]]), [[1, 7], [2, 3], [3, 1]])
  assert.deepEqual(solve([[1, 5]], [[1000000000, 2]]), [[1, 7], [1000000000, 2]])
})

test('4001 a shared timestamp sums both values directly', () => {
  assert.deepEqual(solve([[3, 4]], [[3, 5]]), [[3, 9]])
})

test('4001 rejects timestamps that are not increasing', () => {
  assert.throws(() => parseInput('{"series1":[[2,1],[2,3]],"series2":[[1,1]]}'))
})

// Independent oracle: for each timestamp, scan every entry and take the earliest one at or after it.
function oracle(series1, series2) {
  const at = (series, t) => {
    const hit = series.filter(p => p[0] >= t).sort((a, b) => a[0] - b[0])[0]
    return hit ? hit[1] : 0
  }
  const stamps = [...new Set([...series1, ...series2].map(p => p[0]))].sort((a, b) => a - b)
  return stamps.map(t => [t, at(series1, t) + at(series2, t)])
}

test('4001 random series match a scan oracle', () => {
  let seed = 4001
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const series = () => {
    let t = 0
    return Array.from({ length: 1 + rnd(6) }, () => { t += 1 + rnd(4); return [t, 1 + rnd(9)] })
  }
  for (let k = 0; k < 300; k++) {
    const s1 = series()
    const s2 = series()
    assert.deepEqual(solve(s1, s2), oracle(s1, s2), JSON.stringify([s1, s2]))
  }
})
