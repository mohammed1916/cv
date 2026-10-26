import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('726 official examples', () => {
  assert.equal(buildTrace('H2O').result, 'H2O')
  assert.equal(buildTrace('Mg(OH)2').result, 'H2MgO2')
  assert.equal(buildTrace('K4(ON(SO3)2)2').result, 'K4N2O14S4')
})

// Oracle: expand groups textually with a regex until none remain, then count atoms with another regex.
test('726 random formulas match textual group expansion', () => {
  let state = 251
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const atoms = ['H', 'O', 'Na', 'Cl']
  const gen = depth => {
    let s = ''
    for (let i = 0; i < 1 + rand(3); i++) {
      if (depth < 2 && rand(3) === 0) s += `(${gen(depth + 1)})${1 + rand(3)}`
      else s += atoms[rand(atoms.length)] + (rand(2) ? String(1 + rand(4)) : '')
    }
    return s
  }
  for (let t = 0; t < 200; t++) {
    const formula = gen(0)
    let expanded = formula
    const group = /\(([^()]*)\)(\d+)/
    while (group.test(expanded)) expanded = expanded.replace(group, (_, inner, n) => inner.repeat(Number(n)))
    const counts = {}
    for (const [, atom, n] of expanded.matchAll(/([A-Z][a-z]*)(\d*)/g)) counts[atom] = (counts[atom] ?? 0) + (n ? Number(n) : 1)
    const expected = Object.keys(counts).sort().map(a => (counts[a] === 1 ? a : a + counts[a])).join('')
    assert.equal(buildTrace(formula).result, expected, formula)
  }
})

test('726 rejects a formula starting with a lowercase letter', () => {
  assert.throws(() => parseInput('"h2o"'))
})
