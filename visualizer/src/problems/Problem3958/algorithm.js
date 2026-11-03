const MAX_N = 40

function lookup(lines, text) {
  const index = lines.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const value = Number(String(text).trim())
  if (!Number.isInteger(value) || value < 1 || value > MAX_N) throw new Error(`Use an integer n from 1 to ${MAX_N}.`)
  return { n: value }
}

export function buildTrace({ n }) {
  const L = text => lookup(code, text)
  const P = text => lookup(pyLines, text)
  const best = Array(n + 1).fill(null)
  best[1] = 0
  const snap = () => best.slice()
  const frames = []
  frames.push({ pythonLine: P('best[1] = 0'), phase: 'start', activeLine: L('set best[1]'), x: 1, a: null, cand: null, best: snap(), message: 'One is already a single one, so best[1] is 0.' })
  for (let x = 2; x <= n; x++) {
    frames.push({ pythonLine: P('for x in range'), phase: 'row', activeLine: L('for x from 2'), x, a: null, cand: null, best: snap(), message: `Find the cheapest way to break ${x} down.` })
    for (let a = 1; a <= Math.floor(x / 2); a++) {
      const cand = a * (x - a) + best[a] + best[x - a]
      frames.push({ pythonLine: P('cand = a *'), phase: 'try', activeLine: L('cand = a * (x - a)'), x, a, cand, best: snap(), message: `Split ${x} into ${a} and ${x - a}: cost ${a * (x - a)} plus known costs gives ${cand}.` })
      if (best[x] === null || cand < best[x]) {
        best[x] = cand
        frames.push({ pythonLine: P('best[x] = cand'), phase: 'keep', activeLine: L('if best[x] is unknown'), x, a, cand, best: snap(), message: `${cand} is the cheapest split of ${x} so far.` })
      } else {
        frames.push({ pythonLine: P('if best[x] is None'), phase: 'skip', activeLine: L('if best[x] is unknown'), x, a, cand, best: snap(), message: `${cand} is not cheaper than ${best[x]}.` })
      }
    }
  }
  frames.push({ pythonLine: P('return best[n]'), phase: 'done', activeLine: L('return best[n]'), x: n, a: null, cand: null, best: snap(), message: `Splitting ${n} into ones costs ${best[n]}.` })
  return { input: { n }, result: best[n], frames }
}

export const code = `minimum cost to split n into ones
  set best[1] to 0 and every other entry to unknown
  for x from 2 to n
    for a from 1 to floor(x / 2)
      cand = a * (x - a) + best[a] + best[x - a]
      if best[x] is unknown or cand < best[x] then set best[x] to cand
  return best[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_cost_to_ones(n):
    best = [None] * (n + 1)
    best[1] = 0
    for x in range(2, n + 1):
        for a in range(1, x // 2 + 1):
            cand = a * (x - a) + best[a] + best[x - a]
            if best[x] is None or cand < best[x]:
                best[x] = cand
    return best[n]
`

const pyLines = python.split('\n').map((text, index) => ({ line: index + 1, text }))
