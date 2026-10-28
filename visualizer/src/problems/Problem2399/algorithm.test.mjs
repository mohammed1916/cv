import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result
const blank = () => Array(26).fill(0)

test('2399 official examples', () => {
  const first = blank(); first[0] = 1; first[1] = 3
  assert.equal(solve(JSON.stringify({ s: 'abaccb', distance: first })), true)
  const second = blank(); second[0] = 1
  assert.equal(solve(JSON.stringify({ s: 'aa', distance: second })), false)
})

test('2399 a letter that does not appear is ignored', () => {
  const d = blank(); d[0] = 0; d[25] = 49
  assert.equal(solve(JSON.stringify({ s: 'aa', distance: d })), true)
})

test('2399 rejects a letter that appears three times', () => {
  assert.throws(() => parseInput(JSON.stringify({ s: 'aaa', distance: blank() })), /exactly twice/)
})

// Independent oracle: for each letter, locate both copies with indexOf and lastIndexOf.
function oracle(s, distance) {
  for (const letter of new Set(s)) {
    const first = s.indexOf(letter), last = s.lastIndexOf(letter)
    if (last - first - 1 !== distance[letter.charCodeAt(0) - 97]) return false
  }
  return true
}

test('2399 random strings match a locate-both-copies oracle', () => {
  let seed = 2399
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 300; round++) {
    const letters = []
    const pool = 'abcdef'.split('')
    for (let i = 0, count = 1 + rnd(4); i < count; i++) letters.push(pool.splice(rnd(pool.length), 1)[0])
    const slots = letters.flatMap(l => [l, l])
    for (let i = slots.length - 1; i > 0; i--) { const j = rnd(i + 1); [slots[i], slots[j]] = [slots[j], slots[i]] }
    const s = slots.join('')
    const distance = Array.from({ length: 26 }, () => rnd(4))
    for (const l of letters) distance[l.charCodeAt(0) - 97] = s.lastIndexOf(l) - s.indexOf(l) - 1
    if (rnd(2) === 0) distance[letters[0].charCodeAt(0) - 97] += 1
    assert.equal(solve(JSON.stringify({ s, distance })), oracle(s, distance), JSON.stringify({ s, distance }))
  }
})
