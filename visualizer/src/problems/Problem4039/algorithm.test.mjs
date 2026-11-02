import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python, code, decode } from './algorithm.js'

const MOD = 1000000007n
const solve = nums => buildTrace({ nums }).answer

test('4039 worked examples', () => {
  // 421: width 1, x = 4, y = 2, so 4^2 = 16.
  assert.equal(solve([421]), 16)
  // 1212: width 2, x = 12, y = 1, so 12. 2131: width 1, x = 2, y = 13, so 8192. Total 8204.
  assert.equal(solve([1212, 2131]), 8204)
})

test('4039 decoding splits by width', () => {
  assert.deepEqual(decode(421), { text: '421', width: 1, x: '4', y: '2' })
  assert.deepEqual(decode(1212), { text: '1212', width: 2, x: '12', y: '1' })
})

test('4039 rejects invalid encodings', () => {
  assert.throws(() => parseInput('[100]'))
  assert.throws(() => parseInput('[1001]'))
  assert.throws(() => parseInput('[1000]'))
  assert.throws(() => buildTrace({ nums: Array(9).fill(421) }))
})

test('4039 large exponent stays exact under the modulus', () => {
  // e = 29999999991: width 1, x = 2, y = 999999999. The oracle is BigInt modular exponentiation.
  const expected = modPow(2n, 999999999n, MOD)
  assert.equal(BigInt(solve([29999999991])), expected)
})

function modPow(base, exp, mod) {
  let r = 1n
  let b = base % mod
  let x = exp
  while (x > 0n) {
    if (x & 1n) r = (r * b) % mod
    b = (b * b) % mod
    x >>= 1n
  }
  return r
}

// Independent oracle: decode each value with string slicing and reduce x ** y with BigInt.
function oracle(nums) {
  let total = 0n
  for (const e of nums) {
    const s = String(e)
    const w = Number(s[s.length - 1])
    const body = s.slice(0, -1)
    const x = BigInt(body.slice(0, w))
    const y = BigInt(body.slice(w))
    total = (total + (x ** y) % MOD) % MOD
  }
  return Number(total)
}

test('4039 random valid encodings match a BigInt oracle', () => {
  let seed = 4039
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  let checked = 0
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(4)
    const nums = []
    for (let i = 0; i < count; i++) {
      const width = 1 + rnd(3)
      const x = 1 + rnd(99)
      const y = 1 + rnd(40)
      const xs = String(x).padStart(width, '1')
      const e = Number(xs + String(y) + String(width))
      nums.push(e)
    }
    // Keep only encodings the parser accepts; then the split is the one the oracle sees.
    const valid = nums.filter(e => {
      try { parseInput(JSON.stringify([e])); return true } catch { return false }
    })
    if (valid.length === 0) continue
    checked++
    assert.equal(solve(valid), oracle(valid), JSON.stringify(valid))
  }
  assert.ok(checked > 100)
})

test('4039 frame invariants', () => {
  const codeLines = new Set(code.map(c => c.line))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ nums: [421, 2131] }).frames) {
    assert.ok(codeLines.has(frame.activeLine), `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, `pythonLine ${frame.pythonLine}`)
    assert.equal(typeof frame.message, 'string')
  }
})

test('4039 python export runs on the first example', () => {
  const out = execFileSync('python3', ['-I', '-c', python], { input: '[421]' }).toString().trim()
  assert.equal(out, '16')
})
