export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6) throw new Error('nums has 1 to 6 rows.')
  const width = Array.isArray(nums[0]) ? nums[0].length : 0
  if (width < 1 || width > 6) throw new Error('Each row has 1 to 6 values.')
  for (const row of nums) {
    if (!Array.isArray(row) || row.length !== width) throw new Error('Every row has the same length.')
    if (!row.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) throw new Error('Values are integers from 0 to 1000.')
  }
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const rows = nums.map(row => [...row].sort((a, b) => b - a))
  frames.push({ pythonLine: 2, phase: 'sort', activeLine: L('sort each row'), column: -1, best: 0, rows: rows.map(r => [...r]), message: 'Sort each row from largest to smallest.' })
  let score = 0
  for (let col = 0; col < rows[0].length; col++) {
    let best = 0
    for (let r = 0; r < rows.length; r++) {
      best = Math.max(best, rows[r][col])
      frames.push({ pythonLine: 7, phase: 'scan', activeLine: L('keep the largest'), column: col, best, rows: rows.map(x => [...x]), row: r, message: `Row ${r} offers ${rows[r][col]}; best so far is ${best}.` })
    }
    score += best
    frames.push({ pythonLine: 8, phase: 'round', activeLine: L('add the best value'), column: col, best, score, rows: rows.map(x => [...x]), row: -1, message: `Round ${col + 1} scores ${best}; total ${score}.` })
  }
  frames.push({ pythonLine: 9, phase: 'done', activeLine: L('return the score'), column: -1, best: 0, score, rows: rows.map(x => [...x]), row: -1, message: `The final score is ${score}.` })
  return { input: { nums }, result: score, frames }
}

export const code = `score of the matrix game
  sort each row from largest to smallest
  set score to 0
  for each column from left to right
    set best to 0
    for each row keep the largest value in that column
    add the best value to score
  return the score`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def matrix_sum(nums):
    rows = [sorted(row, reverse=True) for row in nums]
    score = 0
    for col in range(len(rows[0])):
        best = 0
        for row in rows:
            best = max(best, row[col])
        score += best
    return score
`
