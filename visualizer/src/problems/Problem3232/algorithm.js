export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object such as {"nums":[1,2,3,4,5,14]}.')
  const { nums } = data
  if (nums.length < 1 || nums.length > 10) throw new Error('nums has 1 to 10 entries in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 99)) throw new Error('Values are integers from 1 to 99.')
  return { nums }
}

export function buildTrace({ nums }) {
  const singles = nums.filter(v => v < 10).reduce((a, b) => a + b, 0)
  const doubles = nums.filter(v => v >= 10).reduce((a, b) => a + b, 0)
  const result = singles !== doubles
  const frames = [
    { phase: 'split', activeLine: L('set singles to'), singles, doubles, message: `Single-digit sum ${singles}, double-digit sum ${doubles}.` },
    { phase: 'compare', activeLine: L('if singles equals doubles'), singles, doubles, message: singles === doubles ? 'The sums are equal, so whichever category Alice takes, Bob gets as much.' : `Alice takes the ${singles > doubles ? 'single-digit' : 'double-digit'} numbers, the larger sum.` },
    { phase: 'done', activeLine: L(result ? 'return true' : 'return false'), singles, doubles, message: result ? 'Alice can win.' : 'Alice cannot win.' },
  ]
  return { input: { nums }, result, frames }
}

export const code = `can alice win the digit game:
  set singles to the sum of the values below 10
  set doubles to the sum of the values from 10 to 99
  alice takes the category with the larger sum and bob takes the other
  if singles equals doubles then
    return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def digit_game_winnable(nums):
    singles = sum(v for v in nums if v < 10)
    doubles = sum(v for v in nums if v >= 10)
    return singles != doubles
`
