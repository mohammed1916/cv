export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Number.isInteger(obj.k)) throw new Error('Use {"nums": [...], "k": integer}.')
  if (obj.nums.length < 1 || obj.nums.length > 10) throw new Error('Use 1 to 10 numbers.')
  if (obj.nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each number is an integer from 1 to 10.')
  if (obj.k < 1 || obj.k > 12) throw new Error('k is an integer from 1 to 12.')
  return { nums: obj.nums, k: obj.k }
}

export function buildTrace(input) {
  const MOD = 1000000007
  const { nums, k } = input
  const total = nums.reduce((a, b) => a + b, 0)
  const frames = [{ phase: 'start', activeLine: L('set total to the sum'), total, ways: [], answer: null, item: null, message: `Total sum is ${total}.` }]
  if (total < 2 * k) {
    frames.push({ phase: 'done', activeLine: L('if total < 2'), total, ways: [], answer: 0, item: null, message: `Total ${total} is below 2k = ${2 * k}, so no partition has both sums at least ${k}.` })
    return { input, result: 0, frames }
  }
  const ways = Array(total + 1).fill(0)
  ways[0] = 1
  nums.forEach((x, i) => {
    for (let s = total; s >= x; s--) ways[s] = (ways[s] + ways[s - x]) % MOD
    frames.push({ phase: 'item', activeLine: L('add ways[s - x]'), total, ways: ways.slice(), answer: null, item: i, message: `Add number ${x}: subsets now reach each sum in the table.` })
  })
  let answer = 0
  for (let s = k; s <= total - k; s++) answer = (answer + ways[s]) % MOD
  frames.push({ phase: 'done', activeLine: L('return answer'), total, ways: ways.slice(), answer, item: null, message: `Subsets with sum in [${k}, ${total - k}] give ${answer} ordered partitions.` })
  return { input, result: answer, frames }
}

export const code = `count ordered partitions whose two sums are both at least k:
  set total to the sum of nums
  if total < 2 * k then
    return 0
  set ways[0] to 1 and every other entry to 0
  for each number x in nums:
    for s from total down to x:
      add ways[s - x] into ways[s]
  set answer to the sum of ways[s] for s from k to total - k
  return answer modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_great_partitions(nums, k):
    MOD = 1000000007
    total = sum(nums)
    if total < 2 * k:
        return 0
    ways = [0] * (total + 1)
    ways[0] = 1
    for x in nums:
        for s in range(total, x - 1, -1):
            ways[s] = (ways[s] + ways[s - x]) % MOD
    answer = 0
    for s in range(k, total - k + 1):
        answer = (answer + ways[s]) % MOD
    return answer
`
