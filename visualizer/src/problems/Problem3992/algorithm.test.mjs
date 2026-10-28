import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, x, y) => buildTrace({ s, x, y }).result

// The statement accepts any valid arrangement, so examples check validity rather than one string.
function valid(s, x, y, t) {
  const sorted = a => [...a].sort().join('')
  if (sorted(s) !== sorted(t)) return false
  const lastY = t.lastIndexOf(y)
  const firstX = t.indexOf(x)
  return firstX === -1 || lastY === -1 || lastY < firstX
}

test('3992 official examples produce valid arrangements', () => {
  assert.ok(valid('aabc', 'a', 'c', solve('aabc', 'a', 'c')))
  assert.ok(valid('dcab', 'd', 'b', solve('dcab', 'd', 'b')))
  assert.ok(valid('axe', 'o', 'x', solve('axe', 'o', 'x')))
})

test('3992 rejects equal x and y', () => {
  assert.throws(() => parseInput('{"s":"ab","x":"a","y":"a"}'))
})

// Independent oracle: the result must use the same letters and put every y before every x.
test('3992 random strings produce valid arrangements', () => {
  let seed = 3992
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(8) }, () => 'abcd'[rnd(4)]).join('')
    const x = 'abcd'[rnd(4)]
    const y = 'abcd'.replace(x, '')[rnd(3)]
    assert.ok(valid(s, x, y, solve(s, x, y)), `${s} ${x} ${y}`)
  }
})
