export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums (an array).')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('nums needs 1 to 8 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 10)) throw new Error('Each number is an integer from 0 to 10.')
  return { nums }
}

export function buildTrace({ nums }) {
  // Moving one unit left never helps a later prefix, so the best maximum is the least x whose prefix averages all fit.
  const firstBreak = limit => {
    let total = 0
    for (let i = 0; i < nums.length; i++) {
      total += nums[i]
      if (total > limit * (i + 1)) return i
    }
    return -1
  }
  let lo = 0
  let hi = Math.max(...nums)
  const domain = [lo, hi]
  const frames = [{ phase: 'start', activeLine: L('set low to 0'), lo, hi, mid: null, verdict: null, broke: -1, message: `Values are ${nums.join(', ')}. The answer lies between ${lo} and ${hi}.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const broke = firstBreak(mid)
    const verdict = broke === -1
    frames.push({ phase: 'probe', activeLine: L('if every prefix fits within mid'), lo, hi, mid, verdict, broke, message: verdict ? `Limit ${mid}: every prefix average fits.` : `Limit ${mid}: the prefix ending at index ${broke} is too large.` })
    if (verdict) hi = mid
    else lo = mid + 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: null, broke: -1, message: `Smallest possible maximum: ${lo}.` })
  return { input: { nums }, domain, result: lo, frames }
}

export const code = `smallest possible maximum value of the array after the moves
  set low to 0 and high to the largest value
  while low is less than high
    set mid to the middle value, rounded down
    if every prefix fits within mid then
      set high to mid
    else
      set low to mid plus 1
  return low

check a limit
  keep a running total of the values from the start
  if the total is more than the limit times the number of values so far then
    report that the limit fails
  otherwise continue to the next value
  report that the limit holds when every prefix passes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimize_maximum(nums):
    def fits(limit):
        total = 0
        for i, value in enumerate(nums):
            total += value
            if total > limit * (i + 1):
                return False
        return True

    low, high = 0, max(nums)
    while low < high:
        mid = (low + high) // 2
        if fits(mid):
            high = mid
        else:
            low = mid + 1
    return low
`
