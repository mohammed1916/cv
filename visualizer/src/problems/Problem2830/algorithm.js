const MAX_HOUSES = 12
const MAX_OFFERS = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, offers } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > MAX_HOUSES) throw new Error(`n must be an integer from 1 to ${MAX_HOUSES}.`)
  if (!Array.isArray(offers) || offers.length > MAX_OFFERS) throw new Error(`offers must be an array of at most ${MAX_OFFERS} offers.`)
  for (const o of offers) {
    if (!Array.isArray(o) || o.length !== 3 || o.some(v => !Number.isInteger(v))) throw new Error('Each offer is [start, end, gold] with integers.')
    const [s, e, g] = o
    if (s < 0 || e >= n || s > e) throw new Error('Each offer needs 0 <= start <= end < n.')
    if (g < 1 || g > 10) throw new Error('Gold is an integer from 1 to 10.')
  }
  return { n, offers }
}

export const code = `maximum gold from offers that do not share a house
  group the offers by the house where they end
  set best[0] to 0 for the empty set of houses
  for each house i from 0 to n minus 1
    set best[i+1] to best[i], which is skipping house i
    for each offer [start, i, gold] that ends at house i
      set best[i+1] to the larger of best[i+1] and best[start] plus gold
  return best[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, offers }) {
  const endingAt = Array.from({ length: n }, () => [])
  for (const o of offers) endingAt[o[1]].push(o)
  const best = [0]
  const frames = [{ phase: 'start', house: -1, best: [...best], offer: null, activeLine: L('set best[0]'), message: 'Before any house, the profit is 0.' }]
  for (let i = 0; i < n; i++) {
    best[i + 1] = best[i]
    frames.push({ phase: 'house', house: i, best: [...best], offer: null, activeLine: L('set best[i+1] to best[i]'), message: `House ${i}: skipping it keeps ${best[i + 1]}.` })
    for (const [s, , g] of endingAt[i]) {
      const candidate = best[s] + g
      if (candidate > best[i + 1]) best[i + 1] = candidate
      frames.push({ phase: 'offer', house: i, best: [...best], offer: [s, i, g], activeLine: L('set best[i+1] to the larger'), message: `Offer ${s} to ${i} for ${g}: best[${s}] + ${g} = ${candidate}; best[${i + 1}] is ${best[i + 1]}.` })
    }
  }
  frames.push({ phase: 'done', house: n - 1, best: [...best], offer: null, activeLine: L('return best[n]'), message: `Maximum gold: ${best[n]}.` })
  return { input: { n, offers }, result: best[n], frames }
}

export const python = `def maximize_the_profit(n, offers):
    ending = {}
    for start, end, gold in offers:
        ending.setdefault(end, []).append((start, gold))
    best = [0] * (n + 1)
    for i in range(n):
        best[i + 1] = best[i]
        for start, gold in ending.get(i, []):
            best[i + 1] = max(best[i + 1], best[start] + gold)
    return best[n]
`
