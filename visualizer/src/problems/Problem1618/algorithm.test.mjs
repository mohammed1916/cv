import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (text, sizes, w, h) => buildTrace({ text, sizes, w, h }).result

// Independent oracle: measure every size with a linear scan and keep the largest that fits.
function oracle(text, sizes, w, h) {
  const NARROW = new Set('ilj ftr')
  let best = -1
  for (const size of sizes) {
    const total = [...text].reduce((sum, ch) => sum + Math.ceil((size * (NARROW.has(ch) ? 2 : 3)) / 4), 0)
    if (total <= w && size <= h) best = size
  }
  return best
}

test('1618 the authored presets', () => {
  assert.equal(solve('screen fit', [6, 8, 10, 12, 14, 18, 24], 60, 40), 8)
  assert.equal(solve('tall', [4, 8, 12, 16, 20], 200, 10), 8)
  assert.equal(solve('mmmm', [10, 20, 30], 5, 40), -1)
})

test('1618 width and height limits act separately', () => {
  assert.equal(solve('a', [5, 10, 15], 100, 9), 5)
  assert.equal(solve('iiii', [4, 8, 16], 8, 100), 4)
})

test('1618 rejects malformed input', () => {
  assert.throws(() => parseInput('{"text":"Hi","sizes":[6],"w":5,"h":5}'))
  assert.throws(() => parseInput('{"text":"ok","sizes":[8,6],"w":5,"h":5}'))
  assert.throws(() => parseInput('{"text":"ok","sizes":[6],"w":0,"h":5}'))
})

test('1618 random cases match the linear-scan oracle', () => {
  let seed = 1618
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const text = Array.from({ length: 1 + rnd(12) }, () => (rnd(5) === 0 ? ' ' : 'abcdilmt'[rnd(8)])).join('')
    const count = 1 + rnd(8)
    const sizes = []
    let s = 1 + rnd(4)
    for (let i = 0; i < count && s <= 40; i++) { sizes.push(s); s += 1 + rnd(6) }
    const w = 1 + rnd(120)
    const h = 1 + rnd(40)
    assert.equal(solve(text, sizes, w, h), oracle(text, sizes, w, h), JSON.stringify({ text, sizes, w, h }))
  }
})

test('1618 frame invariants: a probe always sits inside the range and the answer only grows', () => {
  const r = buildTrace({ text: 'screen fit', sizes: [6, 8, 10, 12, 14, 18, 24], w: 60, h: 40 })
  let best = -1
  for (const f of r.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= 8)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1)
    if (f.phase === 'mid' || f.phase === 'measure') assert.ok(f.mid >= f.lo && f.mid <= f.hi)
    assert.ok(f.ans >= best)
    best = f.ans
  }
})
