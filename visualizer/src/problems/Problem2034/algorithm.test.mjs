import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('examples follow the corrected-price rules', () => {
  const ops = [['update', [1, 10]], ['update', [2, 5]], ['current'], ['maximum'], ['update', [1, 3]], ['maximum'], ['update', [4, 2]], ['minimum'], ['current']]
  assert.deepEqual(solve(JSON.stringify(ops)), [5, 10, 5, 2, 2])
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[["update",[1,2]],["current"]]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('class '))
})

test('random operation streams match a recomputed oracle', () => {
  let state = 467
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 120; t++) {
    const ops = [['update', [1 + rand(6), 1 + rand(20)]]]
    const map = new Map([[ops[0][1][0], ops[0][1][1]]])
    const expected = []
    for (let i = 0; i < 1 + rand(12); i++) {
      if (rand(2) === 0) {
        const ts = 1 + rand(6), price = 1 + rand(20)
        ops.push(['update', [ts, price]]); map.set(ts, price)
      } else {
        const kind = ['current', 'maximum', 'minimum'][rand(3)]
        ops.push([kind])
        const latest = Math.max(...map.keys())
        const values = [...map.values()]
        expected.push(kind === 'current' ? map.get(latest) : kind === 'maximum' ? Math.max(...values) : Math.min(...values))
      }
    }
    assert.deepEqual(solve(JSON.stringify(ops)), expected, JSON.stringify(ops))
  }
})
