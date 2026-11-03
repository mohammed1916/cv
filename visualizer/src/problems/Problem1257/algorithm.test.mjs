import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (regions, region1, region2) => buildTrace({ regions, region1, region2 }).result

test('1257 hand-checked cases', () => {
  const tree = [['Continent', 'Coast', 'Inland'], ['Coast', 'Harbour', 'Dockyard'], ['Inland', 'Valley', 'Plateau', 'Mesa']]
  assert.equal(solve(tree, 'Dockyard', 'Mesa'), 'Continent')
  assert.equal(solve(tree, 'Valley', 'Plateau'), 'Inland')
  assert.equal(solve(tree, 'Harbour', 'Coast'), 'Coast')
  assert.equal(solve(tree, 'Harbour', 'Harbour'), 'Harbour')
  assert.equal(solve([['Atlas', 'Summit', 'Basin'], ['Summit', 'Ridge']], 'Ridge', 'Summit'), 'Summit')
})

test('1257 rejects malformed trees', () => {
  assert.throws(() => parseInput('{"regions":[["A","B"],["C","B"]],"region1":"A","region2":"B"}'))
  assert.throws(() => parseInput('{"regions":[["A","B"],["C","D"]],"region1":"A","region2":"B"}'))
  assert.throws(() => parseInput('{"regions":[["A","B"]],"region1":"A","region2":"Z"}'))
})

function oracle(regions, a, b) {
  const children = new Map()
  const parent = new Map()
  for (const [p, ...kids] of regions) {
    children.set(p, kids)
    for (const k of kids) parent.set(k, p)
  }
  const depth = n => (parent.has(n) ? 1 + depth(parent.get(n)) : 0)
  const subtreeHas = (top, target) => top === target || (children.get(top) ?? []).some(k => subtreeHas(k, target))
  const candidates = []
  for (let n = a; n !== undefined; n = parent.get(n)) candidates.push(n)
  return candidates.filter(c => subtreeHas(c, a) && subtreeHas(c, b)).sort((x, y) => depth(y) - depth(x))[0]
}

test('1257 random trees match a subtree oracle', () => {
  let seed = 1257
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 2 + rnd(11)
    const names = Array.from({ length: size }, (_, i) => `R${i}`)
    const groups = new Map()
    for (let k = 1; k < size; k++) {
      const p = names[rnd(k)]
      groups.set(p, [...(groups.get(p) ?? []), names[k]])
    }
    const regions = [...groups].map(([p, kids]) => [p, ...kids])
    const a = names[rnd(size)], b = names[rnd(size)]
    assert.equal(solve(regions, a, b), oracle(regions, a, b), JSON.stringify({ regions, a, b }))
  }
})

test('1257 frame invariants', () => {
  const regions = [['Continent', 'Coast', 'Inland'], ['Coast', 'Harbour', 'Dockyard'], ['Inland', 'Valley', 'Plateau', 'Mesa']]
  const run = buildTrace({ regions, region1: 'Dockyard', region2: 'Mesa' })
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.marked.every(n => typeof n === 'string'))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).answer, run.result)
})
