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

export const code = `memoize each result by the remaining-needs vector
keep only useful bundles: at least one item, and cheaper than buying those items one by one
price all remaining units individually as the baseline
for each useful bundle that fits without overbuying:
  combine its cost with the optimal cost of the reduced needs
keep the minimum as this state's answer and store it in the memo
return the minimum cost for the original needs`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Collection trace: codeStage 'needs' is the per-state update (line 6); 'return' is line 7.
const STAGE_LINE = { needs: 6, return: 7 }
export const LINE_MAP = { 1: 1, 4: 6, 5: 7 }

export function familyLine(frame) {
  return STAGE_LINE[frame.codeStage] ?? LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def shopping_offers(price, special, needs):
    useful = [offer for offer in special
              if any(offer[:-1]) and offer[-1] < sum(q * p for q, p in zip(offer[:-1], price))]
    memo = {}

    def solve(remaining):
        if remaining in memo:
            return memo[remaining]
        best = sum(q * p for q, p in zip(remaining, price))
        for offer in useful:
            if all(q >= offer[i] for i, q in enumerate(remaining)):
                reduced = tuple(q - offer[i] for i, q in enumerate(remaining))
                best = min(best, offer[-1] + solve(reduced))
        memo[remaining] = best
        return best

    return solve(tuple(needs))`
