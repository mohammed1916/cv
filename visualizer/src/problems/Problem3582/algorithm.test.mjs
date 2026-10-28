import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = caption => buildTrace(parseInput(JSON.stringify({ caption }))).result

test('3582 words join with a hashtag and camel case', () => {
  assert.equal(solve('Keep Going'), '#keepGoing')
  assert.equal(solve('  Video CAPTION tags  '), '#videoCaptionTags')
})

test('3582 an empty caption gives just the hashtag', () => {
  assert.equal(solve(''), '#')
  assert.equal(solve('   '), '#')
})

test('3582 the tag is cut to 100 characters', () => {
  const tag = solve('a'.repeat(60) + ' ' + 'b'.repeat(60))
  assert.equal(tag.length, 100)
  assert.equal(tag, '#' + 'a'.repeat(60) + 'B' + 'b'.repeat(38))
})

test('3582 rejects digits and over-long captions', () => {
  assert.throws(() => parseInput('{"caption":"abc1"}'))
  assert.throws(() => parseInput(JSON.stringify({ caption: 'a'.repeat(151) })))
})

// Independent oracle: lowercase everything, capitalize each letter that follows a space, drop the spaces.
function oracle(caption) {
  const body = caption.trim().toLowerCase().replace(/ +([a-z])/g, (_, c) => c.toUpperCase()).replace(/ /g, '')
  return `#${body}`.slice(0, 100)
}

test('3582 random captions match a string-rewrite oracle', () => {
  let seed = 3582
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = rnd(151)
    let caption = ''
    for (let i = 0; i < len; i++) caption += 'abcdeXYZ  '[rnd(10)]
    assert.equal(solve(caption), oracle(caption), caption)
  }
})
