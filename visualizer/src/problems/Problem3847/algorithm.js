export const code = [
  'both scores start at zero and player one is active',
  'for each game i in order',
  'if nums[i] is odd then swap the active player',
  'if i is 5 modulo 6 then swap the active player again',
  'the active player gains nums[i]',
  'return the first score minus the second',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('nums has 1 to 16 integers from 1 to 1000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let active = 0
  const score = [0, 0]
  frames.push({ game: -1, active, score: [...score], phase: 'setup', activeLine: L('both scores'), message: 'Player one is active; both scores are zero.' })
  nums.forEach((points, i) => {
    if (points % 2 === 1) {
      active ^= 1
      frames.push({ game: i, active, score: [...score], phase: 'swap', activeLine: L('is odd'), message: `Game ${i}: ${points} is odd, so the active player changes to player ${active + 1}.` })
    }
    if (i % 6 === 5) {
      active ^= 1
      frames.push({ game: i, active, score: [...score], phase: 'swap', activeLine: L('5 modulo 6'), message: `Game ${i} is a sixth game, so the active player swaps again to player ${active + 1}.` })
    }
    score[active] += points
    frames.push({ game: i, active, score: [...score], phase: 'score', activeLine: L('the active player gains'), message: `Player ${active + 1} gains ${points}.` })
  })
  const diff = score[0] - score[1]
  frames.push({ game: null, active, score: [...score], phase: 'done', activeLine: L('return the first score'), message: `Difference is ${score[0]} minus ${score[1]} = ${diff}.` })
  return { input: { nums }, result: diff, frames }
}

export const python = `def score_difference(nums):
    score = [0, 0]
    active = 0
    for i, points in enumerate(nums):
        if points % 2 == 1:
            active ^= 1
        if i % 6 == 5:
            active ^= 1
        score[active] += points
    return score[0] - score[1]`
