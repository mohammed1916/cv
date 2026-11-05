export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 1 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each nums entry is an integer from 1 to 10.')
  return { nums: input.nums }
}

export const code = `function prefixScores(nums) {
  let runningMax = 0
  let score = 0
  const answer = []
  for (const value of nums) {
    runningMax = Math.max(runningMax, value)
    score += value + runningMax
    answer.push(score)
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def prefix_scores(nums):
    running_max = 0
    score = 0
    answer = []
    for value in nums:
        running_max = max(running_max, value)
        score += value + running_max
        answer.append(score)
    return answer
`

const at = text => code.findIndex(line => line.text.includes(text)) + 1
const pyAt = text => python.split('\n').findIndex(line => line.includes(text)) + 1

export function buildTrace(input) {
  const { nums } = input
  let runningMax = 0
  let score = 0
  const answer = []
  const frames = [{ phase: 'start', activeLine: at('let runningMax'), pythonLine: pyAt('running_max = 0'), index: -1, runningMax, conver: null, score, answer: [], message: 'Start with a running maximum of 0, a score of 0, and an empty answer.' }]
  nums.forEach((value, i) => {
    runningMax = Math.max(runningMax, value)
    const conver = value + runningMax
    score += conver
    answer.push(score)
    frames.push({ phase: 'scan', activeLine: at('score += value'), pythonLine: pyAt('score += value'), index: i, runningMax, conver, score, answer: [...answer], message: `Index ${i}: value ${value}, running maximum ${runningMax}, so conver is ${conver}. The prefix score becomes ${score}.` })
  })
  frames.push({ phase: 'done', activeLine: at('return answer'), pythonLine: pyAt('return answer'), index: nums.length, runningMax, conver: null, score, answer: [...answer], message: `Prefix scores: ${answer.join(', ')}.` })
  return { input, result: answer, frames }
}
