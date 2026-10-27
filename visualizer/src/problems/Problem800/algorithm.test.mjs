import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('800 official example', () => {
  assert.equal(buildTrace('#09f166').result, '#11ee66')
})

test('800 a shorthand color is unchanged', () => {
  assert.equal(buildTrace('#112233').result, '#112233')
})

test('800 rejects uppercase hex', () => {
  assert.throws(() => parseInput('"#09F166"'))
})

// Independent oracle: try all 16 x 16 x 16 shorthand colors and keep the one with the smallest squared distance.
function oracle(color) {
  const target = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
  let best = null
  let bestDistance = Infinity
  for (let r = 0; r < 16; r++) for (let g = 0; g < 16; g++) for (let b = 0; b < 16; b++) {
    const candidate = [r, g, b].map(d => d * 17)
    const distance = candidate.reduce((sum, c, i) => sum + (c - target[i]) ** 2, 0)
    if (distance < bestDistance) {
      bestDistance = distance
      best = [r, g, b]
    }
  }
  return '#' + best.map(d => d.toString(16) + d.toString(16)).join('')
}

test('800 random colors match an exhaustive search', () => {
  let seed = 11
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const color = '#' + Array.from({ length: 3 }, () => rnd(256).toString(16).padStart(2, '0')).join('')
    assert.equal(buildTrace(color).result, oracle(color), color)
  }
})
