import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = s => buildTrace(parseInput(s)).result

// Independent oracle: recursive split on the first brace group, then a Cartesian join.
function oracle(s) {
  const i = s.indexOf('{')
  if (i < 0) return [s]
  const j = s.indexOf('}', i)
  const head = s.slice(0, i)
  const options = s.slice(i + 1, j).split(',')
  const tails = oracle(s.slice(j + 1))
  const out = []
  for (const o of options) for (const t of tails) out.push(head + o + t)
  return [...new Set(out)].sort()
}

test('1087 worked examples from the statement', () => {
  assert.deepEqual(solve('{a,b}c{d,e}f'), ['acdf', 'acef', 'bcdf', 'bcef'])
  assert.deepEqual(solve('abcd'), ['abcd'])
})

test('1087 single group and single letter', () => {
  assert.deepEqual(solve('{a,b,c}'), ['a', 'b', 'c'])
  assert.deepEqual(solve('z'), ['z'])
})

test('1087 unsorted alternatives come out sorted', () => {
  assert.deepEqual(solve('{x,w}yz{b,a}'), ['wyza', 'wyzb', 'xyza', 'xyzb'])
})

test('1087 rejects malformed input', () => {
  assert.throws(() => parseInput('{a,b'))
  assert.throws(() => parseInput('a}b'))
  assert.throws(() => parseInput('{a,{b}}'))
  assert.throws(() => parseInput('{}'))
  assert.throws(() => parseInput('A'))
  assert.throws(() => parseInput('{a,b}{c,d}{e,f}{g,h}{i,j}{k,l}{m}'))
})

test('1087 random inputs match the oracle', () => {
  let seed = 1087
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdef'
  for (let t = 0; t < 300; t++) {
    let s = ''
    const parts = 1 + rnd(4)
    for (let p = 0; p < parts; p++) {
      if (rnd(2)) s += letters[rnd(letters.length)]
      else {
        const opts = Array.from({ length: 1 + rnd(3) }, () => letters[rnd(letters.length)])
        s += '{' + opts.join(',') + '}'
      }
    }
    if (s.length > 30) continue
    let expected
    try { expected = oracle(s) } catch { continue }
    let got
    try { got = solve(s) } catch { continue }
    assert.deepEqual(got, expected, s)
  }
})

test('1087 frame invariants hold for every trace', () => {
  for (const s of ['p{q,r}{s,t}z', '{x,w}yz{b,a}', 'kite', '{a,b}c{d,e}f']) {
    const { frames, result } = buildTrace(parseInput(s))
    const pyLines = python.trim().split('\n').length
    for (const f of frames) {
      assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, s)
      assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, s)
      assert.ok(f.message.length > 0)
      assert.ok(Array.isArray(f.results))
    }
    assert.equal(frames.at(-1).phase, 'done')
    assert.deepEqual(frames.at(-1).results, result)
    assert.equal(new Set(result).size, result.length)
  }
})

test('1087 python export is complete', () => {
  assert.match(python, /def brace_expansion\(s\):/)
  assert.match(python, /return sorted\(results\)/)
})
