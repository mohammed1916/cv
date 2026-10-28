export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 1 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each nums entry is an integer from 1 to 10.')
  return { nums: input.nums }
}

export function buildTrace(input) {
  const nums = input.nums
  let runningMax = 0
  let score = 0
  const answer = []
  const frames = [{ phase: 'start', activeLine: L('set running_max to 0'), index: -1, runningMax: 0, conver: null, score: 0, answer: [], message: 'Start with no maximum and a score of 0.' }]
  nums.forEach((value, i) => {
    runningMax = Math.max(runningMax, value)
    const conver = value + runningMax
    score += conver
    answer.push(score)
    frames.push({ phase: 'scan', activeLine: L('set conver to'), index: i, runningMax, conver, score, answer: [...answer], message: `Index ${i}: maximum ${runningMax}, converted value ${conver}, prefix score ${score}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answer'), index: nums.length, runningMax, conver: null, score, answer: [...answer], message: `Prefix scores: ${answer.join(', ')}.` })
  return { input, result: answer, frames }
}

export const code = `score of every prefix of nums
  set running_max to 0, score to 0, and answer to an empty list
  for each index i in order do
    set running_max to the larger of running_max and nums[i]
    set conver to nums[i] plus running_max
    add conver to score
    append score to answer
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def score_of_prefixes(nums):
    running_max = 0
    score = 0
    answer = []
    for value in nums:
        running_max = max(running_max, value)
        score += value + running_max
        answer.append(score)
    return answer
`
