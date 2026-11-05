// LeetCode 1946: mutate one contiguous block, starting at the first digit that the map raises, and keep going while the map does not lower it.
const SOURCE = [
  "function maximumNumber(num, change) {",
  "  const digits = [...num].map(Number)",
  "  let start = -1",
  "  for (let i = 0; i < digits.length; i++) {",
  "    if (change[digits[i]] > digits[i]) { start = i; break }",
  "  }",
  "  if (start === -1) return num",
  "  for (let i = start; i < digits.length; i++) {",
  "    if (change[digits[i]] < digits[i]) break",
  "    digits[i] = change[digits[i]]",
  "  }",
  "  return digits.join('')",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def maximum_number(num, change):
    digits = [int(ch) for ch in num]
    start = -1
    for i in range(len(digits)):
        if change[digits[i]] > digits[i]:
            start = i
            break
    if start == -1:
        return num
    for i in range(start, len(digits)):
        if change[digits[i]] < digits[i]:
            break
        digits[i] = change[digits[i]]
    return "".join(str(d) for d in digits)
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'find', label: 'Find start', description: 'Find the first digit the map would raise.' },
  { id: 'mutate', label: 'Mutate block', description: 'Keep mutating while the map does not lower a digit.' },
  { id: 'done', label: 'Result', description: 'The largest number reachable with one block.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"num":"132","change":[9,8,5,0,3,6,4,2,6,8]}.') }
  const { num, change } = input || {}
  if (typeof num !== 'string' || !/^[0-9]{1,12}$/.test(num)) throw new Error('num is 1 to 12 digits.')
  if (!Array.isArray(change) || change.length !== 10 || !change.every(d => Number.isInteger(d) && d >= 0 && d <= 9)) throw new Error('change has ten digits 0 to 9.')
  return { num, change }
}

export function buildTrace({ num, change }) {
  const frames = []
  const digits = [...num].map(Number)
  let start = -1
  for (let i = 0; i < digits.length; i++) {
    const raise = change[digits[i]] > digits[i]
    frames.push({ phase: 'find', activeLine: L('change[digits[i]] > digits[i]'), pythonLine: P('if change[digits[i]] > digits[i]'), message: raise ? `Digit ${digits[i]} at ${i} can be raised to ${change[digits[i]]}.` : `Digit ${digits[i]} at ${i} would not grow.`, i, start: -1, digits: [...digits], mutated: [], result: null })
    if (raise) { start = i; break }
  }
  const mutated = []
  if (start !== -1) {
    for (let i = start; i < digits.length; i++) {
      if (change[digits[i]] < digits[i]) {
        frames.push({ phase: 'mutate', activeLine: L('change[digits[i]] < digits[i]'), pythonLine: P('if change[digits[i]] < digits[i]'), message: `Digit ${digits[i]} would drop to ${change[digits[i]]}: stop before it.`, i, start, digits: [...digits], mutated: [...mutated], result: null })
        break
      }
      digits[i] = change[digits[i]]
      mutated.push(i)
      frames.push({ phase: 'mutate', activeLine: L('digits[i] = change[digits[i]]'), pythonLine: P('digits[i] = change'), message: `Replace the digit at ${i} with ${digits[i]}.`, i, start, digits: [...digits], mutated: [...mutated], result: null })
    }
  }
  const result = start === -1 ? num : digits.join('')
  frames.push({ phase: 'done', activeLine: L('return digits'), pythonLine: P('return "".join'), message: `Largest number: ${result}.`, i: -1, start, digits: [...digits], mutated: [...mutated], result })
  return { input: { num, change }, result, frames }
}
