// LeetCode 2120: Execution of All Suffix Instructions Staying in a Grid.
// For each starting instruction, the robot runs the rest of the string until the next move would leave
// the n x n grid. Answer[i] is the number of instructions it executes from i.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"n":3,"startPos":[0,1],"s":"RRDDLU"}.') }
  const { n, startPos, s } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n must be an integer from 1 to 12.')
  if (!Array.isArray(startPos) || startPos.length !== 2 || startPos.some(v => !Number.isInteger(v) || v < 0 || v >= n)) throw new Error('startPos is [row, col] inside the grid.')
  if (typeof s !== 'string' || s.length < 1 || s.length > 40 || !/^[LRUD]+$/.test(s)) throw new Error('s holds 1 to 40 letters from L, R, U and D.')
  return { n, startPos, s }
}

export const code = `function executeInstructions(n, startPos, s) {
  const answer = []
  for (let start = 0; start < s.length; start++) {
    let [row, col] = startPos
    let steps = 0
    for (let k = start; k < s.length; k++) {
      const nextRow = row + (s[k] === 'U' ? -1 : s[k] === 'D' ? 1 : 0)
      const nextCol = col + (s[k] === 'L' ? -1 : s[k] === 'R' ? 1 : 0)
      if (nextRow < 0 || nextCol < 0 || nextRow >= n || nextCol >= n) break
      row = nextRow
      col = nextCol
      steps++
    }
    answer.push(steps)
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: execute_instructions
def execute_instructions(n, startPos, s):
    answer = []
    for start in range(len(s)):
        row, col = startPos
        steps = 0
        for k in range(start, len(s)):
            next_row = row + (-1 if s[k] == "U" else 1 if s[k] == "D" else 0)
            next_col = col + (-1 if s[k] == "L" else 1 if s[k] == "R" else 0)
            if next_row < 0 or next_col < 0 or next_row >= n or next_col >= n:
                break
            row, col = next_row, next_col
            steps += 1
        answer.append(steps)
    return answer
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
  { id: 'start', label: 'Pick start', description: 'Begin with the instruction at this index.' },
  { id: 'step', label: 'Execute', description: 'Move the robot for the instruction, if it stays in the grid.' },
  { id: 'stop', label: 'Stop', description: 'The next move would leave the grid, or the instructions ran out.' },
  { id: 'done', label: 'Result', description: 'The count for every starting instruction.' },
]

export function buildTrace({ n, startPos, s }) {
  const frames = []
  const answer = []
  for (let start = 0; start < s.length; start++) {
    let [row, col] = startPos
    let steps = 0
    frames.push({ phase: 'start', activeLine: L('for (let start = 0'), pythonLine: P('for start in range'), message: `Start from instruction ${start} at (${row}, ${col}).`, start, k: start, pos: [row, col], answer: [...answer], steps })
    for (let k = start; k < s.length; k++) {
      const nextRow = row + (s[k] === 'U' ? -1 : s[k] === 'D' ? 1 : 0)
      const nextCol = col + (s[k] === 'L' ? -1 : s[k] === 'R' ? 1 : 0)
      if (nextRow < 0 || nextCol < 0 || nextRow >= n || nextCol >= n) {
        frames.push({ phase: 'stop', activeLine: L('if (nextRow < 0'), pythonLine: P('if next_row < 0'), message: `Instruction ${k} (${s[k]}) would leave the grid from (${row}, ${col}); stop after ${steps}.`, start, k, pos: [row, col], answer: [...answer], steps })
        break
      }
      row = nextRow
      col = nextCol
      steps++
      frames.push({ phase: 'step', activeLine: L('row = nextRow'), pythonLine: P('row, col = next_row'), message: `Instruction ${k} (${s[k]}) moves to (${row}, ${col}).`, start, k, pos: [row, col], answer: [...answer], steps })
    }
    answer.push(steps)
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), message: `Answers: ${answer.join(', ')}.`, start: -1, k: -1, pos: startPos, answer: [...answer], steps: null })
  return { input: { n, startPos, s }, result: answer, frames }
}
