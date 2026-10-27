export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the key values.')
  const { values } = input
  if (!Array.isArray(values) || values.length < 3 || values.length > 8) throw new Error('values needs 3 to 8 integers.')
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Vertex values are integers from 1 to 20.')
  return { values }
}

export function buildTrace(input) {
  const { values } = input
  const n = values.length
  const best = Array.from({ length: n }, () => Array(n).fill(0))
  const frames = []
  let cell = null
  let apex = -1
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, cell, apex, best: best.map(row => [...row]), message,
  })

  snap('start', L('start with a table best'), 'Sides of the polygon cost nothing, since they are not triangles yet.')
  for (let len = 2; len < n; len++) {
    snap('length', L('for each length'), `Triangulate every sub-polygon spanning ${len} steps.`)
    for (let i = 0; i + len < n; i++) {
      const j = i + len
      cell = [i, j]
      let bestHere = Infinity
      for (let k = i + 1; k < j; k++) {
        apex = k
        const cost = best[i][k] + best[k][j] + values[i] * values[k] * values[j]
        bestHere = Math.min(bestHere, cost)
        snap('try', L('try every apex'), `Apex ${k} for base ${i}-${j} gives ${cost}.`)
      }
      best[i][j] = bestHere
      apex = -1
      snap('keep', L('keep the smallest cost'), `Best for ${i}-${j} is ${bestHere}.`)
    }
  }
  cell = null
  snap('done', L('return best'), `Minimum score: ${best[0][n - 1]}.`)
  return { input, result: best[0][n - 1], frames }
}

export const code = `start with a table best where each side of the polygon costs zero
for each length len from 2 up to n - 1
  for each start i, let j be i plus len
    try every apex k strictly between i and j
    the triangle cost is best[i][k] + best[k][j] + values[i] * values[k] * values[j]
    keep the smallest cost in best[i][j]
return best[0][n - 1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_score(values):
    n = len(values)
    best = [[0] * n for _ in range(n)]
    for length in range(2, n):
        for i in range(n - length):
            j = i + length
            best[i][j] = min(
                best[i][k] + best[k][j] + values[i] * values[k] * values[j]
                for k in range(i + 1, j)
            )
    return best[0][n - 1]
`
