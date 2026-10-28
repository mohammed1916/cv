import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (num, k) => buildTrace({ num, k }).result

test('1850 official examples', () => {
  assert.equal(solve('5489355142', 4), 2)
  assert.equal(solve('11112', 4), 4)
  assert.equal(solve('00123', 1), 1)
})

test('1850 a single step to the next arrangement needs one swap', () => {
  assert.equal(solve('12', 1), 1)
})

test('1850 rejects k beyond the largest arrangement', () => {
  assert.throws(() => parseInput(JSON.stringify({ num: '21', k: 1 })))
})

// Independent oracle: list every distinct arrangement, pick the kth one above num, and find the
// fewest adjacent swaps with a breadth-first search over strings.
function distinctPermutations(s) {
  const out = new Set()
  const rec = (pre, rest) => {
    if (rest.length === 0) { out.add(pre); return }
    for (let i = 0; i < rest.length; i++) rec(pre + rest[i], rest.slice(0, i) + rest.slice(i + 1))
  }
  rec('', s)
  return [...out].sort()
}

function fewestSwaps(from, to) {
  let frontier = [from]
  const seen = new Set([from])
  let steps = 0
  while (!frontier.includes(to)) {
    const next = []
    for (const s of frontier) {
      for (let i = 0; i + 1 < s.length; i++) {
        const t = s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2)
        if (!seen.has(t)) { seen.add(t); next.push(t) }
      }
    }
    frontier = next
    steps++
  }
  return steps
}

test('1850 random inputs match a list-and-breadth-first oracle', () => {
  let seed = 1850
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(5)
    let num = ''
    for (let i = 0; i < len; i++) num += String(rnd(10))
    const greater = distinctPermutations(num).filter(p => p > num)
    if (greater.length === 0) continue
    const k = 1 + rnd(Math.min(greater.length, 12))
    assert.equal(solve(num, k), fewestSwaps(num, greater[k - 1]), `${num} ${k}`)
  }
})
