const CODE = [
  "FUNCTION minimumSteps(s)",
  "    ones ← 0",
  "    steps ← 0",
  "    FOR each character ch in s",
  "        IF ch is '1', ones ← ones + 1",
  "        ELSE steps ← steps + ones",
  "    RETURN steps",
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = `def minimumSteps(s):
    ones = 0
    steps = 0
    for ch in s:
        if ch == '1':
            ones += 1
        else:
            steps += ones
    return steps
`

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be a JSON object such as {"s": "101"}') }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with key s')
  const { s } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 50) throw new Error('s must be a string of 1 to 50 characters for the visualization')
  if (!/^[01]+$/.test(s)) throw new Error("s must contain only '0' (white) and '1' (black)")
  return { s }
}

export function buildTrace({ s }) {
  const frames = []
  const chars = [...s]
  let ones = 0
  let steps = 0
  const emit = (phase, activeLine, pythonLine, message, active = -1, marks = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: chars, active, marks, summary: `black seen ${ones} · steps ${steps}`,
  })
  emit('setup', 2, 2, 'ones = 0, steps = 0')
  emit('setup', 3, 3, 'steps = 0')
  for (let i = 0; i < s.length; i++) {
    emit('scan', 4, 4, `read "${s[i]}" at ${i}`, i, { [i]: 'current' })
    if (s[i] === '1') {
      ones += 1
      emit('scan', 5, 6, `black ball: ones becomes ${ones}`, i, { [i]: 'black' })
    } else {
      steps += ones
      emit('scan', 6, 8, `white ball passes ${ones} black ball(s): steps ${steps}`, i, { [i]: 'white' })
    }
  }
  emit('result', 7, 9, `return ${steps}`)
  return { input: { s }, result: steps, frames }
}
