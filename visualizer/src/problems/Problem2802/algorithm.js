// LeetCode 2802: Find The K-th Lucky Number.
// Lucky numbers use only digits 4 and 7. Listed in numeric order they are a binary counter in disguise:
// write k + 1 in binary, drop the leading 1, and read each remaining bit as a digit (0 means 4, 1 means 7).
// The answer is returned as its decimal digit string, which stays exact at any length.
// The visualization caps k at 126 (numbers up to six digits).

const MAX_VISUAL_K = 126

const PYTHON_SOURCE = `def kth_lucky(k):
    m = k + 1
    bits = bin(m)[3:]
    digits = []
    for b in bits:
        digits.append('4' if b == '0' else '7')
    return ''.join(digits)

if __name__ == "__main__":
    import sys, json
    print(kth_lucky(json.loads(sys.stdin.read())))
`

export const code = `const m = k + 1 // m ← k + 1
const bits = m.toString(2).slice(1) // bits ← binary digits after the leading one
let result = ''
for (const bit of bits) { // for each bit after the leading one
  result += bit === '0' ? '4' : '7' // IF bit is 0 append 4, otherwise append 7
}
return result // RETURN result`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const PY = PYTHON_SOURCE.split('\n')
const P = s => {
  const index = PY.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export function parseInput(text) {
  const k = JSON.parse(text)
  if (!Number.isInteger(k) || k < 1) throw new Error('k is a positive integer.')
  return { k }
}

export function buildTrace({ k }) {
  if (k > MAX_VISUAL_K) throw new Error(`The visualization caps k at ${MAX_VISUAL_K}.`)
  const frames = []
  const m = k + 1
  const bits = m.toString(2)
  const digits = []

  frames.push({ phase: 'setup', pythonLine: P('m = k + 1'), activeLine: L('m ← k + 1'), m, bits, next: -1, digits: '', message: `Write k + 1 = ${m} in binary: ${bits}.` })
  frames.push({ phase: 'setup', pythonLine: P("bits = bin(m)[3:]"), activeLine: L('bits ← binary digits'), m, bits, next: -1, digits: '',
    message: `Drop the leading 1; the remaining bits are ${bits.slice(1) || 'empty'}.` })
  for (let i = 1; i < bits.length; i += 1) {
    const bit = bits[i]
    const digit = bit === '0' ? '4' : '7'
    digits.push(digit)
    frames.push({ phase: 'map', pythonLine: P("digits.append('4'"), activeLine: L('IF bit is 0'), m, bits, next: i, bit, digits: digits.join(''),
      message: `Bit ${bit} at position ${i} becomes ${digit}.` })
  }
  const result = digits.join('')
  frames.push({ phase: 'done', pythonLine: P("return ''.join"), activeLine: L('RETURN result'), m, bits, next: -1, digits: result,
    message: `The ${k}-th lucky number is ${result}.` })
  return { input: { k }, k, answer: result, bits, frames }
}

export const pythonLineMap = {}
export const phases = [
  { id: 'setup', label: 'Shift k', description: 'Write k + 1 in binary.' },
  { id: 'map', label: 'Map bits', description: 'Each bit after the leading 1 chooses 4 or 7.' },
  { id: 'done', label: 'Answer', description: 'The digit string is the k-th lucky number.' },
]
