import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3461 worked examples', () => {
  assert.equal(solve('{"s":"3902"}'), true)
  assert.equal(solve('{"s":"34789"}'), false)
})

test('3461 rejects a string that is too short', () => {
  assert.throws(() => parseInput('{"s":"12"}'))
})

// Independent oracle: after m rounds each remaining digit is a binomial-weighted sum of the originals mod 10,
// so compute the two final digits with Pascal's triangle instead of simulating the rounds.
function oracle({ s }) {
  const d = [...s].map(Number)
  const m = d.length - 2
  let row = [1]
  for (let i = 0; i < m; i++) {
    const next = [1]
    for (let k = 1; k < row.length; k++) next.push(row[k - 1] + row[k])
    next.push(1)
    row = next
  }
  let a = 0
  let b = 0
  for (let k = 0; k <= m; k++) {
    a += row[k] * d[k]
    b += row[k] * d[k + 1]
  }
  return a % 10 === b % 10
}

test('3461 seeded random strings match the binomial oracle', () => {
  let seed = 3461
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let s = ''
    for (let i = 0; i < 3 + rnd(20); i++) s += String(rnd(10))
    assert.equal(solve(JSON.stringify({ s })), oracle({ s }), s)
  }
})
