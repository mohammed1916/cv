// LeetCode 2155: All Divisions With the Highest Score of a Binary Array.
// Division i scores (zeros before i) + (ones from i onward). Walk i from 0 to n, updating the counts
// as each element moves to the left part, and keep every index with the best score.

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of 0s and 1s, e.g. [0,0,1,0].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 40 || nums.some(v => v !== 0 && v !== 1)) {
    throw new Error('Use 1 to 40 values, each 0 or 1.')
  }
  return { nums }
}

export const code = `function bestDivisions(nums) {
  const n = nums.length
  const totalOnes = nums.reduce((sum, v) => sum + v, 0)
  let zerosLeft = 0
  let onesLeft = 0
  let best = -1
  let result = []
  for (let i = 0; i <= n; i++) {
    const score = zerosLeft + (totalOnes - onesLeft)
    if (score > best) {
      best = score
      result = [i]
    } else if (score === best) {
      result.push(i)
    }
    if (i < n) {
      if (nums[i] === 0) zerosLeft++
      else onesLeft++
    }
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: best_divisions
def best_divisions(nums):
    n = len(nums)
    total_ones = sum(nums)
    zeros_left = 0
    ones_left = 0
    best = -1
    result = []
    for i in range(n + 1):
        score = zeros_left + (total_ones - ones_left)
        if score > best:
            best = score
            result = [i]
        elif score == best:
            result.append(i)
        if i < n:
            if nums[i] == 0:
                zeros_left += 1
            else:
                ones_left += 1
    return result
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Ones on the right', description: 'Division 0 keeps every one on the right side.' },
  { id: 'score', label: 'Score division', description: 'Score = zeros on the left + ones on the right.' },
  { id: 'move', label: 'Move element', description: 'The next element joins the left part.' },
  { id: 'done', label: 'Result', description: 'Every division that reaches the best score.' },
]

export function buildTrace({ nums }) {
  const frames = []
  const n = nums.length
  const totalOnes = nums.reduce((sum, v) => sum + v, 0)
  let zerosLeft = 0
  let onesLeft = 0
  let best = -1
  let result = []
  const scores = []
  for (let i = 0; i <= n; i++) {
    const score = zerosLeft + (totalOnes - onesLeft)
    scores.push(score)
    if (score > best) { best = score; result = [i] } else if (score === best) result.push(i)
    frames.push({ phase: i === 0 ? 'start' : 'score', activeLine: L('const score ='), pythonLine: P('score = zeros_left'), message: `Division ${i}: ${zerosLeft} zeros left + ${totalOnes - onesLeft} ones right = ${score}.`, i, scores: [...scores], best, result: [...result], split: i })
    if (i < n) {
      if (nums[i] === 0) zerosLeft++
      else onesLeft++
      frames.push({ phase: 'move', activeLine: L('if (nums[i] === 0)'), pythonLine: P('if nums[i] == 0'), message: `Element ${i} (${nums[i]}) moves to the left part.`, i, scores: [...scores], best, result: [...result], split: i + 1 })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), message: `Best score ${best} at divisions ${result.join(', ')}.`, i: -1, scores: [...scores], best, result: [...result], split: null })
  return { input: { nums }, result, frames }
}
