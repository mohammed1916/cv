import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('629 official examples', () => {
  assert.equal(buildTrace({ n: 3, k: 0 }).result, 1)
  assert.equal(buildTrace({ n: 3, k: 1 }).result, 2)
  assert.equal(buildTrace({ n: 4, k: 2 }).result, 5)
})

function permutations(n) {
  const out = []
  const used = Array(n + 1).fill(false)
  const perm = []
  const rec = () => {
    if (perm.length === n) { out.push([...perm]); return }
    for (let v = 1; v <= n; v++) if (!used[v]) { used[v] = true; perm.push(v); rec(); perm.pop(); used[v] = false }
  }
  rec()
  return out
}

test('629 every n up to 7 matches enumeration of all permutations', () => {
  for (let n = 1; n <= 7; n++) {
    const counts = Array(n * (n - 1) / 2 + 1).fill(0)
    for (const p of permutations(n)) {
      let inv = 0
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (p[i] > p[j]) inv++
      counts[inv]++
    }
    for (let k = 0; k < counts.length; k++) assert.equal(buildTrace({ n, k }).result, counts[k], `n=${n} k=${k}`)
  }
})

test('629 rejects out-of-range values for the visualization', () => {
  assert.throws(() => parseInput('{"n":13,"k":1}'))
  assert.throws(() => parseInput('{"n":3,"k":61}'))
})
