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

const SAMPLE = '{"users":[{"user_id":1,"email":"ann@example.com"},{"user_id":2,"email":"1bob@example.com"},{"user_id":3,"email":"carl_9@example.com"},{"user_id":4,"email":"dee@example.org"},{"user_id":5,"email":"e.f-g@example.com"},{"user_id":6,"email":"ghi@EXAMPLE.com"}]}'

test('3436 sample keeps the three matching users in id order', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(trace.result, [
    { user_id: 1, email: 'ann@example.com' },
    { user_id: 3, email: 'carl_9@example.com' },
    { user_id: 5, email: 'e.f-g@example.com' },
  ])
  assertFrames(trace)
})

test('3436 empty table and rejected input', () => {
  assert.deepEqual(solve('{"users":[]}'), [])
  assert.throws(() => parseInput('{"users":[{"user_id":"1","email":"a@example.com"}]}'))
  assert.throws(() => parseInput(JSON.stringify({ users: Array.from({ length: 13 }, (_, i) => ({ user_id: i + 1, email: 'a@example.com' })) })))
})

// Independent oracle written as a character-by-character rule, not as the regular expression.
function oracle(email) {
  const at = email.indexOf('@')
  if (at < 0 || email.slice(at + 1) !== 'example.com') return false
  const local = email.slice(0, at)
  if (!/^[A-Za-z]/.test(local)) return false
  return [...local].every(c => /[A-Za-z0-9_.-]/.test(c))
}

test('3436 random emails match the character-rule oracle', () => {
  let seed = 3436
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'aZ1_.-@x'
  const domains = ['example.com', 'example.org', 'EXAMPLE.com']
  for (let t = 0; t < 300; t++) {
    const local = Array.from({ length: 1 + rnd(5) }, () => alphabet[rnd(alphabet.length)]).join('')
    const email = `${local}@${domains[rnd(domains.length)]}`
    const text = JSON.stringify({ users: [{ user_id: 7, email }] })
    assert.equal(solve(text).length, oracle(email) ? 1 : 0, email)
  }
})
