import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = emails => buildTrace({ emails }).result

test('3860 hand-checked presets', () => {
  assert.equal(solve(['Lee.Ann+work@Mail.com', 'leeann@mail.com', 'LEE.A.N.N+x@mail.COM', 'ann@mail.com.au']), 2)
  assert.equal(solve(['x.y.z+1@A.io', 'xyz@a.IO', 'xy+z@a.io', 'x.yz@b.io']), 3)
})

test('3860 domain dots are not removed', () => {
  assert.equal(solve(['a@b.c', 'a@bc']), 2)
})

test('3860 a plus at the start leaves an empty local part', () => {
  assert.equal(solve(['+x@d.com', '+y@d.com']), 1)
})

test('3860 frames carry one group count per distinct key', () => {
  const run = buildTrace({ emails: ['a.b@c.d', 'ab@c.d'] })
  assert.equal(run.frames.at(-1).groups.length, 1)
  assert.equal(run.frames.at(-1).groups[0].count, 2)
})

test('3860 rejects malformed addresses', () => {
  assert.throws(() => parseInput('{"emails":["no-at-sign"]}'))
  assert.throws(() => parseInput('{"emails":["a@b@c.com"]}'))
})

// Oracle: a regex-based normalization written independently of the trace code.
function oracle(emails) {
  const keys = new Set(emails.map(email => {
    const [local, domain] = email.toLowerCase().split('@')
    return local.replace(/\+.*$/, '').replace(/\./g, '') + '@' + domain
  }))
  return keys.size
}

test('3860 random addresses match a regex oracle', () => {
  let seed = 3860
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const chars = 'abAB.+'
  const piece = len => Array.from({ length: len }, () => chars[rnd(chars.length)]).join('')
  for (let t = 0; t < 200; t++) {
    const emails = Array.from({ length: 1 + rnd(6) }, () => `${piece(1 + rnd(5))}@${piece(1 + rnd(3)).replace(/\+/g, 'x')}`)
    assert.equal(solve(emails), oracle(emails), JSON.stringify(emails))
  }
})
