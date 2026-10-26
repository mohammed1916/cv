import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Oracle: try every assignment of cards to groups (no greedy reasoning).
function brute(hand, g) {
  const n = hand.length
  if (n % g) return false
  const groups = n / g
  const assign = new Array(n).fill(0)
  const check = () => {
    const members = Array.from({ length: groups }, () => [])
    assign.forEach((gi, i) => members[gi].push(hand[i]))
    return members.every(m => m.length === g && (m.sort((a, b) => a - b), m.every((v, i) => i === 0 || v === m[i - 1] + 1)))
  }
  const rec = i => {
    if (i === n) return check()
    for (let gi = 0; gi < groups; gi++) { assign[i] = gi; if (rec(i + 1)) return true }
    return false
  }
  return rec(0)
}
test('official examples', () => {
  assert.equal(buildTrace({ hand: [1, 2, 3, 6, 2, 3, 4, 7, 8], groupSize: 3 }).result, true)
  assert.equal(buildTrace({ hand: [1, 2, 3, 4, 5], groupSize: 4 }).result, false)
})
test('random small hands match exhaustive partition search', () => {
  let seed = 21
  const rnd = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) % n }
  for (let t = 0; t < 300; t++) {
    const g = 1 + rnd(3), groups = 1 + rnd(3)
    let hand = []
    if (rnd(2)) for (let i = 0; i < groups; i++) { const s = rnd(4); for (let k = 0; k < g; k++) hand.push(s + k) }
    else hand = Array.from({ length: g * groups }, () => rnd(5))
    if (rnd(4) === 0) hand[rnd(hand.length)] = rnd(6)
    const tr = buildTrace({ hand, groupSize: g })
    assert.equal(tr.result, brute(hand, g), JSON.stringify({ hand, g }))
    assert.equal(tr.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"hand":[1,2],"groupSize":3}')); assert.throws(() => parseInput('[1,2]')); assert.throws(() => parseInput('{"hand":[],"groupSize":1}'))
})
