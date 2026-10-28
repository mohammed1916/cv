export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('Use an array of 1 to 20 integers.')
  if (nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000000000)) throw new Error('Values are integers within 1000000000 in absolute value.')
  return nums
}

const isPrime = i => {
  if (i < 2) return false
  for (let d = 2; d * d <= i; d++) if (i % d === 0) return false
  return true
}

export function buildTrace(nums) {
  let sumA = 0
  let sumB = 0
  const frames = [{ phase: 'start', activeLine: L('set sumA and sumB'), index: -1, sumA, sumB, message: 'Both groups start empty.' }]
  nums.forEach((v, i) => {
    if (isPrime(i)) {
      sumA += v
      frames.push({ phase: 'prime', activeLine: L('add nums at i to sumA'), index: i, sumA, sumB, message: `Index ${i} is prime: ${v} joins A (sum ${sumA}).` })
    } else {
      sumB += v
      frames.push({ phase: 'other', activeLine: L('add nums at i to sumB'), index: i, sumA, sumB, message: `Index ${i} is not prime: ${v} joins B (sum ${sumB}).` })
    }
  })
  const result = Math.abs(sumA - sumB)
  frames.push({ phase: 'done', activeLine: L('return the absolute'), index: -1, sumA, sumB, message: `|${sumA} - ${sumB}| = ${result}.` })
  return { input: nums, result, frames }
}

export const code = `split by prime indices (nums):
  set sumA and sumB to 0
  for each index i from 0 to the last index do
    if i is a prime number then
      add nums at i to sumA
    otherwise
      add nums at i to sumB
  return the absolute value of sumA minus sumB`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def split_difference(nums):
    def is_prime(i):
        if i < 2:
            return False
        d = 2
        while d * d <= i:
            if i % d == 0:
                return False
            d += 1
        return True

    sum_a = 0
    sum_b = 0
    for i, v in enumerate(nums):
        if is_prime(i):
            sum_a += v
        else:
            sum_b += v
    return abs(sum_a - sum_b)
`
