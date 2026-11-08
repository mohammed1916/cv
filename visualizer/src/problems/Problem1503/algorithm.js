export const phases = [
  { id: 'start', label: 'Start', description: 'Ants walking left fall off at position 0; ants walking right fall off at position n. Each ant turns at a collision, which is the same as passing through.' },
  { id: 'left', label: 'Leftward ants', description: 'A leftward ant at position p needs p time units to fall off, so the slowest one sets the time.' },
  { id: 'right', label: 'Rightward ants', description: 'A rightward ant at position p needs n - p time units to fall off.' },
  { id: 'done', label: 'Complete', description: 'The last ant leaves at the largest of these times.' },
]

export const examples = [
  { label: 'Ants both ways', input: '{"length":9,"left":[2,6],"right":[3,8]}' },
  { label: 'Only rightward', input: '{"length":6,"left":[],"right":[1,4]}' },
  { label: 'Single rightward ant', input: '{"length":4,"left":[],"right":[2]}' },
  { label: 'Ants meet', input: '{"length":5,"left":[4],"right":[1]}' },
  { label: 'Ants at both ends', input: '{"length":20,"left":[0],"right":[20]}' },
  { label: 'Long run: 12 ants', input: '{"length":20,"left":[11,3,12,7,9,8],"right":[4,10,19,13,6,5]}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.left) || !Array.isArray(data.right)) throw new Error('Use an object with length, left and right lists.')
  const { length } = data
  if (!Number.isInteger(length) || length < 1 || length > 20) throw new Error('length must be an integer from 1 to 20 in this visualization.')
  const all = [...data.left, ...data.right]
  if (!all.every(v => Number.isInteger(v) && v >= 0 && v <= length)) throw new Error('Every ant position must be an integer from 0 to length.')
  if (new Set(all).size !== all.length) throw new Error('Ant positions must be distinct.')
  return { length, left: data.left, right: data.right }
}

export function buildTrace({ length, left, right }) {
  const snap = (extra = {}) => ({ length, left, right, ...extra })
  const frames = [{ phase: 'start', activeLine: L('let answer = 0'), pythonLine: P('answer = 0'), snapshot: snap(), message: `A plank of length ${length}. Find the last moment any ant falls off.` }]
  let answer = 0
  for (const p of left) {
    answer = Math.max(answer, p)
    frames.push({ phase: 'left', activeLine: L('for (const p of left)'), pythonLine: P('for p in left'), snapshot: snap({ answer, current: p, side: 'left' }),
      message: `Ant at ${p} walking left falls off after ${p} time unit(s); the answer is at least ${answer}.` })
  }
  for (const p of right) {
    answer = Math.max(answer, length - p)
    frames.push({ phase: 'right', activeLine: L('for (const p of right)'), pythonLine: P('for p in right'), snapshot: snap({ answer, current: p, side: 'right' }),
      message: `Ant at ${p} walking right falls off after ${length - p} time unit(s); the answer is at least ${answer}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), snapshot: snap({ answer, result: answer }),
    message: `Return ${answer}, the last moment an ant falls off.`, result: answer })
  for (const f of frames) f.scene = { ...f.snapshot }
  return { input: { length, left, right }, result: answer, frames }
}

export const code = `function lastMoment(length, left, right) {
  let answer = 0
  for (const p of left) answer = Math.max(answer, p)
  for (const p of right) answer = Math.max(answer, length - p)
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def last_moment(length, left, right):
    answer = 0
    for p in left:
        answer = max(answer, p)
    for p in right:
        answer = max(answer, length - p)
    return answer
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
