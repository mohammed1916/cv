import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3606 official examples', () => {
  assert.deepEqual(solve({
    code: ['SAVE20', '', 'PHARMA5', 'SAVE@20'],
    business_line: ['restaurant', 'grocery', 'pharmacy', 'restaurant'],
    is_active: [true, true, true, true],
  }), ['PHARMA5', 'SAVE20'])
  assert.deepEqual(solve({
    code: ['GROCERY15', 'ELECTRONICS_50', 'DISCOUNT10'],
    business_line: ['grocery', 'electronics', 'invalid'],
    is_active: [false, true, true],
  }), ['ELECTRONICS_50'])
})

test('3606 codes are ordered by business line before code text', () => {
  assert.deepEqual(solve({
    code: ['B2', 'A1', 'C3'],
    business_line: ['grocery', 'electronics', 'electronics'],
    is_active: [true, true, true],
  }), ['A1', 'C3', 'B2'])
})

test('3606 rejects mismatched array lengths', () => {
  assert.throws(() => parseInput('{"code":["A"],"business_line":[],"is_active":[true]}'))
})

// Independent oracle: keep the coupons that pass a regular-expression check, then sort by business line position and code.
function oracle({ code, business_line, is_active }) {
  const order = ['electronics', 'grocery', 'pharmacy', 'restaurant']
  return code
    .map((c, i) => ({ c, rank: order.indexOf(business_line[i]), active: is_active[i], ok: /^[A-Za-z0-9_]+$/.test(c) }))
    .filter(x => x.ok && x.rank >= 0 && x.active)
    .sort((a, b) => a.rank - b.rank || (a.c < b.c ? -1 : a.c > b.c ? 1 : 0))
    .map(x => x.c)
}

test('3606 random coupons match a regular-expression oracle', () => {
  let seed = 3606
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'aZ9_-@'
  const lines = ['electronics', 'grocery', 'pharmacy', 'restaurant', 'other']
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const input = {
      code: Array.from({ length: n }, () => Array.from({ length: rnd(5) }, () => alphabet[rnd(alphabet.length)]).join('')),
      business_line: Array.from({ length: n }, () => lines[rnd(lines.length)]),
      is_active: Array.from({ length: n }, () => rnd(4) !== 0),
    }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
