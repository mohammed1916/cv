export function parseInput(text) {
  const data = JSON.parse(text)
  const { s, goal } = data ?? {}
  const ok = x => typeof x === 'string' && x.length <= 100 && /^[a-z]*$/.test(x)
  if (!ok(s) || !ok(goal)) throw new Error('s and goal are lowercase strings of up to 100 letters.')
  return { s, goal }
}

const JS_LINES = [
  'function rotateString(s, goal) {',
  '  if (s.length !== goal.length) return false // different lengths can never rotate into each other',
  '  for (let shift = 0; shift < Math.max(1, s.length); shift++) { // the empty string is its own rotation',
  '    const rotated = s.slice(shift) + s.slice(0, shift) // shift the first characters to the end',
  '    if (rotated === goal) return true',
  '  }',
  '  return false',
  '}',
]
const PY_LINES = [
  'def rotate_string(s, goal):',
  '    if len(s) != len(goal):',
  '        return False',
  '    for shift in range(max(1, len(s))):',
  '        rotated = s[shift:] + s[:shift]',
  '        if rotated == goal:',
  '            return True',
  '    return False',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Every rotation of s is a window of s + s starting at the shift. Trying each shift checks all of them.
export function buildTrace({ s, goal }) {
  if (s.length !== goal.length) {
    return { input: { s, goal }, result: false, frames: [{ phase: 'done', shift: -1, rotated: null, result: false, activeLine: L('different lengths'), pythonLine: P('return False'), message: `Lengths ${s.length} and ${goal.length} differ, so no rotation can match.` }] }
  }
  const frames = [{ phase: 'start', shift: -1, rotated: null, activeLine: L('for (let shift'), pythonLine: P('for shift in range'), message: 'Try every rotation of s: move the first shift characters to the end.' }]
  for (let shift = 0; shift < Math.max(1, s.length); shift++) {
    const rotated = s.slice(shift) + s.slice(0, shift)
    const hit = rotated === goal
    frames.push({ phase: hit ? 'match' : 'try', shift, rotated, activeLine: L(hit ? 'if (rotated === goal)' : 'const rotated'), pythonLine: P(hit ? 'if rotated == goal' : 'rotated = s'),
      message: hit ? `Shifting by ${shift} gives "${rotated}", which is the goal.` : `Shift ${shift} gives "${rotated}": not the goal.` })
    if (hit) return { input: { s, goal }, result: true, frames: [...frames, { phase: 'done', shift, rotated, result: true, activeLine: L('return true'), pythonLine: P('return True'), message: 'The goal is a rotation of s.' }] }
  }
  frames.push({ phase: 'done', shift: -1, rotated: null, result: false, activeLine: L('return false'), pythonLine: P('return False'), message: 'No rotation of s equals the goal.' })
  return { input: { s, goal }, result: false, frames }
}
