import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(s, goal) {
  if (s.length !== goal.length) return false
  for (let i = 0; i < s.length; i++) for (let j = 0; j < s.length; j++) {
    if (i === j) continue
    const a = s.split(''); [a[i], a[j]] = [a[j], a[i]]
    if (a.join('') === goal) return true
  }
  return false
}

test('859 worked examples', () => {
  assert.equal(buildTrace({ s: 'ab', goal: 'ba' }).result, true)
  assert.equal(buildTrace({ s: 'ab', goal: 'ab' }).result, false)
  assert.equal(buildTrace({ s: 'aa', goal: 'aa' }).result, true)
})

test('859 random short words match an exhaustive single swap', () => {
  let state = 859
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const word = n => Array.from({ length: n }, () => 'abc'[rand(3)]).join('')
  for (let t = 0; t < 1500; t++) {
    const s = word(1 + rand(4)), goal = rand(3) === 0 ? word(s.length) : [...s].sort(() => rand(2) - 0.5).join('')
    assert.equal(buildTrace({ s, goal }).result, brute(s, goal), JSON.stringify({ s, goal }))
  }
})

test('859 rejects non-letter input', () => {
  assert.throws(() => parseInput('{"s":"A","goal":"a"}'))
})
