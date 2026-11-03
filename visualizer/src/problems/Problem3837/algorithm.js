export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 14) throw new Error('nums lists 1 to 14 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -50 && v <= 50)) throw new Error('Each value is an integer from -50 to 50.')
  if (!Number.isInteger(k) || k < 0 || k > 13) throw new Error('k is an integer from 0 to 13.')
  return { nums, k }
}

export const code = `delayed count of equal elements
  n = len(nums)
  result = array of n zeros
  counts = empty tally
  for i from n minus 1 down to 0
    j = i plus k plus 1
    if j is less than n then add nums[j] to counts
    result[i] = counts of nums[i]
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing pseudocode: ${s}`); return i + 1 }

export const python = `def delayed_equal_counts(nums, k):
    n = len(nums)
    result = [0] * n
    counts = {}
    for i in range(n - 1, -1, -1):
        j = i + k + 1
        if j < n:
            counts[nums[j]] = counts.get(nums[j], 0) + 1
        result[i] = counts.get(nums[i], 0)
    return result`
const PY = python.split('\n')
const Q = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing python: ${s}`); return i + 1 }

export function buildTrace({ nums, k }) {
  const n = nums.length
  const result = Array(n).fill(0)
  const counts = new Map()
  const frames = []
  const tallyList = () => [...counts.entries()].map(([v, c]) => [v, c])
  frames.push({ phase: 'start', i: null, j: null, added: null, window: null, result: [...result], counts: [], pythonLine: Q('result = [0] * n'), activeLine: L('result = array of n zeros'), message: `Sweep i from ${n - 1} down to 0; the delayed region is j at least i plus ${k + 1}.` })
  for (let i = n - 1; i >= 0; i--) {
    const j = i + k + 1
    let added = null
    if (j < n) {
      counts.set(nums[j], (counts.get(nums[j]) || 0) + 1)
      added = j
      frames.push({ phase: 'add', i, j, added, window: [Math.min(j, n), n - 1], result: [...result], counts: tallyList(), pythonLine: Q('counts[nums[j]] = counts.get'), activeLine: L('if j is less than n'), message: `Index ${j} enters the delayed region; ${nums[j]} now counts ${counts.get(nums[j])}.` })
    }
    result[i] = counts.get(nums[i]) || 0
    frames.push({ phase: 'count', i, j, added, window: j < n ? [j, n - 1] : null, result: [...result], counts: tallyList(), pythonLine: Q('result[i] = counts.get(nums[i]'), activeLine: L('result[i] = counts of nums[i]'), message: `Index ${i} (value ${nums[i]}) has ${result[i]} equal value${result[i] === 1 ? '' : 's'} at index ${i + k + 1} or later.` })
  }
  frames.push({ phase: 'done', i: null, j: null, added: null, window: null, result: [...result], counts: tallyList(), pythonLine: Q('return result'), activeLine: L('return result'), message: `Counts in index order: ${result.join(', ')}.` })
  return { input: { nums, k }, result, frames }
}
