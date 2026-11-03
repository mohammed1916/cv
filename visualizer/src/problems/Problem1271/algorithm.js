// LeetCode 1271: Hexspeak. Write the number in uppercase hexadecimal, read the digits from the
// most significant end, and map 0 to O and 1 to I. Any remaining digit from 2 to 9 makes the
// answer ERROR. The letters A to F stay as they are.
const HEX = '0123456789ABCDEF'
const MAX_DIGITS = 15

export const phases = [
  { id: 'setup', label: 'Number', description: 'Read the decimal string.' },
  { id: 'divide', label: 'Divide', description: 'Take the lowest hex digit.' },
  { id: 'reverse', label: 'Order', description: 'Put the most significant digit first.' },
  { id: 'map', label: 'Map', description: 'Translate one hex digit.' },
  { id: 'error', label: 'Error', description: 'A digit from 2 to 9 cannot be spoken.' },
  { id: 'done', label: 'Result', description: 'Report the Hexspeak text.' },
]

export const code = `FUNCTION toHexspeak(num)
    n ← integer value of num
    hex ← empty list
    WHILE n > 0
        append HEX[n mod 16] to hex; n ← floor(n / 16)
    reverse hex so the most significant digit comes first
    out ← empty text
    FOR each c in hex
        IF c = '0' THEN append 'O'
        ELSE IF c = '1' THEN append 'I'
        ELSE IF c is a digit from '2' to '9' THEN RETURN "ERROR"
        ELSE append c
    RETURN out`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def to_hexspeak(num):
    n = int(num)
    hexdigits = "0123456789ABCDEF"
    digits = []
    while n > 0:
        digits.append(hexdigits[n % 16])
        n //= 16
    digits.reverse()
    out = []
    for c in digits:
        if c == "0":
            out.append("O")
        elif c == "1":
            out.append("I")
        elif c in "23456789":
            return "ERROR"
        else:
            out.append(c)
    return "".join(out)


if __name__ == "__main__":
    import sys, json
    print(json.dumps(to_hexspeak(json.loads(sys.stdin.read()))))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const num = typeof text === 'string' ? JSON.parse(text) : text
  if (typeof num !== 'string' || !new RegExp(`^[1-9][0-9]{0,${MAX_DIGITS - 1}}$`).test(num)) {
    throw new Error(`num is a positive decimal string of up to ${MAX_DIGITS} digits with no leading zero.`)
  }
  return num
}

export function buildTrace(text) {
  const frames = []
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    n: null, digit: null, hex: [], mapped: [], error: null, result: null, ...extra,
  })
  let n = Number(text)
  emit('setup', 'n ← integer value of num', 'n = int(num)', `${text} in decimal is ${n}.`, { n })
  const hex = []
  while (n > 0) {
    const digit = HEX[n % 16]
    hex.push(digit)
    n = Math.floor(n / 16)
    emit('divide', 'append HEX[n mod 16] to hex', 'digits.append(hexdigits[n % 16])', `Remainder gives hex digit ${digit}.`, { n, digit, hex: hex.slice() })
  }
  hex.reverse()
  emit('reverse', 'reverse hex so the most significant digit comes first', 'digits.reverse()', `Hex reads ${hex.join('')}.`, { hex: hex.slice() })
  const mapped = []
  for (const c of hex) {
    if (c === '2' || c === '3' || c === '4' || c === '5' || c === '6' || c === '7' || c === '8' || c === '9') {
      emit('error', 'ELSE IF c is a digit from', 'elif c in "23456789"', `${c} has no Hexspeak letter, so the answer is ERROR.`, { hex: hex.slice(), mapped: mapped.slice(), digit: c, error: true, result: 'ERROR' })
      return { input: text, result: 'ERROR', frames }
    }
    const out = c === '0' ? 'O' : c === '1' ? 'I' : c
    mapped.push(out)
    const line = c === '0' ? 'IF c = \'0\' THEN append' : c === '1' ? 'ELSE IF c = \'1\' THEN append' : 'ELSE append c'
    const py = c === '0' ? 'if c == "0"' : c === '1' ? 'elif c == "1"' : 'else:'
    emit('map', line, py, `${c} becomes ${out}.`, { hex: hex.slice(), mapped: mapped.slice(), digit: c })
  }
  const result = mapped.join('')
  emit('done', 'RETURN out', 'return "".join(out)', `Hexspeak text: ${result}.`, { hex: hex.slice(), mapped: mapped.slice(), result })
  return { input: text, result, frames }
}
