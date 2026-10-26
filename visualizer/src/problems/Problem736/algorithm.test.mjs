import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result
// Oracle: build an s-expression tree, then evaluate with environment chaining.
function oracle(src) {
  const toks = src.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/)
  let p = 0
  const read = () => { const t = toks[p++]; if (t !== '(') return t; const list = []; while (toks[p] !== ')') list.push(read()); p++; return list }
  const ev = (node, env) => {
    if (typeof node === 'string') return /^-?\d+$/.test(node) ? Number(node) : env.get(node)
    const [op, ...rest] = node
    if (op === 'add') return ev(rest[0], env) + ev(rest[1], env)
    if (op === 'mult') return ev(rest[0], env) * ev(rest[1], env)
    const local = new Map(env)
    for (let i = 0; i + 1 < rest.length; i += 2) local.set(rest[i], ev(rest[i + 1], local))
    return ev(rest[rest.length - 1], local)
  }
  return ev(read(), new Map())
}
test('official examples', () => {
  assert.equal(solve('(let x 2 (mult x (let x 3 y 4 (add x y))))'), 14)
  assert.equal(solve('(let x 3 x 2 x)'), 2)
  assert.equal(solve('(let x 1 y 2 x (add x y) (add x y))'), 5)
  assert.equal(solve('(let a1 3 b2 (add a1 1) b2)'), 4)
  assert.equal(solve('(let x -2 y x y)'), -2)
})
test('random generated expressions vs environment-chaining oracle', () => {
  let seed = 41
  const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n
  const gen = (vars, d) => {
    const r = rnd(d <= 0 ? 2 : 6)
    if (r === 0 || (r === 1 && !vars.length)) return String(rnd(21) - 10)
    if (r === 1) return vars[rnd(vars.length)]
    if (r === 2 || r === 3) return `(${r === 2 ? 'add' : 'mult'} ${gen(vars, d - 1)} ${gen(vars, d - 1)})`
    let out = '(let', cur = [...vars]
    for (let i = 0, k = 1 + rnd(3); i < k; i++) { const name = 'v' + rnd(4); const e = gen(cur, d - 1); out += ` ${name} ${e}`; cur = [...cur, name] }
    return out + ` ${gen(cur, d - 1)})`
  }
  for (let t = 0; t < 400; t++) {
    const e = gen([], 3); if (e.length > 300) continue
    assert.equal(solve(e), oracle(e), e)
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('"(add 1"'), /Unbalanced/)
  assert.throws(() => parseInput('"(add x 1)"'), /before it is defined/)
  assert.throws(() => parseInput('"(ADD 1 2)"'), /lowercase/)
  assert.throws(() => parseInput('5'), /string/)
})
