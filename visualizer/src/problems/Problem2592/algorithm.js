export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use an array of 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 99)) throw new Error('Values are integers from 0 to 99.')
  return nums
}

export function buildTrace(nums) {
  const base = [...nums].sort((a, b) => a - b)
  const frames = [{ phase: 'sort', activeLine: L('sort nums'), base, candidate: null, index: -1, beaten: 0, message: `Sort a copy: [${base.join(', ')}]. The smallest value not yet beaten starts at the first slot.` }]
  let beaten = 0
  base.forEach((candidate, j) => {
    const beats = base[beaten] < candidate
    if (beats) {
      beaten++
      frames.push({ phase: 'beat', activeLine: L('increase beaten'), base, candidate, index: j, beaten, message: `Candidate ${candidate} beats ${base[beaten - 1]}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if the smallest value'), base, candidate, index: j, beaten, message: `Candidate ${candidate} cannot beat ${base[beaten]}, so move on.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return beaten'), base, candidate: null, index: -1, beaten, message: `Greatness is ${beaten}.` })
  return { input: nums, result: beaten, frames }
}

export const code = `greatness of nums, the number of positions that can be beaten:
  sort nums into a sorted list called base
  set beaten to 0
  for each candidate value in base, in order, do
    if the smallest value not yet beaten, base at beaten, is less than candidate then
      increase beaten by 1
  return beaten`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_greatness(nums):
    base = sorted(nums)
    beaten = 0
    for candidate in base:
        if base[beaten] < candidate:
            beaten += 1
    return beaten
`
