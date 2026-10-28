import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2722 official example', () => {
  const text = '{"arr1":[{"id":1,"x":2,"y":3},{"id":2,"x":3,"y":6}],"arr2":[{"id":2,"x":10,"y":4},{"id":3,"x":2,"y":9}]}'
  assert.deepEqual(solve(text), [{ id: 1, x: 2, y: 3 }, { id: 2, x: 10, y: 4 }, { id: 3, x: 2, y: 9 }])
})

test('2722 arr2 values overwrite arr1 values for the same id', () => {
  assert.deepEqual(solve('{"arr1":[{"id":5,"x":1}],"arr2":[{"id":5,"x":7}]}'), [{ id: 5, x: 7 }])
})

test('2722 rejects a duplicate id within one array', () => {
  assert.throws(() => parseInput('{"arr1":[{"id":1,"x":1},{"id":1,"x":2}],"arr2":[{"id":2,"x":1}]}'), /appears once/)
})

// Independent oracle: for each distinct id, assign from arr1 then from arr2 with Object.assign.
function oracle(arr1, arr2) {
  const ids = [...new Set([...arr1, ...arr2].map(o => o.id))].sort((a, b) => a - b)
  return ids.map(id => {
    const out = {}
    for (const o of arr1.filter(o => o.id === id)) Object.assign(out, o)
    for (const o of arr2.filter(o => o.id === id)) Object.assign(out, o)
    return out
  })
}

test('2722 random arrays match an assign-by-filter oracle', () => {
  let seed = 2722
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const make = keys => {
    const pool = Array.from({ length: 8 }, (_, i) => i + 1)
    const out = []
    for (let i = 0, count = 1 + rnd(6); i < count; i++) {
      const obj = { id: pool.splice(rnd(pool.length), 1)[0] }
      for (const k of keys) obj[k] = rnd(10)
      out.push(obj)
    }
    return out
  }
  for (let round = 0; round < 300; round++) {
    const arr1 = make(['x', 'y']), arr2 = make(['x', 'z'])
    assert.deepEqual(solve(JSON.stringify({ arr1, arr2 })), oracle(arr1, arr2), JSON.stringify({ arr1, arr2 }))
  }
})
