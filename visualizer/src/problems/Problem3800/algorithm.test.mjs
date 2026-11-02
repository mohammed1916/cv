import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (s, t, flipCost, swapCost, crossCost) => buildTrace({ s, t, flipCost, swapCost, crossCost }).result

test('3800 official examples', () => {
  assert.equal(solve('01000', '10111', 10, 2, 2), 16)
  assert.equal(solve('001', '110', 2, 100, 100), 6)
  assert.equal(solve('1010', '1010', 5, 5, 5), 0)
})

test('3800 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"01","t":"1","flipCost":1,"swapCost":1,"crossCost":1}'))
  assert.throws(() => parseInput('{"s":"012","t":"110","flipCost":1,"swapCost":1,"crossCost":1}'))
  assert.throws(() => parseInput('{"s":"01","t":"10","flipCost":0,"swapCost":1,"crossCost":1}'))
})

test('3800 trace frames carry the python line they execute', () => {
  const lines = python.split('\n')
  const { frames } = buildTrace({ s: '01000', t: '10111', flipCost: 10, swapCost: 2, crossCost: 2 })
  for (const frame of frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length, JSON.stringify(frame))
    assert.ok(typeof frame.phase === 'string' && typeof frame.message === 'string' && typeof frame.activeLine === 'number')
  }
  assert.ok(frames.some(f => lines[f.pythonLine - 1].includes('return best')))
})

// Independent oracle: Dijkstra over every (s, t) pair of strings, using every allowed operation.
function oracle(s, t, flipCost, swapCost, crossCost) {
  const n = s.length
  const key = (a, b) => `${a}|${b}`
  const dist = new Map([[key(s, t), 0]])
  const done = new Set()
  const bits = str => str.split('')
  const neighbours = (a, b) => {
    const out = []
    const x = bits(a), y = bits(b)
    for (let i = 0; i < n; i++) {
      const fx = [...x]; fx[i] = fx[i] === '0' ? '1' : '0'
      out.push([fx.join(''), b, flipCost])
      const fy = [...y]; fy[i] = fy[i] === '0' ? '1' : '0'
      out.push([a, fy.join(''), flipCost])
      const cx = [...x]; const cy = [...y]
      ;[cx[i], cy[i]] = [cy[i], cx[i]]
      out.push([cx.join(''), cy.join(''), crossCost])
      for (let j = 0; j < n; j++) {
        if (i === j) continue
        const sx = [...x]; ;[sx[i], sx[j]] = [sx[j], sx[i]]
        out.push([sx.join(''), b, swapCost])
        const sy = [...y]; ;[sy[i], sy[j]] = [sy[j], sy[i]]
        out.push([a, sy.join(''), swapCost])
      }
    }
    return out
  }
  for (;;) {
    let bestKey = null
    for (const [k, d] of dist) if (!done.has(k) && (bestKey === null || d < dist.get(bestKey))) bestKey = k
    if (bestKey === null) return null
    const [a, b] = bestKey.split('|')
    const d = dist.get(bestKey)
    if (a === b) return d
    done.add(bestKey)
    for (const [na, nb, w] of neighbours(a, b)) {
      const k = key(na, nb)
      if (!dist.has(k) || dist.get(k) > d + w) dist.set(k, d + w)
    }
  }
}

test('3800 random small inputs match a shortest-path oracle', () => {
  let seed = 3800
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const bitString = len => Array.from({ length: len }, () => String(rnd(2))).join('')
  for (let trial = 0; trial < 150; trial++) {
    const n = 1 + rnd(4)
    const s = bitString(n), t = bitString(n)
    const flipCost = 1 + rnd(10), swapCost = 1 + rnd(10), crossCost = 1 + rnd(10)
    assert.equal(solve(s, t, flipCost, swapCost, crossCost), oracle(s, t, flipCost, swapCost, crossCost), JSON.stringify({ s, t, flipCost, swapCost, crossCost }))
  }
})
