export const phases = [
  { id: 'split', label: 'Split', description: 'Read each character and sort it into the letter group or the digit group.' },
  { id: 'check', label: 'Count check', description: 'An alternating string exists only when the two group sizes differ by at most one.' },
  { id: 'start', label: 'Start', description: 'Begin with the larger group. With equal sizes, begin with the letter group.' },
  { id: 'interleave', label: 'Interleave', description: 'Place one item from each group in turn until the shorter group runs out.' },
  { id: 'result', label: 'Result', description: 'Return the alternating string, or an empty string when the counts rule it out.' },
]

export const python = `def reformat(s):
    letters = [c for c in s if c.isalpha()]
    digits = [c for c in s if c.isdigit()]
    if abs(len(letters) - len(digits)) > 1:
        return ""
    longer, shorter = (letters, digits) if len(letters) >= len(digits) else (digits, letters)
    out = []
    for i in range(len(longer)):
        out.append(longer[i])
        if i < len(shorter):
            out.append(shorter[i])
    return "".join(out)`

const pythonLines = python.split('\n')
const CODE = [
  'function reformat(s) {',
  '  const letters = [...s].filter(c => /[a-z]/.test(c))',
  '  const digits = [...s].filter(c => /\d/.test(c))',
  "  if (Math.abs(letters.length - digits.length) > 1) return ''",
  '  const [longer, shorter] = letters.length >= digits.length ? [letters, digits] : [digits, letters]',
  '  const out = []',
  '  for (let i = 0; i < longer.length; i++) {',
  '    out.push(longer[i])',
  '    if (i < shorter.length) out.push(shorter[i])',
  '  }',
  "  return out.join('')",
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 11 }

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON string, such as "a1b2c3".') }
  if (typeof value !== 'string' || value.length < 1 || value.length > 500) throw new Error('Enter a JSON string of 1 to 500 characters.')
  if (!/^[a-z0-9]+$/.test(value)) throw new Error('Use only lowercase letters a to z and digits 0 to 9.')
  return value
}

export function buildTrace(s) {
  const frames = []
  const letters = [], digits = [], out = []
  let longer = [], shorter = []
  const push = (phase, activeLine, message, current = -1) => frames.push({
    phase, activeLine, message,
    snapshot: { current, letters: [...letters], digits: [...digits], output: [...out], longer: [...longer], shorter: [...shorter] },
  })

  push('split', 2, `Two empty groups. The string has ${s.length} characters.`)
  for (let i = 0; i < s.length; i++) {
    const isDigit = /\d/.test(s[i])
    if (isDigit) digits.push(s[i]); else letters.push(s[i])
    push('split', isDigit ? 3 : 2, `Character ${i + 1}, "${s[i]}", joins the ${isDigit ? 'digit' : 'letter'} group.`, i)
  }

  const ok = Math.abs(letters.length - digits.length) <= 1
  push('check', 4, `${letters.length} letters and ${digits.length} digits. ${ok
    ? 'The sizes differ by at most one, so an alternating arrangement exists.'
    : 'The sizes differ by more than one, so two neighbours of the same kind must appear.'}`)
  if (!ok) {
    push('result', 4, 'Return the empty string.')
    return { input: s, result: '', frames }
  }

  const lettersFirst = letters.length >= digits.length
  longer = lettersFirst ? letters : digits
  shorter = lettersFirst ? digits : letters
  push('start', 5, `The ${lettersFirst ? 'letter' : 'digit'} group is the longer one (${longer.length}), so it goes first.`)
  for (let i = 0; i < longer.length; i++) {
    out.push(longer[i])
    push('interleave', 8, `Append ${longer[i]} from the longer group.`)
    if (i < shorter.length) {
      out.push(shorter[i])
      push('interleave', 9, `Append ${shorter[i]} from the shorter group.`)
    }
  }
  const result = out.join('')
  push('result', 11, `Done: the output is ${result}.`)
  return { input: s, result, frames }
}
