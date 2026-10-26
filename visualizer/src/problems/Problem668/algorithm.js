export function parseInput(text) {
  const data = JSON.parse(text)
  const { m, n, k } = data ?? {}
  if (![m, n].every(v => Number.isInteger(v) && v >= 1 && v <= 3000)) throw new Error('m and n must be integers from 1 to 3,000.')
  if (!Number.isInteger(k) || k < 1 || k > m * n) throw new Error('k must be an integer from 1 to m·n.')
  return { m, n, k }
}

// Binary search on the answer: count how many products are ≤ mid, row by row, and narrow toward k.
export function buildTrace({ m, n, k }) {
  let lo = 1, hi = m * n
  const frames = [{ phase: 'start', lo, hi, mid: null, count: null, activeLine: 2, message: `Search the value v in [1, ${m * n}] for which at least ${k} products are ≤ v.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    let count = 0
    for (let i = 1; i <= m; i++) count += Math.min(n, Math.floor(mid / i))
    const enough = count >= k
    frames.push({ phase: 'count', lo, hi, mid, count, enough, activeLine: 6, message: `mid ${mid}: ${count} products ≤ ${mid}; ${enough ? 'at least k, so answer ≤ mid' : 'fewer than k, so answer > mid'}.` })
    if (enough) hi = mid
    else lo = mid + 1
  }
  frames.push({ phase: 'done', lo, hi, mid: null, count: null, result: lo, activeLine: 8, message: `The ${k}-th smallest product is ${lo}.` })
  return { input: { m, n, k }, result: lo, frames }
}

export const code = `def findKthNumber(m, n, k):
    lo, hi = 1, m * n
    while lo < hi:
        mid = (lo + hi) // 2
        count = sum(min(n, mid // i) for i in range(1, m + 1))
        if count >= k: hi = mid
        else: lo = mid + 1
    return lo`.split('\n').map((text, index) => ({ line: index + 1, text }))
