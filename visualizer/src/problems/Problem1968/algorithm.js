// LeetCode 1968: sort, then alternate the lower half and the upper half. Each low value is smaller than both neighbours and each high value larger than both, so no value equals its neighbours' average.
const SOURCE = [
  "function rearrangeArray(nums) {",
  "  const sorted = [...nums].sort((a, b) => a - b)",
  "  const n = sorted.length",
  "  const half = Math.ceil(n / 2)",
  "  const ans = []",
  "  for (let i = 0; 2 * i < n; i++) {",
  "    ans.push(sorted[i])",
  "    if (2 * i + 1 < n) ans.push(sorted[half + i])",
  "  }",
  "  return ans",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def rearrange_array(nums):
    ordered = sorted(nums)
    n = len(ordered)
    half = (n + 1) // 2
    ans = []
    i = 0
    while 2 * i < n:
        ans.append(ordered[i])
        if 2 * i + 1 < n:
            ans.append(ordered[half + i])
        i += 1
    return ans
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'split', label: 'Split halves', description: 'Sort, then split into lower and upper halves.' },
  { id: 'weave', label: 'Interleave', description: 'Alternate one lower value and one upper value.' },
  { id: 'done', label: 'Result', description: 'Rearranged array.' },
]

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Enter a JSON array of distinct integers, for example [1,2,3,4].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100000) || new Set(nums).size !== nums.length) throw new Error('Use 1 to 12 distinct integers.')
  return { nums }
}

export function buildTrace({ nums }) {
  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length
  const half = Math.ceil(n / 2)
  const frames = [{ phase: 'split', activeLine: L('const sorted ='), pythonLine: P('ordered = sorted'), message: `Sorted: ${sorted.join(', ')}. Lower half: ${sorted.slice(0, half).join(', ')}; upper half: ${sorted.slice(half).join(', ') || 'none'}.`, sorted, half, ans: [] }]
  const ans = []
  for (let i = 0; 2 * i < n; i++) {
    ans.push(sorted[i])
    frames.push({ phase: 'weave', activeLine: L('ans.push(sorted[i])'), pythonLine: P('ans.append(ordered[i])'), message: `Take lower value ${sorted[i]}.`, sorted, half, ans: [...ans], low: i, high: -1 })
    if (2 * i + 1 < n) {
      ans.push(sorted[half + i])
      frames.push({ phase: 'weave', activeLine: L('ans.push(sorted[half + i])'), pythonLine: P('ans.append(ordered[half + i])'), message: `Take upper value ${sorted[half + i]}.`, sorted, half, ans: [...ans], low: i, high: half + i })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return ans'), pythonLine: P('return ans'), message: `Rearranged: ${ans.join(', ')}.`, sorted, half, ans: [...ans], low: -1, high: -1, result: ans })
  return { input: { nums }, result: ans, frames }
}
