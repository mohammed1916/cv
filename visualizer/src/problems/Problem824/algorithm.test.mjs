import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
const solve = s => buildTrace(parseInput(JSON.stringify(s))).result
function oracle(s) {
  return s.split(' ').map((w, i) => (/^[aeiou]/i.test(w) ? w : w.replace(/^(.)(.*)$/, '$2$1')) + 'ma' + 'a'.repeat(i + 1)).join(' ')
}
test('official examples', () => {
  assert.equal(solve('I speak Goat Latin'), 'Imaa peaksmaaa oatGmaaaa atinLmaaaaa')
  assert.equal(solve('The quick brown fox jumped over the lazy dog'), 'heTmaa uickqmaaa rownbmaaaa oxfmaaaaa umpedjmaaaaaa overmaaaaaaa hetmaaaaaaaa azylmaaaaaaaaa ogdmaaaaaaaaaa')
})
test('random sentences match a regex-based oracle', () => {
  let seed = 5; const rnd = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  const al = 'aeiouAEIOUbcdxyzBCDXYZ'
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(6) }, () => Array.from({ length: 1 + rnd(5) }, () => al[rnd(al.length)]).join('')).join(' ')
    assert.equal(solve(s), oracle(s))
  }
})
test('invalid input rejected', () => {
  for (const bad of ['null', '""', '"a  b"', '" a"', '"a1"', '5']) assert.throws(() => parseInput(bad))
})
