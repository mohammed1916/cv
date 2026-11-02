import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arrival, state) => buildTrace({ arrival, state }).result

test('2534 simulated examples under the stated rule', () => {
  // Second 0: person 0 enters. Second 1: both wait, door used last second for enter, so person 2 enters.
  // Second 2: only person 1 waits to exit.
  assert.deepEqual(solve([0, 1, 1], [0, 1, 0]), [0, 2, 1])
  // Second 0: person 0 exits alone. Seconds 1 and 2 idle. Second 3: both wait and the door was idle, so exit (person 2) goes; person 1 enters at 4.
  assert.deepEqual(solve([0, 3, 3], [1, 0, 1]), [0, 4, 3])
})

test('2534 an idle door lets exiting go first', () => {
  // Nobody at second 0; both directions wait at second 1 and the door was idle, so the exit (person 0) goes first.
  assert.deepEqual(solve([1, 1], [0, 1]), [2, 1])
})

test('2534 rejects a bad state value', () => {
  assert.throws(() => parseInput('{"arrival":[0],"state":[2]}'))
  assert.throws(() => parseInput('{"arrival":[0,1],"state":[0]}'))
})

// Oracle: process each second explicitly, scanning all people each time, with a separate encoding of the rule.
function oracle(arrival, state) {
  const n = arrival.length
  const res = Array(n).fill(-1)
  let lastDir = -1, lastSecond = -5
  let t = 0
  let left = n
  while (left > 0) {
    const ins = [], outs = []
    for (let i = 0; i < n; i++) if (res[i] < 0 && arrival[i] <= t) (state[i] === 0 ? ins : outs).push(i)
    if (ins.length === 0 && outs.length === 0) { t++; continue }
    let dir
    if (ins.length && outs.length) dir = lastSecond === t - 1 ? lastDir : 1
    else dir = ins.length ? 0 : 1
    const who = dir === 0 ? ins[0] : outs[0]
    res[who] = t
    lastDir = dir
    lastSecond = t
    left--
    t++
  }
  return res
}

test('2534 random inputs match a second-by-second oracle', () => {
  let seed = 2534
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const arrival = Array.from({ length: n }, () => rnd(12))
    const state = Array.from({ length: n }, () => rnd(2))
    assert.deepEqual(solve(arrival, state), oracle(arrival, state), JSON.stringify({ arrival, state }))
  }
})
