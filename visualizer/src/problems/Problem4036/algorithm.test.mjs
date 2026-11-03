import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('4036 hand-checked counts', () => {
  assert.deepEqual(solve([3, 5, 6]), ['ba', 'ca', 'cb'])
  assert.deepEqual(solve([1]), ['a'])
  assert.deepEqual(solve([2]), ['b'])
  assert.deepEqual(solve([7]), ['cba'])
})

test('4036 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Oracle: enumerate every string reachable from a^x by merging equal neighbours, keep the greatest.
function oracle(x) {
  const seen = new Set([ 'a'.repeat(x) ])
  const queue = [ 'a'.repeat(x) ]
  let best = queue[0]
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i]
    if (cur > best) best = cur
    for (let p = 0; p + 1 < cur.length; p++) {
      if (cur[p] === cur[p + 1] && cur[p] !== 'z') {
        const nx = cur.slice(0, p) + String.fromCharCode(cur.charCodeAt(p) + 1) + cur.slice(p + 2)
        if (!seen.has(nx)) { seen.add(nx); queue.push(nx) }
      }
    }
  }
  return best
}

test('4036 counts up to 14 match an exhaustive merge search', () => {
  for (let x = 1; x <= 14; x++) assert.equal(solve([x])[0], oracle(x), `x=${x}`)
})

test('4036 large count keeps letters within a to z', () => {
  const [s] = solve([100000000])
  assert.ok([...s].every(c => c >= 'a' && c <= 'z'))
  assert.equal([...s].reduce((total, c) => total + 2 ** (c.charCodeAt(0) - 97), 0), 100000000)
})
