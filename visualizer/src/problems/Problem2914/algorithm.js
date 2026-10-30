const CODE = [
  "FUNCTION minChanges(s)",
  "    changes ← 0",
  "    FOR each pair start i = 0, 2, 4, ... up to length - 1",
  "        IF s[i] differs from s[i + 1], changes ← changes + 1",
  "    RETURN changes",
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = `def minChanges(s):
    changes = 0
    for i in range(0, len(s), 2):
        if s[i] != s[i + 1]:
            changes += 1
    return changes
`

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be a JSON object such as {"s": "1001"}') }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with key s')
  const { s } = data
  if (typeof s !== 'string' || s.length < 2 || s.length > 50) throw new Error('s must be a string of 2 to 50 characters for the visualization')
  if (s.length % 2 !== 0) throw new Error('s must have even length')
  if (!/^[01]+$/.test(s)) throw new Error("s must contain only '0' and '1'")
  return { s }
}

export function buildTrace({ s }) {
  const frames = []
  const chars = [...s]
  let changes = 0
  const emit = (phase, activeLine, pythonLine, message, active = -1, marks = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: chars, active, marks, summary: `changes ${changes}`,
  })
  emit('setup', 2, 2, 'changes = 0')
  for (let i = 0; i < s.length; i += 2) {
    const marks = { [i]: 'pair', [i + 1]: 'pair' }
    emit('pair', 3, 3, `pair starting at ${i}: "${s[i]}${s[i + 1]}"`, i, marks)
    if (s[i] !== s[i + 1]) {
      changes += 1
      emit('pair', 4, 5, `mismatch, so one change is needed (changes ${changes})`, i, { ...marks, [i]: 'changed' })
    } else {
      emit('pair', 4, 4, 'match, so no change is needed', i, marks)
    }
  }
  emit('result', 5, 6, `return ${changes}`)
  return { input: { s }, result: changes, frames }
}
