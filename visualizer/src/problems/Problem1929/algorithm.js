// LeetCode 1929: the answer is nums followed by a second copy of nums.
const SOURCE = [
  "function getConcatenation(nums) {",
  "  const n = nums.length",
  "  const ans = new Array(2 * n)",
  "  for (let i = 0; i < n; i++) {",
  "    ans[i] = nums[i]",
  "    ans[i + n] = nums[i]",
  "  }",
  "  return ans",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def get_concatenation(nums):
    n = len(nums)
    ans = [0] * (2 * n)
    for i in range(n):
        ans[i] = nums[i]
        ans[i + n] = nums[i]
    return ans
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'copy', label: 'Copy', description: 'Write each value into the first half and the second half.' },
  { id: 'done', label: 'Result', description: 'The second half repeats the first.' },
]

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Enter a JSON array of integers, for example [1,2,1].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('Use 1 to 10 values for the visualization.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('Each value is an integer from -1000 to 1000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const ans = new Array(2 * n).fill(null)
  const frames = []
  for (let i = 0; i < n; i++) {
    ans[i] = nums[i]
    frames.push({ phase: 'copy', activeLine: L('ans[i] = nums[i]'), pythonLine: P('ans[i] = nums[i]'), message: `Write nums[${i}] = ${nums[i]} at position ${i}.`, i, ans: [...ans] })
    ans[i + n] = nums[i]
    frames.push({ phase: 'copy', activeLine: L('ans[i + n]'), pythonLine: P('ans[i + n]'), message: `Write the same value at position ${i + n}.`, i, ans: [...ans] })
  }
  frames.push({ phase: 'done', activeLine: L('return ans'), pythonLine: P('return ans'), message: 'Both halves are filled.', i: -1, ans: [...ans] })
  return { input: { nums }, result: ans, frames }
}
