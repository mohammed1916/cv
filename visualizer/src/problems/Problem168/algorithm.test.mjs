import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const title = n => buildTrace(n).result

// Independent check: read the letters back as bijective base-26 digits and recover the number.
function fromTitle(s) {
  let n = 0
  for (const ch of s) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n
}

test('168 small columns map to the expected letters', () => {
  assert.equal(title(1), 'A')
  assert.equal(title(26), 'Z')
  assert.equal(title(27), 'AA')
  assert.equal(title(52), 'AZ')
  assert.equal(title(701), 'ZY')
})

test('168 every column from 1 to 3000 round-trips through the letters', () => {
  for (let n = 1; n <= 3000; n++) {
    const s = title(n)
    assert.match(s, /^[A-Z]+$/)
    assert.equal(fromTitle(s), n, `column ${n} gave ${s}`)
  }
})

test('168 the largest accepted column still produces a title', () => {
  const s = title(2147483647)
  assert.match(s, /^[A-Z]+$/)
  assert.equal(fromTitle(s), 2147483647)
})

test('168 rejects values outside 1 to 2147483647', () => {
  assert.throws(() => parseInput('0'), /whole number/)
  assert.throws(() => parseInput('2147483648'), /whole number/)
  assert.throws(() => parseInput('abc'), /whole number/)
  assert.equal(parseInput(' 28 '), 28)
})

test('168 every frame has a message and lines inside the solver', () => {
  const run = buildTrace(701)
  for (const frame of run.frames) {
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 8)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 7)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
