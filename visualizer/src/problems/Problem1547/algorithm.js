export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys n and cuts.')
  const { n, cuts } = input
  if (!Number.isInteger(n) || n < 2 || n > 20) throw new Error('n must be an integer from 2 to 20.')
  if (!Array.isArray(cuts) || cuts.length < 1 || cuts.length > 6) throw new Error('cuts needs 1 to 6 positions.')
  if (cuts.some(c => !Number.isInteger(c) || c < 1 || c > n - 1) || new Set(cuts).size !== cuts.length) {
    throw new Error('Each cut is a distinct position from 1 to n-1.')
  }
  return { n, cuts }
}

export function buildTrace(input) {
  const { n, cuts } = input
  const pts = [...cuts, 0, n].sort((a, b) => a - b)
  const m = pts.length
  const best = Array.from({ length: m }, () => Array(m).fill(0))
  const frames = []
  let cell = null
  let apex = -1
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, cell, apex, pts: [...pts], best: best.map(row => [...row]), message,
  })

  snap('start', L('sort the cuts'), `Points on the stick: [${pts.join(', ')}]. Pieces between neighbors cost nothing yet.`)
  for (let len = 2; len < m; len++) {
    snap('length', L('for each gap length'), `Solve every stretch spanning ${len} steps.`)
    for (let i = 0; i + len < m; i++) {
      const j = i + len
      cell = [i, j]
      let bestHere = Infinity
      for (let k = i + 1; k < j; k++) {
        apex = k
        const total = best[i][k] + best[k][j] + pts[j] - pts[i]
        bestHere = Math.min(bestHere, total)
        snap('try', L('try every cut k'), `Cut at ${pts[k]} inside ${pts[i]} to ${pts[j]} costs ${total} in total.`)
      }
      best[i][j] = bestHere
      apex = -1
      snap('keep', L('keep the smallest total'), `Best for ${pts[i]} to ${pts[j]} is ${bestHere}.`)
    }
  }
  cell = null
  snap('done', L('return best'), `Minimum total cost: ${best[0][m - 1]}.`)
  return { input, result: best[0][m - 1], frames }
}

export const code = `sort the cuts and add the two ends 0 and n to them
let m be the number of points, and set best to zero for each neighboring pair
for each gap length from 2 up to m - 1
  for each left point i, let j be i plus the gap
    try every cut k strictly between i and j
    the total is best[i][k] + best[k][j] + the length from point i to point j
    keep the smallest total in best[i][j]
return best[0][m - 1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_cost(n, cuts):
    pts = sorted(cuts + [0, n])
    m = len(pts)
    best = [[0] * m for _ in range(m)]
    for length in range(2, m):
        for i in range(m - length):
            j = i + length
            best[i][j] = min(
                best[i][k] + best[k][j] + pts[j] - pts[i]
                for k in range(i + 1, j)
            )
    return best[0][m - 1]
`
