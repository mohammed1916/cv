export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums)) throw new Error('Use {"nums": [...]} with an integer array.')
  const { nums } = data
  if (nums.length < 1 || nums.length > 8) throw new Error('nums must have 1 to 8 entries for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('nums entries are integers from 1 to 100.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  const ans = []
  const frames = [{ phase: 'start', activeLine: L('create an empty answer list'), index: -1, ans: [], message: `Build an answer of length ${2 * n}.` }]
  for (let i = 0; i < n; i++) {
    ans.push(nums[i])
    frames.push({ phase: 'copy', activeLine: L('from 0 to n minus 1'), index: i, ans: [...ans], message: `Copy ${nums[i]} from position ${i}.` })
  }
  for (let i = n - 1; i >= 0; i--) {
    ans.push(nums[i])
    frames.push({ phase: 'reverse', activeLine: L('down to 0'), index: i, ans: [...ans], message: `Append ${nums[i]} from position ${i} in reverse.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answer list'), index: -1, ans: [...ans], message: `Answer: [${ans.join(', ')}].` })
  return { input, result: ans, frames }
}

export const code = `concatenate the array with its reverse
  create an empty answer list
  for each index i from 0 to n minus 1
    append nums[i] to the answer list
  for each index i from n minus 1 down to 0
    append nums[i] to the answer list
  return the answer list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def concatenate_array_with_reverse(nums):
    ans = []
    for i in range(len(nums)):
        ans.append(nums[i])
    for i in range(len(nums) - 1, -1, -1):
        ans.append(nums[i])
    return ans
`
