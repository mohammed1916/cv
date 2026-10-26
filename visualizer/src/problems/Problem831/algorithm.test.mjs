import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
const solve = s => buildTrace(parseInput(JSON.stringify(s))).result
function oracle(s) {
  const m = s.match(/^([A-Za-z])[A-Za-z]*([A-Za-z])@(.+)$/)
  if (m) return `${m[1]}*****${m[2]}@${m[3]}`.toLowerCase()
  const d = s.replace(/\D/g, '')
  const tail = `***-***-${d.slice(d.length - 4)}`
  return ['', '+*-', '+**-', '+***-'][d.length - 10] + tail
}
test('official examples', () => {
  assert.equal(solve('LeetCode@LeetCode.com'), 'l*****e@leetcode.com')
  assert.equal(solve('AB@qq.com'), 'a*****b@qq.com')
  assert.equal(solve('1(234)567-890'), '***-***-7890')
  assert.equal(solve('86-(10)12345678'), '+**-***-***-5678')
})
test('random emails and phones match an independent regex formulation', () => {
  let seed = 17; const rnd = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  const letters = 'abcdefXYZ'
  for (let t = 0; t < 300; t++) {
    const w = k => Array.from({ length: 2 + rnd(k) }, () => letters[rnd(letters.length)]).join('')
    const email = `${w(8)}@${w(8)}.${w(8)}`
    assert.equal(solve(email), oracle(email))
    const digits = Array.from({ length: 10 + rnd(4) }, () => rnd(10)).join('')
    const sep = ['', '-', ' ', '()'][rnd(4)]
    const phone = (rnd(2) ? '+' : '') + digits.slice(0, 3) + sep + digits.slice(3)
    assert.equal(solve(phone), oracle(phone))
  }
})
test('invalid input rejected', () => {
  for (const bad of ['null', '"abc"', '"a@b"', '"12345"', '"123456789012345"', '"hello world!"']) assert.throws(() => parseInput(bad))
})
