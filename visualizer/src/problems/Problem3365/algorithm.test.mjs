import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3365 official examples', () => {
  assert.equal(solve({ s: 'abcd', t: 'cdab', k: 2 }), true)
  assert.equal(solve({ s: 'aabbcc', t: 'bbaacc', k: 3 }), true)
  assert.equal(solve({ s: 'abcd', t: 'acbd', k: 2 }), false)
})

test('3365 the block lengths must match exactly', () => {
  // Blocks of s are "ab" and "ba"; t reads "ba" then "ab", which is a rearrangement.
  assert.equal(solve({ s: 'abba', t: 'baab', k: 2 }), true)
  // Blocks of s are "aa" and "bb", so t cannot be built from "ab" blocks.
  assert.equal(solve({ s: 'aabb', t: 'abab', k: 2 }), false)
})

test('3365 rejects bad fields', () => {
  assert.throws(() => parseInput('{"s":"aBc","t":"abc","k":1}'))
  assert.throws(() => parseInput('{"s":"abc","t":"ab","k":1}'))
  assert.throws(() => parseInput('{"s":"abc","t":"abc","k":2}'))
  assert.throws(() => parseInput('{"s":"ab","t":"ab","k":7}'))
  assert.throws(() => parseInput('{"s":"ab","t":"ab"}'))
})

// Independent oracle: try every order of the blocks of s and see whether one reads as t.
function orders(items) {
  if (items.length <= 1) return [items]
  const out = []
  items.forEach((item, i) => {
    for (const rest of orders([...items.slice(0, i), ...items.slice(i + 1)])) out.push([item, ...rest])
  })
  return out
}

function oracle({ s, t, k }) {
  const size = s.length / k
  const blocks = []
  for (let i = 0; i < s.length; i += size) blocks.push(s.slice(i, i + size))
  return orders(blocks).some(order => order.join('') === t)
}

test('3365 random inputs match a try-every-order oracle', () => {
  let seed = 3365
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const ks = [1, 2, 3, 4, 6]
  let trues = 0
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const divisors = ks.filter(k => n % k === 0 && k <= n)
    const k = divisors[rnd(divisors.length)]
    const size = n / k
    const blocks = Array.from({ length: k }, () => Array.from({ length: size }, () => 'ab'[rnd(2)]).join(''))
    const s = blocks.join('')
    const tt = rnd(2) ? blocks.slice().reverse().join('') : Array.from({ length: n }, () => 'ab'[rnd(2)]).join('')
    const input = { s, t: tt, k }
    const got = solve(input)
    if (got) trues++
    assert.equal(got, oracle(input), JSON.stringify(input))
  }
  assert.ok(trues > 10)
})
