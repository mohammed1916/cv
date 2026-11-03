export const phases = [
  { id: 'start', label: 'Start', description: 'Ants walking left fall at their own position. Ants walking right fall at the distance to the far end.' },
  { id: 'left', label: 'Left walkers', description: 'An ant walking left needs as many moves as its position to reach the 0 end.' },
  { id: 'right', label: 'Right walkers', description: 'An ant walking right needs length minus its position moves to reach the far end.' },
  { id: 'done', label: 'Complete', description: 'The last fall is the largest of these individual fall times.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"length": 8, "left": [1], "right": [5]}.')
  const { length, left, right } = input
  if (!Number.isInteger(length) || length < 1 || length > 30) throw new Error('length is an integer from 1 to 30.')
  if (!Array.isArray(left) || !Array.isArray(right) || left.length + right.length < 1 || left.length + right.length > 12) throw new Error('left and right are lists whose combined size is 1 to 12.')
  const all = [...left, ...right]
  if (!all.every(p => Number.isInteger(p) && p >= 0 && p <= length)) throw new Error('Every ant position is an integer from 0 to length.')
  if (new Set(all).size !== all.length) throw new Error('Ant positions must be distinct.')
  return { length, left, right }
}

export function buildTrace({ length, left, right }) {
  let answer = 0
  const snap = (side, position, fall) => ({ length, side, position, fall, answer })
  const frames = [{
    phase: 'start', activeLine: L('answer = 0'), pythonLine: P('answer = 0'), snapshot: snap(null, null, null),
    message: `Plank of length ${length}. Ants that bump into each other swap directions, which looks the same as passing through. So the set of fall times stays the same, and the last fall is the largest single fall time.`,
  }]
  for (const position of left) {
    answer = Math.max(answer, position)
    frames.push({
      phase: 'left', activeLine: L('answer = max(answer, p)'), pythonLine: P('answer = max(answer, position)'), snapshot: snap('left', position, position),
      message: `Ant at ${position} walks left and falls after ${position} moves. Largest so far: ${answer}.`,
    })
  }
  for (const position of right) {
    const fall = length - position
    answer = Math.max(answer, fall)
    frames.push({
      phase: 'right', activeLine: L('answer = max(answer, length - p)'), pythonLine: P('answer = max(answer, length - position)'), snapshot: snap('right', position, fall),
      message: `Ant at ${position} walks right and falls after ${length} - ${position} = ${fall} moves. Largest so far: ${answer}.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), snapshot: snap(null, null, null),
    message: `The last ant falls at moment ${answer}.`,
  })
  return { input: { length, left, right }, result: answer, frames }
}

export const code = `last moment (length, left, right):
  answer = 0
  for each position p in left:
    answer = max(answer, p)
  for each position p in right:
    answer = max(answer, length - p)
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def last_moment(length, left, right):
    answer = 0
    for position in left:
        answer = max(answer, position)
    for position in right:
        answer = max(answer, length - position)
    return answer
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
