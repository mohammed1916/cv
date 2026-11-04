export const phases = [
  { id: 'start', label: 'Empty tally', description: 'Start with no counts.' },
  { id: 'tally', label: 'Tally arrays', description: 'Add one to each value an array contains.' },
  { id: 'select', label: 'Keep all', description: 'Keep values whose count equals the number of arrays.' },
  { id: 'done', label: 'Sort', description: 'Return the kept values in ascending order.' },
]

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
  const frames = [{ phase: 'start', pythonLine: 2, activeLine: L('const counts = new Map()'), array: -1, counts: {}, kept: [], message: `Count in how many of the ${nums.length} arrays each value appears.` }]
  nums.forEach((arr, a) => {
    for (const v of arr) counts.set(v, (counts.get(v) || 0) + 1)
    frames.push({ phase: 'tally', pythonLine: 5, activeLine: L('counts.set(value'), array: a, counts: Object.fromEntries(counts), kept: [], message: `Array ${a} is tallied.` })
  })
  const kept = [...counts.keys()].filter(v => counts.get(v) === nums.length).sort((x, y) => x - y)
  frames.push({ phase: 'select', pythonLine: 6, activeLine: L('const kept ='), array: -1, counts: Object.fromEntries(counts), kept, message: `Values in all ${nums.length} arrays: ${kept.join(', ') || 'none'}.` })
  frames.push({ phase: 'done', pythonLine: 7, activeLine: L('return kept'), array: -1, counts: Object.fromEntries(counts), kept, message: `Intersection: [${kept.join(', ')}].` })
  return { input: nums, result: kept, frames }
}

export const code = `function intersection(nums) {
  const counts = new Map()
  for (const arr of nums) {
    for (const value of arr) counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  const kept = [...counts.keys()].filter(v => counts.get(v) === nums.length)
  return kept.sort((a, b) => a - b)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const line = code.findIndex(c => c.text.includes(s)) + 1
  if (line < 1) throw new Error(`Missing code line: ${s}`)
  return line
}

export const python = `def intersection(nums):
    counts = {}
    for arr in nums:
        for value in arr:
            counts[value] = counts.get(value, 0) + 1
    keep = [v for v, c in counts.items() if c == len(nums)]
    return sorted(keep)
`
