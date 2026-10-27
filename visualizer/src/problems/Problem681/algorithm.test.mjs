import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = time => buildTrace(time).result

test('681 official examples', () => {
  assert.equal(solve('19:34'), '19:39')
  assert.equal(solve('23:59'), '22:22')
  assert.equal(solve('11:11'), '11:11')
})

test('681 rejects an impossible clock time', () => {
  assert.throws(() => parseInput('"24:00"'))
})

// Independent oracle: walk forward one minute at a time until the digits all come from the original set.
function oracle(time) {
  const allowed = new Set(time.replace(':', ''))
  let minutes = Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
  for (let step = 1; step <= 1440; step++) {
    minutes = (minutes + 1) % 1440
    const text = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
    if ([...text.replace(':', '')].every(ch => allowed.has(ch))) return text
  }
  return time
}

test('681 every clock time matches a minute-by-minute oracle', () => {
  for (let m = 0; m < 1440; m++) {
    const time = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    assert.equal(solve(time), oracle(time), time)
  }
})
