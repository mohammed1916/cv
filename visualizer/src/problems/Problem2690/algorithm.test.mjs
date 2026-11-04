import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, createInfiniteObject, plainObjectOutcome, code, python, phases, examples } from './algorithm.js'

test('2690 every call returns its own name', () => {
  const names = ['greetUser', 'sum-of-2 odds!', '', ' ', 'toString', 'constructor', '__proto__', 'then', 'hasOwnProperty', 'x'.repeat(1000), 'naïve→名前']
  const obj = createInfiniteObject()
  for (const name of names) assert.equal(obj[name](), name)
  assert.equal(obj.anyDotAccess(), 'anyDotAccess')
})

test('2690 symbols do not crash the closure', () => {
  assert.equal(createInfiniteObject()[Symbol('tag')](), 'Symbol(tag)')
})

test('2690 the target stays empty and each read gets a fresh closure', () => {
  const obj = createInfiniteObject()
  obj.a()
  assert.deepEqual(Object.keys(obj), [])
  assert.notEqual(obj.a, obj.a)
})

test('2690 result is the input list, by oracle', () => {
  for (const { input } of examples) {
    const parsed = parseInput(input)
    assert.deepEqual(buildTrace(parsed).result, parsed.methods)
  }
  const alphabet = 'ab_-.|^2 '
  let seed = 11
  const next = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  for (let round = 0; round < 200; round++) {
    const methods = Array.from({ length: 1 + next(8) }, () => Array.from({ length: next(6) }, () => alphabet[next(alphabet.length)]).join(''))
    assert.deepEqual(buildTrace({ methods }).result, methods)
  }
})

test('2690 the plain-object contrast is accurate', () => {
  assert.match(plainObjectOutcome('abc'), /TypeError/)
  assert.match(plainObjectOutcome('toString'), /\[object Object\]/)
  assert.match(plainObjectOutcome('__proto__'), /TypeError/)
})

test('2690 parseInput rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"methods":[]}'))
  assert.throws(() => parseInput('{"methods":[1]}'))
  assert.throws(() => parseInput(JSON.stringify({ methods: ['y'.repeat(1001)] })))
  assert.throws(() => parseInput(JSON.stringify({ methods: Array(9).fill('a') })))
})

test('2690 frames are complete and in stage order', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const pyCount = python.trim().split('\n').length
  for (const { input } of examples) {
    const parsed = parseInput(input)
    const { frames } = buildTrace(parsed)
    assert.equal(frames.length, 2 + 5 * parsed.methods.length)
    for (const frame of frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
      assert.ok(frame.message.length > 0)
      assert.equal(frame.targetKeys, 0)
    }
    assert.equal(frames.at(-1).trapReads, parsed.methods.length)
    assert.deepEqual(frames.slice(1, 6).map(f => f.phase), ['read', 'trap', 'closure', 'call', 'returned'])
  }
})
