export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, such as {"nums":[1,2,3]}.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must hold 1 to 12 entries.')
  const sorted = [...nums].sort((a, b) => a - b)
  if (sorted.some((v, i) => v !== i + 1)) throw new Error('nums must be a permutation of the integers 1 to n.')
  return { nums }
}

export const code = `count unique XOR triplet values for a permutation of 1 to n
  let n be the length of nums
  if n is at most 2 then return n
  set power to 1
  while twice power is at most n
    double power
  return twice power`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = [{ phase: 'size', activeLine: L('let n be the length'), n, power: 0, message: `nums has ${n} entries.` }]
  if (n <= 2) {
    frames.push({ phase: 'done', activeLine: L('if n is at most 2'), n, power: 0, message: `With ${n} entries the count is ${n}.` })
    return { input: { nums }, result: n, frames }
  }
  let power = 1
  frames.push({ phase: 'grow', activeLine: L('set power to 1'), n, power, message: 'The largest power of two at most n is found by doubling.' })
  while (power * 2 <= n) {
    power *= 2
    frames.push({ phase: 'grow', activeLine: L('double power'), n, power, message: `Doubled to ${power}, which is still at most ${n}.` })
  }
  const result = 2 * power
  frames.push({ phase: 'done', activeLine: L('return twice power'), n, power, message: `The count is twice ${power}, which is ${result}.` })
  return { input: { nums }, result, frames }
}

export const python = `def count_unique_xor_triplets_i(nums):
    n = len(nums)
    if n <= 2:
        return n
    power = 1
    while power * 2 <= n:
        power *= 2
    return 2 * power
`
