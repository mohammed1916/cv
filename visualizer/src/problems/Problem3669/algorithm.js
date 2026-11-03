export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and k.')
  const { n, k } = input
  if (!Number.isInteger(n) || n < 4 || n > 1000) throw new Error('n is an integer from 4 to 1000 (the visualization caps it).')
  if (!Number.isInteger(k) || k < 2 || k > 5) throw new Error('k is an integer from 2 to 5.')
  if (divisorsOf(n).length <= k) throw new Error('n needs more divisors than k.')
  return { n, k }
}

export function divisorsOf(n) {
  const out = []
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) { out.push(d); if (d * d !== n) out.push(n / d) }
  }
  return out.sort((a, b) => a - b)
}

export function buildTrace({ n, k }) {
  const divs = divisorsOf(n)
  const frames = []
  const chosen = []
  let best = null
  let bestSpread = Infinity
  frames.push({ pythonLine: P('divs = '), phase: 'start', activeLine: L('list the divisors'), parts: [], spread: null, best: null, message: `Divisors of ${n}: ${divs.join(', ')}.` })
  const search = (start, rem, slots) => {
    if (slots === 1) {
      if (rem < divs[start]) return
      const parts = [...chosen, rem]
      const spread = rem - parts[0]
      const improved = spread < bestSpread
      if (improved) { best = parts; bestSpread = spread }
      frames.push({ pythonLine: P('if rem >= divs'), phase: 'try', activeLine: L('compare its spread'), parts, spread, best: best && [...best], message: `${parts.join(' × ')} has spread ${spread}${improved ? ', the new best' : ''}.` })
      return
    }
    for (let i = start; i < divs.length; i++) {
      const d = divs[i]
      if (d ** slots > rem) break
      if (rem % d !== 0) continue
      chosen.push(d)
      search(i, rem / d, slots - 1)
      chosen.pop()
    }
  }
  search(0, n, k)
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return the best'), parts: best, spread: bestSpread, best: best && [...best], message: `Best split ${best.join(' × ')} with spread ${bestSpread}.` })
  return { input: { n, k }, result: best, frames }
}

export const code = `split n into k factors with product n and the smallest spread
list the divisors of n
search factor lists in non-decreasing order
  if one slot is left, the remaining value is the last factor
    if it keeps the order, compare its spread with the best so far
  otherwise try each divisor that keeps the order and still fits
return the best factor list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def balanced_k_factors(n, k):
    divs = [d for d in range(1, n + 1) if n % d == 0]
    best = None
    best_spread = float('inf')
    chosen = []

    def search(start, rem, slots):
        nonlocal best, best_spread
        if slots == 1:
            if rem >= divs[start]:
                parts = chosen + [rem]
                spread = rem - parts[0]
                if spread < best_spread:
                    best, best_spread = parts, spread
            return
        for i in range(start, len(divs)):
            d = divs[i]
            if d ** slots > rem:
                break
            if rem % d == 0:
                chosen.append(d)
                search(i, rem // d, slots - 1)
                chosen.pop()

    search(0, n, k)
    return best
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
