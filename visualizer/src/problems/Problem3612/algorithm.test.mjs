import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3612 worked examples', () => {
  assert.equal(solve('{"s":"a#b%*"}'), 'ba')
  assert.equal(solve('{"s":"z*#"}'), '')
})

test('3612 rejects an uppercase letter', () => {
  assert.throws(() => parseInput('{"s":"aB"}'))
})

// Independent oracle: work out each final position from the lengths alone, walking back through the operations,
// and read the character there. The string is never built step by step.
function oracle({ s }) {
  const lens = [0]
  for (const ch of s) {
    const L = lens[lens.length - 1]
    lens.push(ch === '*' ? Math.max(0, L - 1) : ch === '#' ? 2 * L : ch === '%' ? L : L + 1)
  }
  const charAt = k => {
    let pos = k
    for (let i = s.length - 1; i >= 0; i--) {
      const ch = s[i]
      const before = lens[i]
      if (ch === '*') continue
      if (ch === '#') { if (pos >= before) pos -= before; continue }
      if (ch === '%') { pos = before - 1 - pos; continue }
      if (pos === before) return ch
    }
    throw new Error('unreachable')
  }
  return Array.from({ length: lens[s.length] }, (_, k) => charAt(k)).join('')
}

test('3612 seeded random programs match the walk-back oracle', () => {
  let seed = 3612
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 300; t++) {
    let s = ''
    for (let i = 0; i < 1 + rnd(12); i++) s += 'ab*#%'[rnd(5)]
    const text = JSON.stringify({ s })
    try { parseInput(text) } catch { continue }
    checked += 1
    assert.equal(solve(text), oracle({ s }), s)
  }
  assert.ok(checked > 100)
})
