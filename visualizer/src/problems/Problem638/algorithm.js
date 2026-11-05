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

// Memoized search over the remaining needs. Each state either pays list price for everything left,
// or applies an offer that fits without overbuying and continues from the smaller remainder.
export function buildTrace({ price, special, needs }) {
  const memo = new Map()
  const frames = [{ phase: 'start', needs: [...needs], best: null, offer: null, activeLine: L('const memo = new Map()'), pythonLine: P('memo = {}'), message: 'Compare buying the remaining items at list price with applying each offer that fits.' }]
  const listCost = counts => counts.reduce((sum, q, i) => sum + q * price[i], 0)
  function solve(counts, offerPath) {
    const key = counts.join(',')
    if (memo.has(key)) return memo.get(key)
    let best = listCost(counts)
    frames.push({ phase: 'price', needs: [...counts], best, offer: null, path: offerPath, activeLine: L('let best = listCost'), pythonLine: P('best = sum('), message: `Remaining [${counts.join(', ')}]: list price ${best}.` })
    for (const offer of special) {
      const take = offer.slice(0, -1)
      if (take.every((c, i) => c <= counts[i])) {
        const rest = counts.map((q, i) => q - take[i])
        const cost = offer[offer.length - 1] + solve(rest, [...offerPath, offer])
        if (cost < best) best = cost
        frames.push({ phase: 'offer', needs: [...counts], best, offer, path: offerPath, activeLine: L('best = Math.min'), pythonLine: P('best = min('), message: `Offer [${offer.join(', ')}] fits; best for these needs is ${best}.` })
      }
    }
    memo.set(key, best)
    return best
  }
  const result = solve([...needs], [])
  frames.push({ phase: 'done', needs: [...needs], best: result, offer: null, result, activeLine: L('return solve'), pythonLine: P('return solve('), message: `Minimum price: ${result}.` })
  return { input: { price, special, needs }, result, frames }
}

const SOURCE = `function shoppingOffers(price, special, needs) {
  const memo = new Map()
  const listCost = counts => counts.reduce((sum, q, i) => sum + q * price[i], 0)
  function solve(counts) {
    const key = counts.join(',')
    if (memo.has(key)) return memo.get(key)
    let best = listCost(counts)
    for (const offer of special) {
      const take = offer.slice(0, -1)
      if (take.every((c, i) => c <= counts[i])) {
        const rest = counts.map((q, i) => q - take[i])
        best = Math.min(best, offer[offer.length - 1] + solve(rest))
      }
    }
    memo.set(key, best)
    return best
  }
  return solve(needs)
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shopping_offers(price, special, needs):
    memo = {}

    def solve(remaining):
        if remaining in memo:
            return memo[remaining]
        best = sum(q * p for q, p in zip(remaining, price))
        for offer in special:
            take, offer_price = offer[:-1], offer[-1]
            if all(q >= t for q, t in zip(remaining, take)):
                reduced = tuple(q - t for q, t in zip(remaining, take))
                best = min(best, offer_price + solve(reduced))
        memo[remaining] = best
        return best

    return solve(tuple(needs))`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
