export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || data.nums.length < 2 || data.nums.length > 30) throw new Error('Use an array nums of 2 to 30 integers.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > 999999999)) throw new Error('Values are positive integers up to 999999999.')
  if (new Set(data.nums.map(v => String(v).length)).size !== 1) throw new Error('All numbers must have the same number of digits.')
  return { nums: data.nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const digits = String(nums[0]).length
  const pairs = n * (n - 1) / 2
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('find the number of digits'), position: -1, counts: [], differ: 0, total: 0, message: `Each number has ${digits} digit(s). Compare each digit column.` }]
  for (let pos = 0; pos < digits; pos++) {
    const counts = Array(10).fill(0)
    for (const x of nums) counts[Number(String(x)[digits - 1 - pos])]++
    const same = counts.reduce((sum, c) => sum + c * (c - 1) / 2, 0)
    const differ = pairs - same
    total += differ
    frames.push({ phase: 'position', activeLine: L('count how many numbers have each digit'), position: pos, counts: counts.map((c, d) => [d, c]).filter(([, c]) => c > 0), differ, total, message: `Column ${pos} (from the right): ${differ} pair(s) have different digits.` })
    frames.push({ phase: 'add', activeLine: L('add the pairs that differ'), position: pos, counts: counts.map((c, d) => [d, c]).filter(([, c]) => c > 0), differ, total, message: `Add ${differ} to the total, which is now ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), position: -1, counts: [], differ: 0, total, result: total, message: `Sum of digit differences: ${total}.` })
  return { input: { nums }, result: total, frames }
}

export const code = `sum of digit differences over all pairs
  find the number of digits in the first number
  set total to zero
  for each digit position from the right
    count how many numbers have each digit at this position
    add the pairs that differ at this position to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_digit_differences(nums):
    n = len(nums)
    digits = len(str(nums[0]))
    total = 0
    for pos in range(digits):
        counts = [0] * 10
        for x in nums:
            counts[(x // 10 ** pos) % 10] += 1
        same = sum(c * (c - 1) // 2 for c in counts)
        total += n * (n - 1) // 2 - same
    return total
`
