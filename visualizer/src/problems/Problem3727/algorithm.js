export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  if (obj.nums.length < 1 || obj.nums.length > 8) throw new Error('Use 1 to 8 values for the visualization.')
  if (obj.nums.some(v => !Number.isInteger(v) || Math.abs(v) > 40000)) throw new Error('Values are integers with absolute value at most 40000.')
  return { nums: obj.nums }
}

export function buildTrace(input) {
  const { nums } = input
  const squares = nums.map(x => x * x).sort((a, b) => b - a)
  const plus = Math.ceil(nums.length / 2)
  let score = 0
  const frames = [{ phase: 'start', activeLine: L('set squares to'), index: -1, sign: '', score: 0, plus, message: `Square every value and sort the squares from largest to smallest. ${plus} positions take a plus sign.` }]
  squares.forEach((sq, i) => {
    if (i < plus) {
      score += sq
      frames.push({ phase: 'plus', activeLine: L('if i is less than plus'), index: i, sign: '+', score, plus, message: `${sq} takes a plus sign. Score: ${score}.` })
    } else {
      score -= sq
      frames.push({ phase: 'minus', activeLine: L('otherwise subtract'), index: i, sign: '-', score, plus, message: `${sq} takes a minus sign. Score: ${score}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return score'), index: -1, sign: '', score, plus, message: `Maximum alternating sum: ${score}.` })
  return { input, result: score, frames }
}

export const code = `maximum alternating sum of squares:
  set squares to each value squared
  sort squares from largest to smallest
  set plus to ceil(n / 2)
  set score to 0
  for each index i in the sorted squares:
    if i is less than plus then
      add the square to score
    otherwise subtract the square from score
  return score`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_alternating_sum_squares(nums):
    squares = sorted((x * x for x in nums), reverse=True)
    plus = (len(nums) + 1) // 2
    return sum(squares[:plus]) - sum(squares[plus:])
`
