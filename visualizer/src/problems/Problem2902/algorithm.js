export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Number.isInteger(obj.l) || !Number.isInteger(obj.r)) {
    throw new Error('Use {"nums": [...], "l": integer, "r": integer}.')
  }
  if (obj.nums.length < 1 || obj.nums.length > 8) throw new Error('Use 1 to 8 numbers.')
  if (obj.nums.some(v => !Number.isInteger(v) || v < 0 || v > 9)) throw new Error('Each number is an integer from 0 to 9.')
  if (obj.l < 0 || obj.r > 40 || obj.l > obj.r) throw new Error('Use 0 <= l <= r <= 40.')
  return { nums: obj.nums, l: obj.l, r: obj.r }
}

export function buildTrace(input) {
  const MOD = 1000000007
  const { nums, l, r } = input
  const zeros = nums.filter(v => v === 0).length
  const counts = new Map()
  for (const v of nums) if (v > 0) counts.set(v, (counts.get(v) || 0) + 1)
  const total = nums.reduce((a, b) => a + b, 0)
  let ways = Array(total + 1).fill(0)
  ways[0] = 1
  const frames = [{ phase: 'start', activeLine: L('set zeros to'), value: null, copies: null, ways: ways.slice(), answer: null, message: `Zeros add a free factor of ${zeros + 1}. Other values pick how many copies to use.` }]
  for (const [v, c] of counts) {
    const next = Array(total + 1).fill(0)
    for (let s = 0; s <= total; s++) {
      if (!ways[s]) continue
      for (let t = 0; t <= c; t++) {
        if (s + t * v <= total) next[s + t * v] = (next[s + t * v] + ways[s]) % MOD
      }
    }
    ways = next
    frames.push({ phase: 'value', activeLine: L('set ways to next'), value: v, copies: c, ways: ways.slice(), answer: null, message: `Value ${v} can appear 0 to ${c} times; sums are updated.` })
  }
  let answer = 0
  for (let s = l; s <= Math.min(r, total); s++) answer = (answer + ways[s]) % MOD
  answer = (answer * (zeros + 1)) % MOD
  frames.push({ phase: 'done', activeLine: L('return answer'), value: null, copies: null, ways: ways.slice(), answer, message: `Sub-multisets with sum in [${l}, ${r}]: ${answer}.` })
  return { input, result: answer, frames }
}

export const code = `count sub-multisets whose sum is between l and r:
  set zeros to the count of 0s in nums
  set total to the sum of nums
  set ways[0] to 1 and every other sum to 0
  for each distinct value v above 0 with count c:
    set next to zeros for every sum
    for each sum s and each copy count t from 0 to c:
      add ways[s] into next[s + t * v] when it fits
    set ways to next
  set answer to the sum of ways[s] for s from l to r
  return answer times (zeros + 1) modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_sub_multisets(nums, l, r):
    MOD = 1000000007
    counts = {}
    for v in nums:
        counts[v] = counts.get(v, 0) + 1
    zeros = counts.pop(0, 0)
    total = sum(nums)
    ways = [0] * (total + 1)
    ways[0] = 1
    for v, c in counts.items():
        nxt = [0] * (total + 1)
        for s in range(total + 1):
            if ways[s]:
                for t in range(c + 1):
                    if s + t * v <= total:
                        nxt[s + t * v] = (nxt[s + t * v] + ways[s]) % MOD
        ways = nxt
    answer = sum(ways[s] for s in range(l, min(r, total) + 1)) % MOD
    return answer * (zeros + 1) % MOD
`
