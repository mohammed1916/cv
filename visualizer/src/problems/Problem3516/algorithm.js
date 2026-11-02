export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with x, y and z.')
  const { x, y, z } = input
  for (const [name, value] of [['x', x], ['y', y], ['z', z]]) {
    if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error(`${name} is an integer from 1 to 100.`)
  }
  return { x, y, z }
}

export function buildTrace({ x, y, z }) {
  const frames = []
  const d1 = Math.abs(x - z)
  frames.push({ pythonLine: 2, phase: 'distance', activeLine: L('measure the distance d1'), who: 1, d1, d2: null, message: `Person 1 is ${d1} steps from person 3.` })
  const d2 = Math.abs(y - z)
  frames.push({ pythonLine: 3, phase: 'distance', activeLine: L('measure the distance d2'), who: 2, d1, d2, message: `Person 2 is ${d2} steps from person 3.` })
  if (d1 < d2) {
    frames.push({ pythonLine: 4, phase: 'check', activeLine: L('if d1 is less than d2'), who: 1, d1, d2, message: `${d1} is less than ${d2}.` })
    frames.push({ pythonLine: 5, phase: 'done', activeLine: L('return 1'), who: 1, d1, d2, result: 1, message: 'Person 1 arrives first.' })
    return { input: { x, y, z }, result: 1, frames }
  }
  frames.push({ pythonLine: 4, phase: 'check', activeLine: L('if d1 is less than d2'), who: null, d1, d2, message: `${d1} is not less than ${d2}.` })
  if (d2 < d1) {
    frames.push({ pythonLine: 6, phase: 'check', activeLine: L('if d2 is less than d1'), who: 2, d1, d2, message: `${d2} is less than ${d1}.` })
    frames.push({ pythonLine: 7, phase: 'done', activeLine: L('return 2'), who: 2, d1, d2, result: 2, message: 'Person 2 arrives first.' })
    return { input: { x, y, z }, result: 2, frames }
  }
  frames.push({ pythonLine: 8, phase: 'done', activeLine: L('return 0'), who: null, d1, d2, result: 0, message: 'Both arrive at the same time.' })
  return { input: { x, y, z }, result: 0, frames }
}

export const code = `decide which of persons 1 and 2 reaches person 3 first
  measure the distance d1 from person 1 at x to z
  measure the distance d2 from person 2 at y to z
  if d1 is less than d2 then return 1
  if d2 is less than d1 then return 2
  otherwise return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_closest(x, y, z):
    d1 = abs(x - z)
    d2 = abs(y - z)
    if d1 < d2:
        return 1
    if d2 < d1:
        return 2
    return 0
`
