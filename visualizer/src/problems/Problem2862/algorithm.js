export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be JSON, for example {"nums":[8,7,3,5,7,2,4,9]}.')
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object with a nums array.')
  const nums = data.nums
  if (nums.length < 1 || nums.length > 30) throw new Error('The visualization accepts 1 to 30 elements.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Each value must be an integer from 1 to 1000000000.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const frames = []
  const sums = new Map()
  const snapshot = () => [...sums.entries()].map(([key, sum]) => ({ key, sum }))
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, index: -1, key: null, groups: snapshot(), best: null, result: null, ...extra,
  })

  push('setup', 2, 2, 'Start with no groups. Indices with the same square-free part can be chosen together.')
  for (let i = 1; i <= nums.length; i++) {
    const value = nums[i - 1]
    push('scan', 3, 3, `Visit index ${i} with value ${value}.`, { index: i })
    let key = i
    let d = 2
    while (d * d <= key) {
      while (key % (d * d) === 0) {
        key /= d * d
        push('reduce', 4, 8, `Index ${i} has a square factor, so divide it out to get ${key}.`, { index: i, key })
      }
      d += 1
    }
    sums.set(key, (sums.get(key) ?? 0) + value)
    push('group', 5, 10, `Index ${i} joins group ${key}. Group sum is now ${sums.get(key)}.`, { index: i, key, groups: snapshot() })
  }
  const best = Math.max(...sums.values())
  push('done', 6, 11, `The best group sum is ${best}.`, { result: best, best, groups: snapshot() })
  return { input, result: best, frames }
}

export const code = `maximum element sum of a complete subset
  set sums to an empty table
  for each index i from 1 to n with value v
    reduce i by removing every square factor, giving key
    add v to sums[key]
  return the largest value in sums`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximumSum(nums):
    sums = {}
    for i, value in enumerate(nums, 1):
        key = i
        d = 2
        while d * d <= key:
            while key % (d * d) == 0:
                key //= d * d
            d += 1
        sums[key] = sums.get(key, 0) + value
    return max(sums.values())
`
