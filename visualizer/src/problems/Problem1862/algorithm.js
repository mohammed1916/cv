const MOD = 1000000007
const MAX_VALUE = 100

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums must be an array of 1 to 20 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Each number must be an integer from 1 to ${MAX_VALUE}.`)
  return { nums }
}

export function buildTrace({ nums }) {
  const top = Math.max(...nums)
  const count = Array(top + 1).fill(0)
  for (const v of nums) count[v] += 1
  const prefix = Array(top + 1).fill(0)
  for (let v = 1; v <= top; v++) prefix[v] = prefix[v - 1] + count[v]
  const frames = [{ phase: 'start', activeLine: L('build prefix counts'), index: -1, total: 0, added: 0, message: 'Build prefix counts of the values, so a range of values can be counted at once.' }]
  let total = 0
  nums.forEach((d, index) => {
    let added = 0
    for (let k = 1; k * d <= top; k++) {
      const low = k * d
      const high = Math.min(top, (k + 1) * d - 1)
      added += k * (prefix[high] - prefix[low - 1])
    }
    total += added
    frames.push({ phase: 'divide', activeLine: L('add k times'), index, total: total % MOD, added, message: `Divide every number by ${d}. This denominator adds ${added} to the sum.` })
  })
  const result = total % MOD
  frames.push({ phase: 'done', activeLine: L('return total modulo'), index: -1, total: result, added: 0, message: `The sum of floored pairs is ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `sum of floor(a divided by b) over every ordered pair from the list
read the list of numbers from the input
build prefix counts of the values up to the largest number
set total to 0
for each denominator d in the list do
  for each multiple k times d up to the largest number do
    count the numbers in the range from k times d to k times d plus d minus 1
    add k times that count to total
return total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_floored_pairs(nums):
    MOD = 10 ** 9 + 7
    top = max(nums)
    count = [0] * (top + 1)
    for value in nums:
        count[value] += 1
    prefix = [0] * (top + 1)
    running = 0
    for v in range(top + 1):
        running += count[v]
        prefix[v] = running
    total = 0
    for d in nums:
        k = 1
        while k * d <= top:
            low = k * d
            high = min(top, (k + 1) * d - 1)
            total += k * (prefix[high] - prefix[low - 1])
            k += 1
    return total % MOD
`
