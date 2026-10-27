export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with usageLimits (an array).')
  const { usageLimits } = data
  if (!Array.isArray(usageLimits) || usageLimits.length < 1 || usageLimits.length > 6) throw new Error('usageLimits needs 1 to 6 values.')
  if (usageLimits.some(v => !Number.isInteger(v) || v < 1 || v > 6)) throw new Error('Each usage limit is an integer from 1 to 6.')
  return { usageLimits }
}

export function buildTrace({ usageLimits }) {
  const total = usageLimits.reduce((a, b) => a + b, 0)
  // Groups of sizes 1..k are the smallest strictly increasing choice, so k groups fit when the demands can be routed.
  const demandsFit = k => {
    let demand = 0
    for (let t = 1; t <= k; t++) {
      demand += k - t + 1
      const supply = usageLimits.reduce((sum, u) => sum + Math.min(u, t), 0)
      if (demand > supply) return false
    }
    return true
  }
  let up = 0
  while (((up + 1) * (up + 2)) / 2 <= total) up++
  let lo = 0
  let hi = up
  const domain = [lo, hi]
  const frames = [{ phase: 'start', activeLine: L('set low to 0'), lo, hi, mid: null, verdict: null, message: `Up to ${hi} groups could have sizes 1 to ${hi} within a total of ${total} uses.` }]
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    const verdict = demandsFit(mid)
    frames.push({ phase: 'probe', activeLine: L('if sizes 1 to mid can be filled'), lo, hi, mid, verdict, message: `Try ${mid} groups of sizes 1 to ${mid}: ${verdict ? 'the uses can cover them' : 'some group sizes need more uses than exist'}.` })
    if (verdict) lo = mid
    else hi = mid - 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: true, message: `Maximum number of groups: ${lo}.` })
  return { input: { usageLimits }, domain, result: lo, frames }
}

export const code = `maximum number of groups with strictly increasing sizes
  set total to the sum of the usage limits
  set low to 0 and high to the largest count whose triangle number fits in total
  while low is less than high
    set mid to the middle value, rounded up
    if sizes 1 to mid can be filled then
      set low to mid
    otherwise
      set high to mid minus 1
  return low

check whether groups of sizes 1 to k can be filled
  for each number of groups t from 1 to k
    add the t largest sizes, which are k, k minus 1, and so on
    check that the sum over all numbers of the smaller of its limit and t is at least that total
  return true when every check passes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_groups(usageLimits):
    total = sum(usageLimits)

    def fits(k):
        demand = 0
        for t in range(1, k + 1):
            demand += k - t + 1
            supply = sum(min(u, t) for u in usageLimits)
            if demand > supply:
                return False
        return True

    up = 0
    while (up + 1) * (up + 2) // 2 <= total:
        up += 1
    low, high = 0, up
    while low < high:
        mid = (low + high + 1) // 2
        if fits(mid):
            low = mid
        else:
            high = mid - 1
    return low
`
