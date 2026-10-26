import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (tree, target, k) => buildTrace(parseInput(JSON.stringify({ tree, target, k }))).result.slice().sort((a, b) => a - b)

// Oracle: Floyd-Warshall on the undirected edges parsed from the level-order array.
function oracle(tree, target, k) {
  const vals = tree.filter(x => x !== null); const idx = new Map(vals.map((v, i) => [v, i]))
  const n = vals.length; const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : 1e9)))
  const q = [0]; let c = 1
  for (let h = 0; h < q.length && c < tree.length; h++) {
    for (let s = 0; s < 2 && c < tree.length; s++, c++) if (tree[c] !== null) { const ch = idx.get(tree[c]); d[q[h]][ch] = d[ch][q[h]] = 1; q.push(ch) }
  }
  for (let m = 0; m < n; m++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][m] + d[m][j])
  return vals.filter((_, i) => d[idx.get(target)][i] === k).sort((a, b) => a - b)
}

function randomTree() {
  const size = 1 + Math.floor(Math.random() * 14); const vals = [...Array(size).keys()].sort(() => Math.random() - 0.5)
  let used = 1; const out = [vals[0]]; const queue = [0]
  for (let h = 0; h < queue.length; h++) {
    for (let s = 0; s < 2; s++) {
      if (used < size && Math.random() < 0.6) { out.push(vals[used]); queue.push(used); used++ } else out.push(null)
    }
  }
  while (out.length && out.at(-1) === null) out.pop()
  return { tree: out, extra: used === size }
}

test('official example', () => {
  assert.deepEqual(solve([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 2), [1, 4, 7])
  assert.deepEqual(solve([1], 1, 3), [])
})

test('matches Floyd-Warshall on random trees', () => {
  for (let t = 0; t < 300; t++) {
    const { tree } = randomTree(); const vals = tree.filter(x => x !== null)
    const target = vals[Math.floor(Math.random() * vals.length)]; const k = Math.floor(Math.random() * 6)
    assert.deepEqual(solve(tree, target, k), oracle(tree, target, k), JSON.stringify({ tree, target, k }))
  }
})

test('trace shape', () => {
  const r = buildTrace(parseInput('{"tree":[1,2,3],"target":2,"k":2}'))
  assert.equal(r.frames[0].phase, 'start'); assert.equal(r.frames.at(-1).phase, 'done')
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"tree":[1,2],"target":9,"k":1}'))
  assert.throws(() => parseInput('{"tree":[1,1],"target":1,"k":1}'))
  assert.throws(() => parseInput('{"tree":[1,null,null,5],"target":1,"k":1}'))
  assert.throws(() => parseInput('{"tree":[null],"target":1,"k":1}'))
  assert.throws(() => parseInput('{"tree":[1],"target":1,"k":-1}'))
})
