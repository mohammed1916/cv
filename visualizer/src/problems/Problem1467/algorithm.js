export function parseInput(text) {
  const balls = JSON.parse(text)
  if (!Array.isArray(balls) || balls.length < 2 || balls.length > 8) throw new Error('Use 2 to 8 colour counts.')
  if (balls.some(v => !Number.isInteger(v) || v < 1 || v > 6)) throw new Error('Each colour count is an integer from 1 to 6.')
  const total = balls.reduce((a, b) => a + b, 0)
  if (total > 16) throw new Error('The visualization caps the total at 16 balls.')
  if (total % 2 !== 0) throw new Error('The total number of balls must be even.')
  return balls
}

// choose(n, k) for the small table this problem needs.
const choose = (n, k) => {
  if (k < 0 || k > n) return 0
  let value = 1
  for (let i = 1; i <= k; i++) value = (value * (n - k + i)) / i
  return Math.round(value)
}
const key = (size, d1, d2) => `${size},${d1},${d2}`

export function buildTrace(balls) {
  const total = balls.reduce((a, b) => a + b, 0)
  const half = total / 2
  let ways = new Map([[key(0, 0, 0), 1]])
  const frames = [{ phase: 'start', activeLine: L('const total'), pythonLine: 4, color: -1, states: ways.size, favorable: 0, message: `There are ${total} balls. Each box must receive ${half}.` }]
  balls.forEach((count, color) => {
    const next = new Map()
    for (const [state, w] of ways) {
      const [size, d1, d2] = state.split(',').map(Number)
      for (let k = 0; k <= count; k++) {
        if (size + k > half) continue
        const nk = key(size + k, d1 + (k > 0 ? 1 : 0), d2 + (count - k > 0 ? 1 : 0))
        next.set(nk, (next.get(nk) || 0) + w * choose(count, k))
      }
    }
    ways = next
    frames.push({ phase: 'color', activeLine: L('for (const c of balls)'), pythonLine: 15, color, states: ways.size, favorable: 0, rows: [...ways].map(([state, w]) => ({ state, w })), message: `Colour ${color + 1} has ${count} balls. Split them into the two boxes in every way.` })
  })
  let favorable = 0
  for (const [state, w] of ways) {
    const [size, d1, d2] = state.split(',').map(Number)
    if (size === half && d1 === d2) favorable += w
  }
  const result = favorable / choose(total, half)
  frames.push({ phase: 'done', activeLine: L('return favorable / choose'), pythonLine: 17, color: balls.length, states: ways.size, favorable, message: `${favorable} favourable splits out of ${choose(total, half)}, so the probability is ${result.toFixed(5)}.` })
  return { input: balls, result, frames }
}

const CODE = [
  'function choose(n, k) {',
  '  let v = 1; for (let i = 1; i <= k; i++) v = (v * (n - k + i)) / i',
  '  return Math.round(v)',
  '}',
  'function probabilitySameDistinct(balls) {',
  '  const total = balls.reduce((a, b) => a + b, 0)',
  '  const half = total / 2',
  "  let ways = new Map([['0,0,0', 1]])",
  '  for (const c of balls) {',
  '    const next = new Map()',
  '    for (const [state, w] of ways) {',
  "      const [size, d1, d2] = state.split(',').map(Number)",
  '      for (let k = 0; k <= c; k++) {',
  '        if (size + k > half) continue',
  "        const key = `${size + k},${d1 + (k > 0 ? 1 : 0)},${d2 + (c - k > 0 ? 1 : 0)}`",
  '        next.set(key, (next.get(key) || 0) + w * choose(c, k))',
  '      }',
  '    }',
  '    ways = next',
  '  }',
  '  let favorable = 0',
  "  for (const [state, w] of ways) { const [size, d1, d2] = state.split(',').map(Number); if (size === half && d1 === d2) favorable += w }",
  '  return favorable / choose(total, half)',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(text => text.includes(s)) + 1

export const python = `from math import comb

def probability(balls):
    total = sum(balls)
    half = total // 2
    ways = {(0, 0, 0): 1}
    for c in balls:
        nxt = {}
        for (size, d1, d2), w in ways.items():
            for k in range(c + 1):
                if size + k > half:
                    continue
                state = (size + k, d1 + (k > 0), d2 + (c - k > 0))
                nxt[state] = nxt.get(state, 0) + w * comb(c, k)
        ways = nxt
    favorable = sum(w for (size, d1, d2), w in ways.items() if size == half and d1 == d2)
    return favorable / comb(total, half)
`
