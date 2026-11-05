import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(s1, s2) {
  let best = null
  for (let i = 0; i < s1.length; i++) for (let j = i; j < s1.length; j++) {
    let k = 0
    for (let x = i; x <= j && k < s2.length; x++) if (s1[x] === s2[k]) k++
    if (k === s2.length && (best === null || j - i + 1 < best.length)) best = s1.slice(i, j + 1)
  }
  return best ?? ''
}

test('727 worked examples', () => {
  assert.equal(buildTrace({ s1: 'xaybzcx', s2: 'abc' }).result, 'aybzc')
  assert.equal(buildTrace({ s1: 'cbaxbca', s2: 'ba' }).result, 'ba')
  assert.equal(buildTrace({ s1: 'qwerty', s2: 'yq' }).result, '')
})

test('727 small strings match an exhaustive window search with the leftmost tie', () => {
  let state = 727
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const word = n => Array.from({ length: n }, () => 'abc'[rand(3)]).join('')
  for (let t = 0; t < 1500; t++) {
    const s1 = word(1 + rand(9)), s2 = word(1 + rand(3))
    assert.equal(buildTrace({ s1, s2 }).result, brute(s1, s2), `${s1} ${s2}`)
  }
})

test('727 rejects uppercase input', () => {
  assert.throws(() => parseInput('{"s1":"AB","s2":"a"}'))
})
