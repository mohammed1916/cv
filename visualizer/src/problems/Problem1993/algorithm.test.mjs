import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('examples follow the lock, unlock and upgrade rules', () => {
  const parent = [-1, 0, 0, 1, 1, 2, 2]
  const ops = [['lock', 2, 2], ['lock', 2, 3], ['unlock', 2, 3], ['upgrade', 0, 1], ['lock', 4, 1], ['upgrade', 1, 2], ['unlock', 2, 2], ['upgrade', 0, 1]]
  assert.deepEqual(solve(JSON.stringify({ parent, operations: ops })), [true, false, false, true, true, false, false, false])
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"parent":[-1,0],"operations":[["lock",1,1]]}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

// Independent oracle: ancestry by walking up, descendants by checking each node's ancestors.
function oracle(parent, ops) {
  const n = parent.length
  const owner = Array(n).fill(null)
  const ancestors = v => { const out = []; for (let p = parent[v]; p !== -1; p = parent[p]) out.push(p); return out }
  return ops.map(([t, v, u]) => {
    if (t === 'lock') { if (owner[v] !== null) return false; owner[v] = u; return true }
    if (t === 'unlock') { if (owner[v] !== u) return false; owner[v] = null; return true }
    if (owner[v] !== null || ancestors(v).some(a => owner[a] !== null)) return false
    const below = [...Array(n).keys()].filter(d => d !== v && ancestors(d).includes(v) && owner[d] !== null)
    if (below.length === 0) return false
    below.forEach(d => { owner[d] = null })
    owner[v] = u
    return true
  })
}

test('random operations match the oracle', () => {
  let state = 113
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rand(8)
    const parent = [-1, ...Array.from({ length: n - 1 }, (_, i) => rand(i + 1))]
    const ops = Array.from({ length: 1 + rand(12) }, () => [['lock', 'unlock', 'upgrade'][rand(3)], rand(n), 1 + rand(3)])
    assert.deepEqual(solve(JSON.stringify({ parent, operations: ops })), oracle(parent, ops), JSON.stringify({ parent, ops }))
  }
})
