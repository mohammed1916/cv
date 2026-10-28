export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use a JSON object with a "nums" array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 30) throw new Error('nums must have 1 to 30 entries for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Each value must be an integer from 1 to 1000000000.')
  return { nums }
}

const gcd = (a, b) => { while (b) { [a, b] = [b, a % b] } return a }

export function buildTrace({ nums }) {
  const frames = []
  let prefixMax = 0
  const prefixGcd = []
  frames.push({ phase: 'start', activeLine: L('set prefixMax to 0'), sorted: [], pair: null, total: null, result: null, message: 'Build prefixGcd: gcd of each value with the largest value so far.' })
  for (let i = 0; i < nums.length; i++) {
    prefixMax = Math.max(prefixMax, nums[i])
    prefixGcd.push(gcd(nums[i], prefixMax))
    frames.push({ phase: 'prefix', activeLine: L('append gcd'), sorted: [...prefixGcd], pair: null, total: null, result: null, message: `Index ${i}: gcd(${nums[i]}, max ${prefixMax}) = ${prefixGcd[i]}.` })
  }
  const sorted = [...prefixGcd].sort((a, b) => a - b)
  frames.push({ phase: 'sort', activeLine: L('sort prefixGcd'), sorted: [...sorted], pair: null, total: 0, result: null, message: `Sorted prefixGcd: [${sorted.join(', ')}].` })
  let total = 0
  for (let i = 0, j = sorted.length - 1; i < j; i++, j--) {
    const g = gcd(sorted[i], sorted[j])
    total += g
    frames.push({ phase: 'pair', activeLine: L('add gcd'), sorted: [...sorted], pair: [i, j], total, result: null, message: `Pair ${sorted[i]} with ${sorted[j]}: gcd ${g}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), sorted: [...sorted], pair: null, total, result: total, message: `Sum of pair GCDs: ${total}.` })
  return { input: { nums }, result: total, frames }
}

export const code = `sum of gcd of formed pairs (nums):
  set prefixMax to 0
  set prefixGcd to an empty list
  for each value v in nums, in order
    set prefixMax to the larger of prefixMax and v
    append gcd of v and prefixMax to prefixGcd
  sort prefixGcd in ascending order
  set total to 0
  pair the smallest with the largest, then move inward
    add gcd of each pair to total
  return total

an odd-length list leaves its middle value unpaired`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_gcd_formed_pairs(nums):
    prefix_max = 0
    prefix_gcd = []
    for v in nums:
        prefix_max = max(prefix_max, v)
        a, b = v, prefix_max
        while b:
            a, b = b, a % b
        prefix_gcd.append(a)
    prefix_gcd.sort()
    total = 0
    i, j = 0, len(prefix_gcd) - 1
    while i < j:
        a, b = prefix_gcd[i], prefix_gcd[j]
        while b:
            a, b = b, a % b
        total += a
        i += 1
        j -= 1
    return total
`
