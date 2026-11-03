import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

function assertFrames(trace) {
  assert.ok(trace.frames.length >= 2)
  for (const frame of trace.frames) {
    assert.ok(phases.some(phase => phase.id === frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine > 0)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine > 0)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.rows))
  }
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

const logs = [
  [1, '192.168.1.1', 200], [2, '256.1.1.1', 404], [3, '1.2.3', 500], [4, '01.2.3.4', 200], [5, '256.1.1.1', 500],
  [6, '10.0.0.1', 200], [7, '1.2.3.4.5', 200], [8, '1.2.3', 404], [9, 'a.b.c.d', 200], [10, '999.0.0.1', 200],
].map(([log_id, ip, status_code]) => ({ log_id, ip, status_code }))
const SAMPLE = JSON.stringify({ logs })

test('3451 sample counts invalid ips, most frequent first then ip ascending', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(trace.result, [
    { ip: '1.2.3', invalid_count: 2 },
    { ip: '256.1.1.1', invalid_count: 2 },
    { ip: '01.2.3.4', invalid_count: 1 },
    { ip: '1.2.3.4.5', invalid_count: 1 },
    { ip: '999.0.0.1', invalid_count: 1 },
    { ip: 'a.b.c.d', invalid_count: 1 },
  ])
  assertFrames(trace)
})

test('3451 no invalid rows and rejected input', () => {
  assert.deepEqual(solve('{"logs":[{"log_id":1,"ip":"8.8.8.8","status_code":200}]}'), [])
  assert.throws(() => parseInput('{"logs":[{"log_id":1,"ip":"8.8.8.8"}]}'))
})

// Independent oracle: split on dots, then read each octet as a number instead of using the pattern.
function oracle(ip) {
  const parts = ip.split('.')
  return parts.length === 4 && parts.every(part => /^(0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255)
}

test('3451 random ips match the numeric oracle', () => {
  let seed = 3451
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const chars = '0123456789..a'
  for (let t = 0; t < 300; t++) {
    const ip = Array.from({ length: 1 + rnd(12) }, () => chars[rnd(chars.length)]).join('')
    const expected = oracle(ip) ? 0 : 1
    assert.equal(solve(JSON.stringify({ logs: [{ log_id: 1, ip, status_code: 200 }] })).length, expected, ip)
  }
})
