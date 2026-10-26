export function parseInput(text) {
  const data = JSON.parse(text)
  const { price, special, needs } = data ?? {}
  if (!Array.isArray(price) || price.length < 1 || price.length > 6 || price.some(p => !Number.isInteger(p) || p < 1 || p > 10000)) throw new Error('price must be 1–6 integers from 1 to 10,000.')
  if (!Array.isArray(needs) || needs.length !== price.length || needs.some(q => !Number.isInteger(q) || q < 0 || q > 6)) throw new Error('needs must match price in length, with integers 0–6.')
  if (!Array.isArray(special) || special.length > 6) throw new Error('special must hold up to 6 offers.')
  for (const offer of special) {
    if (!Array.isArray(offer) || offer.length !== price.length + 1 || offer.some(v => !Number.isInteger(v) || v < 0)) throw new Error('Each offer is [count per item…, offerPrice].')
  }
  return { price, special, needs }
}

// Memoized search: buy the rest at list price, or apply any offer that fits the remaining needs.
export function buildTrace({ price, special, needs }) {
  const memo = new Map()
  const frames = [{ phase: 'start', needs: [...needs], best: null, path: [], activeLine: 2, message: 'Compare buying the remaining items at list price with applying each fitting offer.' }]
  const listCost = n => n.reduce((sum, q, i) => sum + q * price[i], 0)
  function solve(n, path) {
    const key = n.join(',')
    if (memo.has(key)) return memo.get(key)
    let best = listCost(n)
    frames.push({ phase: 'price', needs: [...n], best, path: [...path], activeLine: 4, message: `Remaining ${n.join(', ')}: list price ${best}.` })
    for (const offer of special) {
      const counts = offer.slice(0, -1)
      if (counts.every((c, i) => c <= n[i])) {
        const next = n.map((q, i) => q - counts[i])
        const cost = offer.at(-1) + solve(next, [...path, `offer ${offer.join(' ')}`])
        if (cost < best) best = cost
        frames.push({ phase: 'offer', needs: [...n], best, path: [...path, `offer ${offer.join(' ')}`], activeLine: 7, message: `Offer [${offer.join(', ')}] fits; best for these needs is ${best}.` })
      }
    }
    memo.set(key, best)
    return best
  }
  const result = solve([...needs], [])
  frames.push({ phase: 'done', needs: [...needs], best: result, path: [], result, activeLine: 9, message: `Minimum price: ${result}.` })
  return { input: { price, special, needs }, result, frames }
}

export const code = `def shoppingOffers(price, special, needs):
    memo = {}
    def dfs(needs):
        key = tuple(needs)
        if key in memo: return memo[key]
        best = sum(q * p for q, p in zip(needs, price))
        for offer in special:
            if all(c <= q for c, q in zip(offer, needs)):
                best = min(best, offer[-1] + dfs([q - c for q, c in zip(needs, offer)]))
        memo[key] = best
        return best
    return dfs(needs)`.split('\n').map((text, index) => ({ line: index + 1, text }))
