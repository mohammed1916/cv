export const phases = [
  { id: 'start', label: 'Start', description: 'Start an empty answer that will get one bit per row.' },
  { id: 'flip', label: 'Flip diagonal', description: 'Take bit i of row i and write the opposite bit at position i.' },
  { id: 'done', label: 'Result', description: 'The new string differs from every row at the diagonal position.' },
]

export const code = `function findDifferentBinaryString(nums) {
  let answer = ''
  for (let i = 0; i < nums.length; i++) {
    answer += nums[i][i] === '0' ? '1' : '0'
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def find_different_binary_string(nums):
    answer = ''
    for i in range(len(nums)):
        answer += '1' if nums[i][i] == '0' else '0'
    return answer
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of binary strings such as ["01","10"].') }
  const n = nums.length
  if (!Array.isArray(nums) || n < 1 || n > 16) throw new Error('Give between 1 and 16 binary strings.')
  if (!nums.every(s => typeof s === 'string' && s.length === n && /^[01]+$/.test(s))) throw new Error('Each string must be binary and have length n, the number of strings.')
  if (new Set(nums).size !== n) throw new Error('The strings must be unique.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let answer = ''
  const add = (phase, c, p, message, index) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message, snapshot: { nums, index, answer, diagonal: nums.map((s, i) => s[i]) },
  })
  add('start', "let answer = ''", "answer = ''", 'Start with an empty answer.', -1)
  for (let i = 0; i < nums.length; i++) {
    const bit = nums[i][i] === '0' ? '1' : '0'
    answer += bit
    add('flip', 'answer += nums', 'answer +=', `Row ${i} has ${nums[i][i]} at position ${i}, so write ${bit}.`, i)
  }
  add('done', 'return answer', 'return answer', `${answer} differs from every row at its own position.`, -1)
  return { input: nums, result: answer, frames }
}
