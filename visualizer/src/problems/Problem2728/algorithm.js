const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const PY_OF = {1: 2, 2: 2, 3: 4, 4: 5, 5: 7}
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: PY_OF[line] ?? line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'Object with street (list of 0 and 1 for empty and house, length 1 to 12) and start (index)'
export const URL = 'https://leetcode.com/problems/count-houses-in-a-circular-street/'
export const COMPLEXITY = 'O(n) time: one clockwise pass over the circle, visiting each position once. This model is a simplified walk.'
export const EXAMPLES = [
  { label: 'Example', input: '{"street":[0,1,1,0,1,0],"start":4}' },
  { label: 'Empty street', input: '{"street":[0,0,0],"start":0}' },
]
export const WHY = [
  'The street is a circle, so the walk wraps from the last position back to index 0 and stops after one full lap.',
  'Each position is visited exactly once, so no house is counted twice and none is skipped.',
  'This visual uses a simplified walk; the official interface is a different probing API.',
]
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input?.street) || input.street.length < 1 || input.street.length > 12) throw new Error('street has 1 to 12 entries.')
  if (!input.street.every(v => v === 0 || v === 1)) throw new Error('street entries are 0 or 1.')
  if (!Number.isInteger(input.start) || input.start < 0 || input.start >= input.street.length) throw new Error('start is a valid index.')
  return input
}
export function buildTrace({ street, start }) {
  let count = 0
  const frames = [frame('setup', 1, `Start at index ${start} and walk clockwise once.`, { position: start, count })]
  for (let step = 0; step < street.length; step++) {
    const position = (start + step) % street.length
    if (street[position] === 1) count++
    frames.push(frame('step', 4, `Index ${position} ${street[position] ? 'has a house' : 'is empty'}.`, { position, count }))
  }
  frames.push(frame('done', 5, `${count} houses on the street.`, { count }))
  return { input: { street, start }, result: count, frames }
}
export const code = lines(`let count = 0; // set count to 0
for (let step = 0; step < street.length; step++) { // for each step around the circle from start
  const position = (start + step) % street.length; // position is (start plus step) modulo the length
  if (street[position] === 1) count++; // if there is a house at position then add one to count
} return count; // return count`)
export const python = `def count_houses(street, start):
    count = 0
    n = len(street)
    for step in range(n):
        if street[(start + step) % n] == 1:
            count += 1
    return count`
