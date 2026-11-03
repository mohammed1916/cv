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
export const rowCost = t => 3 * t - 1

export function buildTrace({ n }) {
  const frames = []
  const ways = Array(n + 1).fill(0)
  ways[0] = 1
  frames.push({ pythonLine: 4, phase: 'start', activeLine: L('ways[0] = 1'), total: 0, row: 0, cost: 0, ways: ways.slice(), target: n, message: 'With zero cards there is one way: the empty house.' })
  for (let total = 1; total <= n; total++) {
    frames.push({ pythonLine: 5, phase: 'total', activeLine: L('for each card count'), total, row: 0, cost: 0, ways: ways.slice(), target: n, message: `Count the houses that use exactly ${total} card${total === 1 ? '' : 's'}.` })
    for (let t = 1; rowCost(t) <= total; t++) {
      const cost = rowCost(t)
      ways[total] = (ways[total] + ways[total - cost]) % MOD
      frames.push({ pythonLine: 9, phase: 'row', activeLine: L('add ways[total - cost]'), total, row: t, cost, ways: ways.slice(), target: n, message: `A top row of ${t} triangle${t === 1 ? '' : 's'} costs ${cost} cards. Add the ${total - cost}-card houses below it: ${ways[total - cost]} way${ways[total - cost] === 1 ? '' : 's'}.` })
    }
    frames.push({ pythonLine: 10, phase: 'filled', activeLine: L('keep ways'), total, row: 0, cost: 0, ways: ways.slice(), target: n, message: `${total} card${total === 1 ? '' : 's'}: ${ways[total]} way${ways[total] === 1 ? '' : 's'}.` })
  }
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return ways[n]'), total: n, row: 0, cost: 0, ways: ways.slice(), target: n, message: `The number of houses using exactly ${n} cards is ${ways[n]}.` })
  return { input: { n }, result: ways[n], frames }
}

export const code = `count the houses that use exactly n cards
a row of t triangles costs 3t minus 1 cards
ways[0] = 1 for the empty house
for each card count total from 1 to n
  ways[total] = 0
  for each row size t with cost at most total
    add ways[total - cost] to ways[total]
  keep ways[total] modulo 1000000007
return ways[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def houses_of_cards(n):
    MOD = 1000000007
    ways = [0] * (n + 1)
    ways[0] = 1
    for total in range(1, n + 1):
        t = 1
        while 3 * t - 1 <= total:
            cost = 3 * t - 1
            ways[total] = (ways[total] + ways[total - cost]) % MOD
            t += 1
    return ways[n]
`
