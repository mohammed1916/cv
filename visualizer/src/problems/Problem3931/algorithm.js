export const phases = [
  { id: 'start', label: 'Digits', description: 'Read the digits of the string.' },
  { id: 'pair', label: 'Pair', description: 'Compare two neighbouring digits by value.' },
  { id: 'fail', label: 'Fail', description: 'A pair differs by more than two.' },
  { id: 'done', label: 'Result', description: 'Report whether every pair passes.' },
]

export function parseInput(text) {
  const trimmed = String(text).trim()
  if (!/^[0-9]{2,100}$/.test(trimmed)) throw new Error('Enter a string of 2 to 100 decimal digits.')
  return { text: trimmed }
}

export function buildTrace({ text }) {
  const digits = [...text].map(Number)
  const frames = [{ phase: 'start', activeLine: L('let digits be'), pythonLine: P('digits = [int'), message: `Read ${digits.length} digits: compare neighbours by numeric value.`, digits, i: -1, gap: null, ok: null }]
  let ok = true
  for (let i = 0; i < digits.length - 1; i++) {
    const gap = Math.abs(digits[i] - digits[i + 1])
    const pairOk = gap <= 2
    frames.push({ phase: 'pair', activeLine: L('let gap be'), pythonLine: P('if abs(digits'), message: `${digits[i]} and ${digits[i + 1]} differ by ${gap}${pairOk ? ', within two.' : ', more than two.'}`, digits, i, gap, ok: pairOk })
    if (!pairOk) {
      ok = false
      frames.push({ phase: 'fail', activeLine: L('if gap is greater'), pythonLine: P('return False'), message: 'The check stops at the first failing pair.', digits, i, gap, ok: false })
      break
    }
  }
  frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: P('return True'), message: ok ? 'Every neighbouring pair is within two.' : 'At least one neighbouring pair is too far apart.', digits, i: -1, gap: null, ok })
  return { input: { text }, result: ok, frames }
}

export const code = `check every adjacent digit pair
  let digits be the decimal digits of the text
  for each position i from 0 to the length minus 2
    let gap be the absolute difference of digits[i] and digits[i + 1]
    if gap is greater than two then return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def check_adjacent_digit_differences(text):
    digits = [int(c) for c in text]
    for i in range(len(digits) - 1):
        if abs(digits[i] - digits[i + 1]) > 2:
            return False
    return True`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
