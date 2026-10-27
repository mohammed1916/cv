export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with price (an array) and k.')
  const { price, k } = data
  if (!Array.isArray(price) || price.length < 2 || price.length > 12) throw new Error('price needs 2 to 12 entries.')
  if (price.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each price is an integer from 1 to 50.')
  if (!Number.isInteger(k) || k < 2 || k > price.length) throw new Error('k is an integer from 2 up to the number of prices.')
  return { price, k }
}

export function buildTrace({ price, k }) {
  const sorted = [...price].sort((a, b) => a - b)
  // Greedy: take the smallest price, then each later price that is at least `gap` above the last one taken.
  const pick = gap => {
    const picked = [0]
    for (let i = 1; i < sorted.length; i++) if (sorted[i] - sorted[picked[picked.length - 1]] >= gap) picked.push(i)
    return picked
  }
  let lo = 0
  let hi = sorted[sorted.length - 1] - sorted[0]
  const domain = [lo, hi]
  const frames = [{ phase: 'start', activeLine: L('sort the prices'), lo, hi, mid: null, verdict: null, picked: [], message: `Sorted prices: ${sorted.join(', ')}. The answer lies between ${lo} and ${hi}.` }]
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    const picked = pick(mid)
    const verdict = picked.length >= k
    frames.push({ phase: 'probe', activeLine: L('if the greedy count reaches k'), lo, hi, mid, verdict, picked, message: `Gap ${mid}: greedy takes ${picked.length} candies, ${verdict ? 'enough' : 'too few'} for k = ${k}.` })
    if (verdict) lo = mid
    else hi = mid - 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: null, picked: pick(lo), message: `Largest achievable tastiness: ${lo}.` })
  return { input: { price, k }, sorted, domain, result: lo, frames }
}

export const code = `maximum tastiness of a basket of k candies
  sort the prices
  set low to 0 and high to the largest price minus the smallest price
  while low is less than high
    set mid to the middle value, rounded up
    if the greedy count reaches k for gap mid then
      set low to mid
    otherwise
      set high to mid minus 1
  return low

greedy count for a gap
  take the smallest price
  for each later price, take it when it is at least the gap above the last price taken
  return the number of prices taken`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_tastiness(price, k):
    sorted_prices = sorted(price)

    def greedy_count(gap):
        taken = 1
        last = sorted_prices[0]
        for value in sorted_prices[1:]:
            if value - last >= gap:
                taken += 1
                last = value
        return taken

    low, high = 0, sorted_prices[-1] - sorted_prices[0]
    while low < high:
        mid = (low + high + 1) // 2
        if greedy_count(mid) >= k:
            low = mid
        else:
            high = mid - 1
    return low
`
