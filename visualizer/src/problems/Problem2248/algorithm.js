export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6) throw new Error('Use between 1 and 6 arrays.')
  nums.forEach(arr => {
    if (!Array.isArray(arr) || arr.length < 1 || arr.length > 8) throw new Error('Each array has 1 to 8 integers.')
    if (new Set(arr).size !== arr.length) throw new Error('Each array holds distinct integers.')
    if (arr.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Values are integers from 1 to 50.')
  })
  return nums
}

export function buildTrace(nums) {
  const counts = new Map()
  const frames = [{ phase: 'start', activeLine: L('set counts to an empty map'), array: -1, counts: {}, kept: [], message: `Count in how many of the ${nums.length} arrays each value appears.` }]
  nums.forEach((arr, a) => {
    for (const v of arr) counts.set(v, (counts.get(v) || 0) + 1)
    frames.push({ phase: 'tally', activeLine: L('add one to its count'), array: a, counts: Object.fromEntries(counts), kept: [], message: `Array ${a} is tallied.` })
  })
  const kept = [...counts.keys()].filter(v => counts.get(v) === nums.length).sort((x, y) => x - y)
  frames.push({ phase: 'select', activeLine: L('keep the values whose count'), array: -1, counts: Object.fromEntries(counts), kept, message: `Values in all ${nums.length} arrays: ${kept.join(', ') || 'none'}.` })
  frames.push({ phase: 'done', activeLine: L('return the sorted values'), array: -1, counts: Object.fromEntries(counts), kept, message: `Intersection: [${kept.join(', ')}].` })
  return { input: nums, result: kept, frames }
}

export const code = `intersection of multiple arrays:
  set counts to an empty map
  for each array in nums
    for each value in the array, add one to its count
  keep the values whose count equals the number of arrays
  sort the kept values in ascending order
  return the sorted values`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def intersection(nums):
    counts = {}
    for arr in nums:
        for value in arr:
            counts[value] = counts.get(value, 0) + 1
    keep = [v for v, c in counts.items() if c == len(nums)]
    return sorted(keep)
`
