// LeetCode 1920: ans[i] = nums[nums[i]] for a zero-based permutation.
const SOURCE = [
  "function buildArray(nums) {",
  "  const ans = new Array(nums.length)",
  "  for (let i = 0; i < nums.length; i++) ans[i] = nums[nums[i]]",
  "  return ans",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def build_array(nums):
    ans = [0] * len(nums)
    for i in range(len(nums)):
        ans[i] = nums[nums[i]]
    return ans
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'lookup', label: 'Look up', description: 'Follow nums[i] to the position it names.' },
  { id: 'done', label: 'Result', description: 'Every position has been filled.' },
]

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Enter a JSON permutation, for example [3,0,1,2].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 values for the visualization.')
  const seen = new Set(nums)
  if (seen.size !== nums.length || !nums.every(v => Number.isInteger(v) && v >= 0 && v < nums.length)) throw new Error('Values must be a permutation of 0 to length - 1.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const ans = new Array(nums.length).fill(null)
  nums.forEach((_, i) => {
    ans[i] = nums[nums[i]]
    frames.push({ phase: 'lookup', activeLine: L('ans[i] = nums[nums[i]]'), pythonLine: P('ans[i] = nums'), message: `Position ${i} reads nums[${nums[i]}] = ${ans[i]}.`, i, target: nums[i], ans: [...ans] })
  })
  frames.push({ phase: 'done', activeLine: L('return ans'), pythonLine: P('return ans'), message: 'The answer array is complete.', i: -1, target: -1, ans: [...ans] })
  return { input: { nums }, result: ans, frames }
}
