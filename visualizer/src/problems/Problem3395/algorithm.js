const MOD = 1000000007
const MAX_LENGTH = 12
const MAX_VALUE = 100

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 5 || arr.length > MAX_LENGTH) throw new Error(`Use an array of 5 to ${MAX_LENGTH} integers.`)
  if (arr.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return arr
}

export const code = `count subsequences with a unique middle mode(nums)
  set total to 0
  for each middle position m from the third position to the third from last
    for each pair of positions i and j before m
      for each pair of positions k and q after m
        collect the five values in order
        count how many times each value appears among them
        if the middle value appears more often than every other value
          add 1 to total
  return total, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(nums) {
  const n = nums.length
  let total = 0
  const frames = [{ phase: 'start', middle: -1, picked: [], total: 0, activeLine: L('set total to 0'), message: 'Look for 5-element subsequences whose middle value is the one value that appears most often.' }]
  for (let m = 2; m <= n - 3; m++) {
    frames.push({ phase: 'middle', middle: m, picked: [], total, activeLine: L('for each middle position'), message: `Middle at position ${m} (value ${nums[m]}). Try each pair before it and each pair after it.` })
    for (let i = 0; i < m; i++) {
      for (let j = i + 1; j < m; j++) {
        for (let k = m + 1; k < n; k++) {
          for (let q = k + 1; q < n; q++) {
            const seq = [nums[i], nums[j], nums[m], nums[k], nums[q]]
            const freq = new Map()
            for (const v of seq) freq.set(v, (freq.get(v) ?? 0) + 1)
            const mid = nums[m]
            const midCount = freq.get(mid)
            const unique = [...freq].every(([v, c]) => v === mid || c < midCount)
            if (unique) {
              total = (total + 1) % MOD
              frames.push({ phase: 'count', middle: m, picked: [i, j, m, k, q], total, activeLine: L('if the middle value'), message: `Positions ${i}, ${j}, ${m}, ${k}, ${q} have ${mid} as their unique most frequent value. Total: ${total}.` })
            }
          }
        }
      }
    }
  }
  frames.push({ phase: 'done', middle: -1, picked: [], total, activeLine: L('return total'), message: `Subsequences with a unique middle mode: ${total}.` })
  return { input: nums, result: total, frames }
}

export const python = `def count_unique_middle_mode(nums):
    MOD = 1000000007
    n = len(nums)
    total = 0
    for m in range(2, n - 2):
        for i in range(m):
            for j in range(i + 1, m):
                for k in range(m + 1, n):
                    for q in range(k + 1, n):
                        seq = [nums[i], nums[j], nums[m], nums[k], nums[q]]
                        freq = {}
                        for v in seq:
                            freq[v] = freq.get(v, 0) + 1
                        mid = nums[m]
                        if all(v == mid or c < freq[mid] for v, c in freq.items()):
                            total = (total + 1) % MOD
    return total
`
