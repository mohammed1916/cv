import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = names => buildTrace({ names }).result

test('1487 sample inputs produce the expected names', () => {
  assert.deepEqual(solve(['a', 'a', 'a']), ['a', 'a(1)', 'a(2)'])
  assert.deepEqual(solve(['b', 'a', 'a', 'a', 'b']), ['b', 'a', 'a(1)', 'a(2)', 'b(1)'])
  assert.deepEqual(solve(['x', 'y', 'z']), ['x', 'y', 'z'])
})

test('1487 frames line up with pseudocode and Python', () => {
  assert.equal(python.split('\n').length, code.length)
  for (const frame of buildTrace({ names: ['a', 'a', 'b', 'a'] }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.equal(frame.pythonLine, frame.activeLine)
  }
})

test('1487 rejects malformed input', () => {
  assert.throws(() => parseInput('["a"]'), /object/)
  assert.throws(() => parseInput('{"names":[]}'), /names/)
  assert.throws(() => parseInput('{"names":["Bad"]}'), /names/)
})

test('1487 random inputs match a naive oracle and stay distinct', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pool = ['a', 'b', 'ab']
  for (let t = 0; t < 300; t++) {
    const names = Array.from({ length: 1 + rnd(10) }, () => pool[rnd(pool.length)])
    const taken = new Set()
    const expected = names.map(n => {
      if (!taken.has(n)) { taken.add(n); return n }
      let k = 1
      while (taken.has(`${n}(${k})`)) k++
      taken.add(`${n}(${k})`)
      return `${n}(${k})`
    })
    assert.deepEqual(solve(names), expected, JSON.stringify(names))
    assert.equal(new Set(expected).size, expected.length)
  }
})
