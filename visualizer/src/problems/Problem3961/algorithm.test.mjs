import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = units => buildTrace({ units }).result

// Oracle: try every legal sequence of transfers, including moving a unit that was just received.
function bruteForce(units) {
  const seen = new Set()
  let best = 0
  const rate = device => (device.length ? Math.min(...device) : 0)
  const visit = (devices, used) => {
    const key = `${used}|${devices.map(d => [...d].sort((a, b) => a - b).join(',')).join(';')}`
    if (seen.has(key)) return
    seen.add(key)
    best = Math.max(best, devices.reduce((s, d) => s + rate(d), 0))
    devices.forEach((device, i) => {
      if (used & (1 << i)) return
      for (const value of new Set(device)) {
        devices.forEach((_, j) => {
          if (j === i) return
          const next = devices.map(d => [...d])
          next[i].splice(next[i].indexOf(value), 1)
          next[j].push(value)
          visit(next, used | (1 << i))
        })
      }
    })
  }
  visit(units.map(d => [...d]), 0)
  return best
}

test('3961 hand-computed cases', () => {
  assert.equal(solve([[9, 4, 7], [8, 2, 6], [5, 10, 5]]), 15) // 7 + 6 + 2
  assert.equal(solve([[3, 9, 4], [7, 8, 8]]), 11) // 3 + 8
  assert.equal(solve([[3], [8], [5]]), 16)
  assert.equal(solve([[6, 2, 9]]), 2)
  assert.equal(solve([[4, 4], [4, 4]]), 8)
})

test('3961 exhaustive small grids match the transfer-by-transfer oracle', () => {
  for (const [m, n] of [[2, 2], [2, 3], [3, 2], [3, 1]]) {
    const cells = m * n
    const total = 3 ** cells
    for (let c = 0; c < total; c++) {
      let code = c
      const units = Array.from({ length: m }, () => Array.from({ length: n }, () => { const v = code % 3; code = (code - v) / 3; return v * 2 + 1 }))
      assert.equal(solve(units), bruteForce(units), JSON.stringify(units))
    }
  }
})

test('3961 random grids match the oracle', () => {
  let seed = 3961
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const m = 1 + rnd(4), n = 1 + rnd(3)
    const units = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(9)))
    assert.equal(solve(units), bruteForce(units), JSON.stringify(units))
  }
})

test('3961 the transfers drawn in the frames really produce the answer', () => {
  let seed = 77
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const m = 1 + rnd(6), n = 2 + rnd(4)
    const units = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(20)))
    const { frames, result } = buildTrace({ units })
    const last = frames.at(-1)
    const held = last.rows.map((row, i) => (last.sent[i] ? row.slice(1) : [...row]))
    last.rows.forEach((row, i) => { if (last.sent[i]) held[last.sink].push(row[0]) })
    assert.equal(last.sent[last.sink], false)
    assert.equal(held.reduce((s, d) => s + Math.min(...d), 0), result)
    assert.deepEqual(held.map(d => Math.min(...d)), last.ratings)
    assert.equal(last.check.secondSum - (last.check.smallestSecond - last.check.lowest), result)
  }
})

test('3961 parseInput enforces a rectangular grid in range', () => {
  assert.deepEqual(parseInput('{"units":[[1,2],[3,4]]}').units, [[1, 2], [3, 4]])
  assert.throws(() => parseInput('{"units":[[1,2],[3]]}'))
  assert.throws(() => parseInput('{"units":[[0]]}'))
  assert.throws(() => parseInput('{"units":[]}'))
  assert.throws(() => parseInput('{"units":[[100001]]}'))
})

test('3961 the input is not mutated and frames use real lines', () => {
  const units = [[9, 4, 7], [8, 2, 6]]
  const { frames } = buildTrace({ units })
  assert.deepEqual(units, [[9, 4, 7], [8, 2, 6]])
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const f of [...frames, ...buildTrace({ units: [[5], [1]] }).frames]) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pyLines[f.pythonLine - 1].trim().length > 0)
    assert.ok(f.message.length > 0)
  }
  assert.deepEqual(frames.filter(f => f.phase === 'send').map(f => f.total), [frames.find(f => f.phase === 'send').total])
  assert.ok(pyLines[frames.find(f => f.phase === 'send').pythonLine - 1].includes('total += row[1]'))
})

test('3961 one unit per device moves nothing', () => {
  const { frames, result } = buildTrace({ units: [[5], [1]] })
  assert.equal(result, 6)
  assert.equal(frames.filter(f => f.phase === 'send').length, 0)
  assert.equal(frames.at(-1).sink, null)
})
