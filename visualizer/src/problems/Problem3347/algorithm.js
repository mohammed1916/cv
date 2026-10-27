export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Number.isInteger(obj.k) || !Number.isInteger(obj.numOperations)) {
    throw new Error('Use {"nums": [...], "k": integer, "numOperations": integer}.')
  }
  const n = obj.nums.length
  if (n < 1 || n > 10) throw new Error('Use 1 to 10 numbers.')
  if (obj.nums.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('Each number is an integer from 1 to 30.')
  if (obj.k < 0 || obj.k > 10) throw new Error('k is an integer from 0 to 10.')
  if (obj.numOperations < 0 || obj.numOperations > n) throw new Error('numOperations is an integer from 0 to the number of elements.')
  return { nums: obj.nums, k: obj.k, numOperations: obj.numOperations }
}

export function buildTrace(input) {
  const { nums, k, numOperations } = input
  const candidates = [...new Set(nums.flatMap(x => Array.from({ length: 2 * k + 1 }, (_, i) => x - k + i)))].sort((a, b) => a - b)
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('set candidates to'), value: null, eq: null, near: null, freq: null, best: 0, message: `Candidate targets are the values within ${k} of some number.` }]
  for (const v of candidates) {
    const eq = nums.filter(x => x === v).length
    const near = nums.filter(x => Math.abs(x - v) <= k).length
    const freq = eq + Math.min(numOperations, near - eq)
    best = Math.max(best, freq)
    frames.push({ phase: 'candidate', activeLine: L('set freq to'), value: v, eq, near, freq, best, message: `Target ${v}: ${eq} already equal, ${near} within ${k}, so frequency ${freq}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), value: null, eq: null, near: null, freq: null, best, message: `Maximum frequency: ${best}.` })
  return { input, candidates, result: best, frames }
}

export const code = `maximum frequency after at most numOperations changes:
  set candidates to every value within k of some number
  set best to 0
  for each candidate v:
    count eq, the numbers equal to v
    count near, the numbers within k of v
    set freq to eq + min(numOperations, near - eq)
    set best to the larger of best and freq
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_frequency(nums, k, numOperations):
    candidates = set()
    for x in nums:
        for d in range(-k, k + 1):
            candidates.add(x + d)
    best = 0
    for v in candidates:
        eq = sum(1 for x in nums if x == v)
        near = sum(1 for x in nums if abs(x - v) <= k)
        freq = eq + min(numOperations, near - eq)
        best = max(best, freq)
    return best
`
