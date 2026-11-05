// LeetCode 2165: Smallest Value of the Rearranged Number.
// Positive (or zero): the smallest non-zero digit goes first, then the rest ascending.
// Negative: the magnitude digits are arranged descending so the value is as small (negative) as possible.
// Digits in the magnitude are read as text, so no leading zero survives the move.

export function parseInput(text) {
  const trimmed = text.trim()
  if (!/^-?\d{1,12}$/.test(trimmed)) throw new Error('Use an integer with at most 12 digits, optionally negative.')
  return { num: Number(trimmed) }
}

export const code = `function smallestNumber(num) {
  const digits = String(Math.abs(num)).split('').sort()
  if (num < 0) {
    digits.reverse()
    return -Number(digits.join(''))
  }
  const firstNonZero = digits.findIndex(d => d !== '0')
  if (firstNonZero > 0) {
    const [digit] = digits.splice(firstNonZero, 1)
    digits.unshift(digit)
  }
  return Number(digits.join(''))
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: smallest_number
def smallest_number(num):
    digits = sorted(str(abs(num)))
    if num < 0:
        digits.reverse()
        return -int("".join(digits))
    first = next((i for i, d in enumerate(digits) if d != "0"), None)
    if first is not None and first > 0:
        digit = digits.pop(first)
        digits.insert(0, digit)
    return int("".join(digits))
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'sort', label: 'Sort digits', description: 'Sort the digits of the magnitude.' },
  { id: 'lead', label: 'Choose lead digit', description: 'For a positive number the first digit must be non-zero and as small as possible.' },
  { id: 'negative', label: 'Negative order', description: 'For a negative number put the largest digits first, so the magnitude is largest.' },
  { id: 'done', label: 'Result', description: 'The rearranged number.' },
]

export function buildTrace({ num }) {
  const frames = []
  const digits = String(Math.abs(num)).split('').sort()
  frames.push({ phase: 'sort', activeLine: L('const digits'), pythonLine: P('digits = sorted'), message: `Digits of ${Math.abs(num)} sorted: ${digits.join(' ')}.`, digits: [...digits], lead: null })
  let result
  if (num < 0) {
    digits.reverse()
    result = -Number(digits.join(''))
    frames.push({ phase: 'negative', activeLine: L('digits.reverse()'), pythonLine: P('digits.reverse()'), message: `Negative: largest digits first gives ${digits.join('')}, so the value is ${result}.`, digits: [...digits], lead: 0 })
  } else {
    const firstNonZero = digits.findIndex(d => d !== '0')
    if (firstNonZero > 0) {
      const [digit] = digits.splice(firstNonZero, 1)
      digits.unshift(digit)
      frames.push({ phase: 'lead', activeLine: L('digits.unshift(digit)'), pythonLine: P('digits.insert(0, digit)'), message: `Move the smallest non-zero digit ${digit} to the front; zeros stay after it.`, digits: [...digits], lead: 0 })
    } else {
      frames.push({ phase: 'lead', activeLine: L('const firstNonZero'), pythonLine: P('first = next'), message: 'The first sorted digit is already the smallest non-zero digit (or the number is zero).', digits: [...digits], lead: 0 })
    }
    result = Number(digits.join(''))
  }
  frames.push({ phase: 'done', activeLine: L('return Number'), pythonLine: P('return int'), message: `Smallest value: ${result}.`, digits: String(Math.abs(result)).split(''), lead: null })
  return { input: { num }, result, frames }
}
