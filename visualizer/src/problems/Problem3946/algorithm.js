export const phases = [
  { id: 'start', label: 'Setup', description: 'Count the grants each type earns.' },
  { id: 'type', label: 'Type', description: 'Add one type as a purchasable choice.' },
  { id: 'budget', label: 'Budget', description: 'Extend every budget row with this type.' },
  { id: 'done', label: 'Result', description: 'Report the best total within the budget.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with factors, prices and budget.')
  const { factors, prices, budget } = input
  if (!Array.isArray(factors) || !Array.isArray(prices) || factors.length < 1 || factors.length > 8 || factors.length !== prices.length) throw new Error('factors and prices are equal-length lists of 1 to 8 entries.')
  if (!factors.every(v => Number.isInteger(v) && v >= 1 && v <= 30)) throw new Error('Each factor is an integer from 1 to 30.')
  if (!prices.every(v => Number.isInteger(v) && v >= 1 && v <= 30)) throw new Error('Each price is an integer from 1 to 30.')
  if (!Number.isInteger(budget) || budget < 1 || budget > 60) throw new Error('budget is an integer from 1 to 60.')
  return { factors, prices, budget }
}

export function buildTrace({ factors, prices, budget }) {
  const n = factors.length
  const grants = factors.map((f, i) => factors.filter((g, j) => j !== i && g % f === 0).length)
  let best = Array(budget + 1).fill(0)
  const frames = [{ phase: 'start', activeLine: L('let grants'), pythonLine: P('grants = []'), message: `Grants per type: ${grants.join(', ')}. A type bought once earns its grants whatever its copy count.`, type: -1, grants, row: best.slice(), budget }]
  for (let i = 0; i < n; i++) {
    const p = prices[i]
    const g = grants[i]
    const ext = Array(budget + 1).fill(-Infinity)
    const next = best.slice()
    frames.push({ phase: 'type', activeLine: L('for each type i'), pythonLine: P('p = prices[i]'), message: `Type ${i}: price ${p}, grants ${g}. The first copy is worth ${g + 1}, extra copies are worth 1.`, type: i, grants, row: best.slice(), budget })
    for (let b = p; b <= budget; b++) {
      let cand = best[b - p] + g + 1
      if (ext[b - p] > -Infinity) cand = Math.max(cand, ext[b - p] + 1)
      ext[b] = cand
      next[b] = Math.max(next[b], cand)
    }
    best = next
    frames.push({ phase: 'budget', activeLine: L('set ext[b] to cand'), pythonLine: P('ext[b] = cand'), message: `Budget row updated with type ${i}.`, type: i, grants, row: best.slice(), budget })
  }
  frames.push({ phase: 'done', activeLine: L('return best[budget]'), pythonLine: P('return best[budget]'), message: `The best total within budget ${budget} is ${best[budget]}.`, type: -1, grants, row: best.slice(), budget })
  return { input: { factors, prices, budget }, result: best[budget], frames }
}

export const code = `maximum purchased plus free items
  let grants[i] be the number of other types whose factor is a multiple of factors[i]
  let best[b] be zero for every budget b
  for each type i
    let ext[b] be negative infinity
    let next be a copy of best
    for each budget b from price[i] up to the budget
      let cand be best[b minus price] plus grants[i] plus one
      if ext[b minus price] is reachable then cand is the larger of cand and ext[b minus price] plus one
      set ext[b] to cand and next[b] to the larger of next[b] and cand
    set best to next
  return best[budget]`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_items(factors, prices, budget):
    n = len(factors)
    grants = []
    for i in range(n):
        count = 0
        for j in range(n):
            if j != i and factors[j] % factors[i] == 0:
                count += 1
        grants.append(count)
    best = [0] * (budget + 1)
    for i in range(n):
        p = prices[i]
        g = grants[i]
        ext = [float('-inf')] * (budget + 1)
        nxt = best[:]
        for b in range(p, budget + 1):
            cand = best[b - p] + g + 1
            if ext[b - p] > float('-inf'):
                cand = max(cand, ext[b - p] + 1)
            ext[b] = cand
            nxt[b] = max(nxt[b], cand)
        best = nxt
    return best[budget]`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
