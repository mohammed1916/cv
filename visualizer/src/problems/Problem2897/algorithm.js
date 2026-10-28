export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.nums) || !Number.isInteger(obj.k)) throw new Error('Use an object with an array key nums and an integer key k.')
  const { nums, k } = obj
  if (nums.length < 1 || nums.length > 6) throw new Error('nums has 1 to 6 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 255)) throw new Error('nums entries are integers from 0 to 255.')
  if (k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums, k }
}

const MOD = 1000000007

export function buildTrace(input) {
  const { nums, k } = input
  const count = Array(8).fill(0)
  for (const v of nums) for (let b = 0; b < 8; b++) if ((v >> b) & 1) count[b] += 1
  const frames = [{ phase: 'count', activeLine: L('set count to'), index: -1, counts: [...count], total: 0, message: `Bit counts across all values: ${count.join(', ')} (bit 0 first).` }]
  let total = 0
  for (let round = 0; round < k; round++) {
    let value = 0
    for (let b = 0; b < 8; b++) {
      if (count[b] > 0) { value |= 1 << b; count[b] -= 1 }
    }
    total += value * value
    frames.push({ phase: 'pack', activeLine: L('if count of that bit'), index: round, counts: [...count], total: total % MOD, value, message: `Pack number ${round + 1} with value ${value}, squared adds ${value * value}.` })
  }
  const result = total % MOD
  frames.push({ phase: 'done', activeLine: L('return total modulo'), index: -1, counts: [...count], total: result, value: null, message: `Maximum sum of squares: ${result}.` })
  return { input, nums, result, frames }
}

export const code = `maximize the sum of squares of k chosen values
  set count to the number of values that have each bit set
  set total to 0
  repeat k times
    set value to 0
    for each bit from low to high
      if count of that bit is above 0 then
        set that bit in value
        subtract 1 from count of that bit
    add value times value to total
  return total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_sum_of_squares(nums, k):
    count = [0] * 8
    for v in nums:
        for b in range(8):
            if (v >> b) & 1:
                count[b] += 1
    total = 0
    for _ in range(k):
        value = 0
        for b in range(8):
            if count[b] > 0:
                value |= 1 << b
                count[b] -= 1
        total += value * value
    return total % 1000000007
`
