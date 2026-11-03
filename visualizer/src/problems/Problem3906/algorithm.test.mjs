import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, routeIndices } from './algorithm.js'

// Independent oracle: pad each integer, walk the route, and test the non-decreasing rule directly.
function oracle(l, r, directions) {
  const chain = routeIndices(directions)
  let count = 0
  for (let x = Number(l); x <= Number(r); x++) {
    const digits = String(x).padStart(16, '0')
    const seq = chain.map(i => Number(digits[i]))
    if (seq.every((v, i) => i === 0 || seq[i - 1] <= v)) count++
  }
  return count
}

test('3906 route indices follow D and R moves', () => {
  assert.deepEqual(routeIndices('DDDRRR'), [0, 4, 8, 12, 13, 14, 15])
  assert.deepEqual(routeIndices('RRRDDD'), [0, 1, 2, 3, 7, 11, 15])
})

test('3906 matches direct enumeration on small ranges', () => {
  const routes = ['DDDRRR', 'RDRDRD', 'RRRDDD', 'DRDRDR']
  for (const directions of routes) {
    for (const [l, r] of [['0', '0'], ['0', '300'], ['1234', '5678'], ['9000', '9800']]) {
      assert.equal(buildTrace({ l, r, directions }).result, oracle(l, r, directions), `${directions} ${l}..${r}`)
    }
  }
})

test('3906 rejects a route that is not three D and three R', () => {
  assert.throws(() => parseInput('{"l":"0","r":"5","directions":"DDDDRR"}'))
})
