import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (first, second) => buildTrace({ first, second }).result

test('1071 sample pairs', () => {
  assert.equal(solve('ABCABC', 'ABC'), 'ABC')
  assert.equal(solve('ABABAB', 'ABAB'), 'AB')
  assert.equal(solve('LEET', 'CODE'), '')
})

test('1071 equal strings and single letters', () => {
  assert.equal(solve('AAA', 'AAA'), 'AAA')
  assert.equal(solve('A', 'AA'), 'A')
  assert.equal(solve('A', 'B'), '')
})

test('1071 rejects invalid text', () => {
  assert.throws(() => parseInput('{"first":"ab","second":"A"}'), /uppercase/)
  assert.throws(() => parseInput('{"first":"","second":"A"}'), /uppercase/)
  assert.throws(() => parseInput('["AB","A"]'), /Use an object/)
})

test('1071 frames point at real code and Python lines', () => {
  const { frames } = buildTrace({ first: 'ABABAB', second: 'AB' })
  const pyCount = python.split('\n').length
  for (const frame of frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount, frame.message)
  }
})

// Independent oracle: try every prefix length, keep the longest prefix that repeats to both strings.
function oracle(first, second) {
  let best = ''
  for (let k = 1; k <= first.length; k++) {
    const base = first.slice(0, k)
    if (first.length % k || second.length % k) continue
    if (base.repeat(first.length / k) === first && base.repeat(second.length / k) === second) best = base
  }
  return best
}

test('1071 random pairs match a brute-force oracle', () => {
  let seed = 1071
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'AB'
  for (let t = 0; t < 300; t++) {
    const base = Array.from({ length: 1 + rnd(4) }, () => letters[rnd(2)]).join('')
    const first = base.repeat(1 + rnd(4))
    const second = base.repeat(1 + rnd(4))
    const noisy = rnd(3) === 0 ? second.slice(1) + 'B' : second
    assert.equal(solve(first, noisy), oracle(first, noisy), `${first} ${noisy}`)
  }
})
