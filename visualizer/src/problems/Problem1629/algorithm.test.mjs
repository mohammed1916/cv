import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Oracle: compute every duration, then choose the longest and, on ties, the larger letter.
function oracle({ releaseTimes, keysPressed }) {
  let best = null
  let previous = 0
  releaseTimes.forEach((release, i) => {
    const d = release - previous
    previous = release
    if (!best || d > best.d || (d === best.d && keysPressed[i] > best.key)) best = { d, key: keysPressed[i] }
  })
  return best.key
}

test('own sample: a tie in duration goes to the larger letter', () => {
  const run = buildTrace(parseInput('{"releaseTimes":[3,5,9,12,14],"keysPressed":"abcdz"}'))
  // Durations: 3, 2, 4, 3, 2. The 4 for c is the longest, so the answer is c.
  assert.equal(run.result, 'c')
  assert.equal(buildTrace(parseInput('{"releaseTimes":[3,6],"keysPressed":"bz"}')).result, 'z')
  assert.equal(buildTrace(parseInput('{"releaseTimes":[2,4,6],"keysPressed":"ayb"}')).result, 'y')
})

test('random presses agree with the direct oracle', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(15)
    let time = 0
    const releaseTimes = Array.from({ length: n }, () => (time += 1 + rand(6)))
    const keysPressed = Array.from({ length: n }, () => String.fromCharCode(97 + rand(4))).join('')
    const input = { releaseTimes, keysPressed }
    assert.equal(buildTrace(input).result, oracle(input), JSON.stringify(input))
  }
})

test('frames use declared phases, valid code lines, and narration', () => {
  const run = buildTrace({ releaseTimes: [1, 4], keysPressed: 'ab' })
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.message.length > 10)
  }
  assert.ok(python.includes('def slowest_key'))
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"releaseTimes":[2,2],"keysPressed":"ab"}'), /strictly increase/)
  assert.throws(() => parseInput('{"releaseTimes":[2,4],"keysPressed":"a"}'), /one letter/)
})
