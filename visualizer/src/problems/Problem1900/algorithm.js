// Earliest and latest rounds in which two chosen players meet.
// The two tracked players always win their own pairs; every other pair may go either way.
export function earliestAndLatest(n, first, second) {
  const memo = new Map()
  const solve = (row, round) => {
    const key = `${row.join(',')}|${round}`
    if (memo.has(key)) return memo.get(key)
    const m = row.length
    const k = Math.floor(m / 2)
    let result = null
    if (m < 2) return null
    const meets = Array.from({ length: k }, (_, i) => row[i]).some((p, i) => {
      const q = row[m - 1 - i]
      return (p === first && q === second) || (p === second && q === first)
    })
    if (meets) {
      result = [round, round]
    } else {
      // A tracked player always wins, so only ordinary pairs have a free choice.
      const options = Array.from({ length: k }, (_, i) => {
        const a = row[i], b = row[m - 1 - i]
        if (a === first || a === second) return [i]
        if (b === first || b === second) return [m - 1 - i]
        return [i, m - 1 - i]
      })
      const free = options.filter(o => o.length === 2).length
      for (let mask = 0; mask < 2 ** free; mask++) {
        let bit = 0
        const kept = options.map(o => (o.length === 1 ? o[0] : o[(mask >> bit++) & 1]))
        if (m % 2) kept.push(k)
        kept.sort((a, b) => a - b)
        const child = solve(kept.map(i => row[i]), round + 1)
        if (!child) continue
        if (!result) result = [...child]
        else result = [Math.min(result[0], child[0]), Math.max(result[1], child[1])]
      }
    }
    memo.set(key, result)
    return result
  }
  return solve(Array.from({ length: n }, (_, i) => i + 1), 1)
}
