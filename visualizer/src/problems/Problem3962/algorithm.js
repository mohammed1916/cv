export const code = `best is negative infinity
for each left index l
  for each right index r from l
    inside is the window from l to r, outside is everything else
    base is the sum of the inside values
    sort inside values ascending and outside values descending
    for each swap t while t is below k
      if the outside value is not larger than the inside value, stop
      add outside minus inside to base, using one swap
    best is the larger of best and base
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_subarray_after_swaps(nums, k):
    n = len(nums)
    best = None
    for l in range(n):
        for r in range(l, n):
            inside = nums[l:r + 1]
            outside = nums[:l] + nums[r + 1:]
            total = sum(inside)
            lows = sorted(inside)
            highs = sorted(outside, reverse=True)
            for t in range(min(k, len(lows), len(highs))):
                if highs[t] <= lows[t]:
                    break
                total += highs[t] - lows[t]
            if best is None or total > best:
                best = total
    return best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums holds 1 to 10 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -20 && v <= 20)) throw new Error('Each value is an integer from -20 to 20.')
  if (!Number.isInteger(k) || k < 0 || k > nums.length) throw new Error('k is an integer from 0 to the array length.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const frames = []
  let best = null
  let bestWindow = null
  frames.push({ phase: 'start', activeLine: L('best is negative infinity'), pythonLine: P('best = None'), l: -1, r: -1, base: null, pairs: [], total: null, best, bestWindow, message: `Try every window; up to ${k} outside values may replace inside values.` })
  for (let l = 0; l < n; l++) {
    for (let r = l; r < n; r++) {
      const inside = nums.slice(l, r + 1)
      const outside = [...nums.slice(0, l), ...nums.slice(r + 1)]
      const base = inside.reduce((a, b) => a + b, 0)
      const lows = [...inside].sort((x, y) => x - y)
      const highs = [...outside].sort((x, y) => y - x)
      frames.push({ phase: 'window', activeLine: L('inside is the window'), pythonLine: P('inside = nums'), l, r, base, pairs: [], total: base, best, bestWindow, message: `Window ${l} to ${r} sums to ${base} before any swap.` })
      let total = base
      const pairs = []
      for (let t = 0; t < Math.min(k, lows.length, highs.length); t++) {
        if (highs[t] <= lows[t]) {
          frames.push({ phase: 'swap', activeLine: L('if the outside value is not larger'), pythonLine: P('if highs[t] <= lows[t]'), l, r, base, pairs: [...pairs], total, best, bestWindow, message: `Outside ${highs[t]} is not larger than inside ${lows[t]}; no more swaps help.` })
          break
        }
        total += highs[t] - lows[t]
        pairs.push([lows[t], highs[t]])
        frames.push({ phase: 'swap', activeLine: L('add outside minus inside to base'), pythonLine: P('total += highs[t] - lows[t]'), l, r, base, pairs: [...pairs], total, best, bestWindow, message: `Swap inside ${lows[t]} for outside ${highs[t]}, gaining ${highs[t] - lows[t]}.` })
      }
      if (best === null || total > best) {
        best = total
        bestWindow = [l, r]
      }
      frames.push({ phase: 'record', activeLine: L('best is the larger of best and base'), pythonLine: P('best = total'), l, r, base, pairs: [...pairs], total, best, bestWindow, message: `Window ${l} to ${r} reaches ${total}; best is now ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), l: -1, r: -1, base: null, pairs: [], total: null, best, bestWindow, message: `Largest achievable subarray sum is ${best}.` })
  return { input: { nums, k }, result: best, frames }
}
