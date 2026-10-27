import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3169 official examples', () => {
  assert.equal(solve('{"days":10,"meetings":[[5,7],[1,3],[3,6]]}'), 3)
  assert.equal(solve('{"days":5,"meetings":[[2,4],[1,5]]}'), 0)
  assert.equal(solve('{"days":6,"meetings":[[1,6]]}'), 0)
})

test('3169 meetings that only touch still cover their days once', () => {
  assert.equal(solve('{"days":4,"meetings":[[1,2],[2,2]]}'), 2)
})

test('3169 rejects a meeting past the last day', () => {
  assert.throws(() => parseInput('{"days":3,"meetings":[[2,4]]}'))
})

// Independent oracle: mark each day that any meeting covers and count the unmarked ones.
function oracle({ days, meetings }) {
  const busy = Array(days + 1).fill(false)
  for (const [s, e] of meetings) for (let d = s; d <= e; d++) busy[d] = true
  let free = 0
  for (let d = 1; d <= days; d++) if (!busy[d]) free++
  return free
}

test('3169 random meetings match a day-by-day oracle', () => {
  let seed = 3169
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const days = 1 + rnd(20)
    const meetings = []
    for (let k = 1 + rnd(7); k > 0; k--) { const s = 1 + rnd(days); meetings.push([s, s + rnd(days - s + 1)]) }
    const input = { days, meetings }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
