const MOD = 1000000007

const L = s => {
  const line = code.findIndex(c => c.text.includes(s)) + 1
  if (line < 1) throw new Error(`Missing pseudocode line: ${s}`)
  return line
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 40) throw new Error('n is an integer from 1 to 40.')
  return { n }
}

// A row of t upright triangles uses 2t cards for the triangles and t - 1 horizontal cards between them: 3t - 1 in all.
// Rows are stacked so that each row above has fewer triangles than the row below. A house is therefore a set of
// distinct row sizes whose costs add up to n, so each row size is used at most once.
export const rowCost = t => 3 * t - 1

export function buildTrace({ n }) {
  const frames = []
  const ways = Array(n + 1).fill(0)
  ways[0] = 1
  frames.push({ pythonLine: 4, phase: 'start', activeLine: L('ways[0] = 1'), total: 0, row: 0, cost: 0, ways: ways.slice(), target: n, message: 'With zero cards there is one way: the empty house.' })
  for (let t = 1; rowCost(t) <= n; t++) {
    const cost = rowCost(t)
    frames.push({ pythonLine: 7, phase: 'row', activeLine: L('const cost'), total: 0, row: t, cost, ways: ways.slice(), target: n, message: `A row of ${t} triangle${t === 1 ? '' : 's'} costs ${cost} cards. It can be used at most once, so the totals are updated from high to low.` })
    for (let total = n; total >= cost; total--) {
      ways[total] = (ways[total] + ways[total - cost]) % MOD
      frames.push({ pythonLine: 9, phase: 'total', activeLine: L('ways[total] = (ways'), total, row: t, cost, ways: ways.slice(), target: n, message: `${total} cards: add the ${ways[total - cost]} way${ways[total - cost] === 1 ? '' : 's'} for ${total - cost} cards, giving ${ways[total]}.` })
    }
  }
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return ways[n]'), total: n, row: 0, cost: 0, ways: ways.slice(), target: n, message: `The number of houses using exactly ${n} cards is ${ways[n]}.` })
  return { input: { n }, result: ways[n], frames }
}

export const code = `function houseOfCardsWays(n) {
  const MOD = 1000000007
  const ways = Array(n + 1).fill(0)
  ways[0] = 1
  for (let t = 1; 3 * t - 1 <= n; t++) {
    const cost = 3 * t - 1
    for (let total = n; total >= cost; total--) {
      ways[total] = (ways[total] + ways[total - cost]) % MOD
    }
  }
  return ways[n]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def houses_of_cards(n):
    MOD = 1000000007
    ways = [0] * (n + 1)
    ways[0] = 1
    t = 1
    while 3 * t - 1 <= n:
        cost = 3 * t - 1
        for total in range(n, cost - 1, -1):
            ways[total] = (ways[total] + ways[total - cost]) % MOD
        t += 1
    return ways[n]
`
