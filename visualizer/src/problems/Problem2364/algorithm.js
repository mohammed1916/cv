const MAX_LENGTH = 12
const MAX_VALUE = 20

export function parseInput(text) {
  const data = JSON.parse(text)
  const nums = data?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`nums must list 1 to ${MAX_LENGTH} integers.`)
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > MAX_VALUE)) throw new Error(`Values are integers from 0 to ${MAX_VALUE}.`)
  return { nums }
}

export const code = `count bad pairs(nums):
  set counts to an empty table of how often each key appeared
  set good to 0
  for each index i in order:
    set key to nums[i] minus i
    add counts[key] to good, since earlier indices with the same key form good pairs
    add one to counts[key]
  return the number of pairs n(n-1)/2 minus good`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums }) {
  const counts = new Map()
  let good = 0
  const frames = [{ phase: 'start', activeLine: L('set counts to'), index: -1, key: null, good: 0, message: 'A pair (i, j) is good when nums[j] minus nums[i] equals j minus i.' }]
  nums.forEach((value, i) => {
    const key = value - i
    const before = counts.get(key) ?? 0
    good += before
    counts.set(key, before + 1)
    frames.push({ phase: 'index', activeLine: L('add counts[key] to good'), index: i, key, good, message: `Index ${i}: key ${key}. ${before} earlier index(es) share it, so good pairs rise to ${good}.` })
  })
  const n = nums.length
  const result = (n * (n - 1)) / 2 - good
  frames.push({ phase: 'done', activeLine: L('return the number of pairs'), index: nums.length, key: null, good, message: `${n * (n - 1) / 2} pairs in total minus ${good} good pairs leaves ${result} bad pairs.` })
  return { input: { nums }, nums, result, frames }
}

export const python = `def count_bad_pairs(nums):
    counts = {}
    good = 0
    for i, value in enumerate(nums):
        key = value - i
        good += counts.get(key, 0)
        counts[key] = counts.get(key, 0) + 1
    n = len(nums)
    return n * (n - 1) // 2 - good
`
