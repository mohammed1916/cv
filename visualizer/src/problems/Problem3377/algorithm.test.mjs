import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, m) => buildTrace(parseInput(JSON.stringify({ n, m }))).result

test('3377 examples', () => {
  // 10 -> 20 -> 21 -> 22 -> 12: the costs add up to 10 + 20 + 21 + 22 + 12 = 85.
  assert.equal(solve(10, 12), 85)
  assert.equal(solve(4, 8), -1)
})

test('3377 equal numbers cost only their own value', () => {
  assert.equal(solve(15, 15), 15)
})

test('3377 a prime endpoint is impossible, and mismatched digit counts are rejected', () => {
  assert.equal(solve(7, 9), -1)
  assert.throws(() => parseInput('{"n":10,"m":100}'))
})

// Independent oracle: Bellman-Ford over every padded number with the same digit count, using string digits.
function oracle(n, m) {
  const isPrime = x => { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true }
  if (isPrime(n) || isPrime(m)) return -1
  const width = String(n).length
  const dist = new Map([[n, n]])
  let changed = true
  while (changed) {
    changed = false
    for (const [v, d] of [...dist]) {
      const digits = String(v).padStart(width, '0')
      for (let i = 0; i < width; i++) {
        const options = []
        const digit = Number(digits[i])
        if (digit < 9) options.push(digits.slice(0, i) + (digit + 1) + digits.slice(i + 1))
        if (digit > 0) options.push(digits.slice(0, i) + (digit - 1) + digits.slice(i + 1))
        for (const text of options) {
          const w = Number(text)
          if (isPrime(w)) continue
          if (!dist.has(w) || d + w < dist.get(w)) { dist.set(w, d + w); changed = true }
        }
      }
    }
  }
  return dist.has(m) ? dist.get(m) : -1
}

test('3377 random pairs with equal digit counts match a string-digit oracle', () => {
  let seed = 3377
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 150; t++) {
    const width = 1 + rnd(3)
    const low = width === 1 ? 1 : 10 ** (width - 1)
    const span = 9 * 10 ** (width - 1)
    const n = low + rnd(span), m = low + rnd(span)
    assert.equal(solve(n, m), oracle(n, m), JSON.stringify({ n, m }))
  }
})
