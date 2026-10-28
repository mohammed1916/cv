const MOD = 1000000007

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use an array of 1 to 12 integers in this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 70000)) throw new Error('Values are integers from 1 to 70000.')
  return nums
}

const gcd = (a, b) => { while (b) { [a, b] = [b, a % b] } return a }

export function buildTrace(nums) {
  const ends = []
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), index: -1, total: 0, message: 'No subsequence counted yet.' }]
  nums.forEach((x, i) => {
    const cur = new Map([[x, 1]])
    for (let j = 0; j < i; j++) {
      if (nums[j] >= x) continue
      for (const [g, c] of ends[j]) {
        const ng = gcd(g, x)
        cur.set(ng, ((cur.get(ng) ?? 0) + c) % MOD)
      }
    }
    ends.push(cur)
    for (const [g, c] of cur) total = (total + g * c) % MOD
    frames.push({ phase: 'end', activeLine: L('for each index i'), index: i, total, message: `Subsequences ending at ${x}: ${cur.size} distinct GCDs. Total ${total}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, total, message: `Answer: ${total}.` })
  return { input: nums, result: total, frames }
}

export const code = `sum of beautiful subsequences (nums):
  set total to 0
  for each index i in order do
    start a map from GCD to count with nums at i alone
    for each earlier index j with nums at j less than nums at i do
      for each GCD g with count c in the map at j do
        add c to the count for gcd(g, nums at i) in the map at i
    add g times c for every entry of the map at i to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import gcd


def sum_beautiful_subsequences(nums):
    MOD = 10**9 + 7
    ends = []
    total = 0
    for i, x in enumerate(nums):
        cur = {x: 1}
        for j in range(i):
            if nums[j] >= x:
                continue
            for g, c in ends[j].items():
                ng = gcd(g, x)
                cur[ng] = (cur.get(ng, 0) + c) % MOD
        ends.append(cur)
        for g, c in cur.items():
            total = (total + g * c) % MOD
    return total
`
