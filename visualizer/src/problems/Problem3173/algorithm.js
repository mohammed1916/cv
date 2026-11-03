// LeetCode 3173: entry i of the answer is nums[i] OR nums[i + 1]. The answer has one entry
// fewer than the input, so a single value gives an empty answer. OR sets every bit that either
// neighbour has, so each entry is a single pass over neighbouring pairs.

const MAX_LENGTH = 12
const MAX_VALUE = 1023

const CODE_TEXT = `FUNCTION adjacentOr(nums)
    answer ← empty list
    FOR i from 0 to length of nums minus 2
        answer[i] ← nums[i] OR nums[i + 1]
    RETURN answer`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def adjacent_or(nums):
    answer = []
    for i in range(len(nums) - 1):
        answer.append(nums[i] | nums[i + 1])
    return answer
`
const PY = s => {
  const index = python.split('\n').findIndex(c => c.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`Use a list of 1 to ${MAX_LENGTH} integers.`)
  for (const value of nums) {
    if (!Number.isInteger(value) || value < 0 || value > MAX_VALUE) throw new Error(`Each value is an integer from 0 to ${MAX_VALUE}.`)
  }
  return nums
}

export function buildTrace(nums) {
  const answer = []
  const frames = []
  frames.push({ phase: 'start', pythonLine: PY('answer = []'), activeLine: L('answer ← empty list'), nums, i: -1, answer: [], message: `Read ${nums.length} value${nums.length === 1 ? '' : 's'}; the answer will have ${Math.max(0, nums.length - 1)} entries.` })
  for (let i = 0; i < nums.length - 1; i++) {
    frames.push({ phase: 'pair', pythonLine: PY('for i in range'), activeLine: L('FOR i from 0'), nums, i, answer: answer.slice(), message: `Pair ${nums[i]} with ${nums[i + 1]}.` })
    answer.push(nums[i] | nums[i + 1])
    frames.push({ phase: 'or', pythonLine: PY('answer.append(nums[i] | nums[i + 1])'), activeLine: L('answer[i] ← nums[i] OR nums[i + 1]'), nums, i, answer: answer.slice(), message: `${nums[i]} OR ${nums[i + 1]} = ${answer[i]}.` })
  }
  frames.push({ phase: 'done', pythonLine: PY('return answer'), activeLine: L('RETURN answer'), nums, i: -1, answer: answer.slice(), message: `Answer: [${answer.join(', ')}].` })
  return { input: nums, result: answer, frames }
}
