export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums (an array) and p.')
  const { nums, p } = data
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 10) throw new Error('nums needs 2 to 10 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 30)) throw new Error('Each number is an integer from 0 to 30.')
  if (!Number.isInteger(p) || p < 0 || p > Math.floor(nums.length / 2)) throw new Error('p is an integer from 0 to half the length, rounded down.')
  return { nums, p }
}

export function buildTrace({ nums, p }) {
  const sorted = [...nums].sort((a, b) => a - b)
  // Greedy: walk the sorted numbers and pair neighbours whose gap is within the limit.
  const pairsFor = limit => {
    const pairs = []
    for (let i = 0; i + 1 < sorted.length;) {
      if (sorted[i + 1] - sorted[i] <= limit) {
        pairs.push([i, i + 1])
        i += 2
      } else i++
    }
    return pairs
  }
  let lo = 0
  let hi = sorted[sorted.length - 1] - sorted[0]
  const domain = [lo, hi]
  const frames = [{ phase: 'start', activeLine: L('sort the numbers'), lo, hi, mid: null, verdict: null, picked: [], message: `Sorted numbers: ${sorted.join(', ')}. The answer lies between ${lo} and ${hi}.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const pairs = pairsFor(mid)
    const verdict = pairs.length >= p
    frames.push({ phase: 'probe', activeLine: L('if the greedy pairs reach p'), lo, hi, mid, verdict, picked: pairs.flat(), message: `Limit ${mid}: greedy finds ${pairs.length} pairs, ${verdict ? 'enough' : 'too few'} for p = ${p}.` })
    if (verdict) hi = mid
    else lo = mid + 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: null, picked: pairsFor(lo).flat(), message: `Smallest possible largest difference: ${lo}.` })
  return { input: { nums, p }, sorted, domain, result: lo, frames }
}

export const code = `minimum possible largest difference among p disjoint pairs
  sort the numbers
  set low to 0 and high to the largest number minus the smallest
  while low is less than high
    set mid to the middle value, rounded down
    if the greedy pairs reach p for limit mid then
      set high to mid
    else
      set low to mid plus 1
  return low

greedy pair count for a limit
  start at the first number
  when the next number is within the limit, pair the two and move past both
  otherwise move on to the next number
  return the number of pairs`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_max_pair_difference(nums, p):
    values = sorted(nums)

    def pair_count(limit):
        pairs = 0
        i = 0
        while i + 1 < len(values):
            if values[i + 1] - values[i] <= limit:
                pairs += 1
                i += 2
            else:
                i += 1
        return pairs

    low, high = 0, values[-1] - values[0]
    while low < high:
        mid = (low + high) // 2
        if pair_count(mid) >= p:
            high = mid
        else:
            low = mid + 1
    return low
`
