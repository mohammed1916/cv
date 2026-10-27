export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums (an array) and k.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums needs 1 to 10 house values.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Each house value is an integer from 1 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > Math.ceil(nums.length / 2)) throw new Error('k is an integer from 1 to ceil(number of houses / 2).')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  // Greedy for a capability cap: rob a house within the cap, then skip its neighbour.
  const pick = cap => {
    const taken = []
    for (let i = 0; i < nums.length;) {
      if (nums[i] <= cap) {
        taken.push(i)
        i += 2
      } else i++
    }
    return taken
  }
  let lo = Math.min(...nums)
  let hi = Math.max(...nums)
  const domain = [lo, hi]
  const frames = [{ phase: 'start', activeLine: L('set low to the smallest'), lo, hi, mid: null, verdict: null, picked: [], message: `Capability must lie between ${lo} and ${hi}.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const picked = pick(mid)
    const verdict = picked.length >= k
    frames.push({ phase: 'probe', activeLine: L('if we can rob at least k houses'), lo, hi, mid, verdict, picked, message: `Capability ${mid}: the greedy walk robs ${picked.length} houses, ${verdict ? 'enough' : 'not enough'} for k = ${k}.` })
    if (verdict) hi = mid
    else lo = mid + 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: null, picked: pick(lo), message: `Minimum capability: ${lo}.` })
  return { input: { nums, k }, sorted: nums, domain, result: lo, frames }
}

export const code = `minimum capability to rob at least k houses with no two adjacent
  set low to the smallest house value and high to the largest
  while low is less than high
    set mid to the middle value, rounded down
    if we can rob at least k houses with every value at most mid then
      set high to mid
    else
      set low to mid plus 1
  return low

robbery count for a capability cap
  start at the first house
  when the house value is at most cap, rob it and skip the next house
  otherwise move on to the next house
  return the number of houses robbed`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_capability(nums, k):
    def robbery_count(cap):
        count = 0
        i = 0
        while i < len(nums):
            if nums[i] <= cap:
                count += 1
                i += 2
            else:
                i += 1
        return count

    low, high = min(nums), max(nums)
    while low < high:
        mid = (low + high) // 2
        if robbery_count(mid) >= k:
            high = mid
        else:
            low = mid + 1
    return low
`
