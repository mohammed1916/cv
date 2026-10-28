import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2284 official examples', () => {
  assert.equal(solve({
    messages: ['Hello userTwooo', 'Hi userThree', 'Wonderful day Alice', 'Nice day userThree'],
    senders: ['Alice', 'userTwo', 'userThree', 'Alice'],
  }), 'Alice')
  assert.equal(solve({
    messages: ['How is leetcode for everyone', 'Leetcode is useful for practice'],
    senders: ['Bob', 'Charlie'],
  }), 'Charlie')
})

test('2284 a tie goes to the name that sorts last', () => {
  assert.equal(solve({ messages: ['A B', 'C D'], senders: ['bob', 'alice'] }), 'bob')
  assert.equal(solve({ messages: ['A B', 'C D'], senders: ['Zed', 'Amy'] }), 'Zed')
})

test('2284 rejects bad messages and mismatched lengths', () => {
  assert.throws(() => parseInput('{"messages":["a  b"],"senders":["x"]}'))
  assert.throws(() => parseInput('{"messages":[" a"],"senders":["x"]}'))
  assert.throws(() => parseInput('{"messages":["a"],"senders":["x","y"]}'))
  assert.throws(() => parseInput('{"messages":["a"],"senders":["x1"]}'))
  assert.throws(() => parseInput('["a"]'))
})

// Independent oracle: list every sender with its count, sort by count then name, take the top.
function oracle({ messages, senders }) {
  const rows = new Map()
  messages.forEach((m, i) => rows.set(senders[i], (rows.get(senders[i]) ?? 0) + m.split(' ').length))
  const sorted = [...rows].sort((a, b) => (b[1] - a[1]) || (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
  return sorted[0][0]
}

test('2284 random inputs match a sort-based oracle', () => {
  let seed = 2284
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const names = ['Ann', 'bob', 'Cy', 'dee']
  const letters = 'abcAB'
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6)
    const messages = Array.from({ length: m }, () => Array.from({ length: 1 + rnd(4) }, () => Array.from({ length: 1 + rnd(4) }, () => letters[rnd(letters.length)]).join('')).join(' '))
    const senders = Array.from({ length: m }, () => names[rnd(names.length)])
    const input = { messages, senders }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
