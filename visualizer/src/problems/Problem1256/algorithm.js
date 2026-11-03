// LeetCode 1256: Encode Number. The code of num is the binary form of num + 1 with its leading
// one removed. Codes are listed by length first, so the mapping is a counting order.
const MAX_NUM = 1023

export const phases = [
  { id: 'setup', label: 'Shift', description: 'Add one to the number.' },
  { id: 'divide', label: 'Bits', description: 'Peel off the lowest bit.' },
  { id: 'reverse', label: 'Order', description: 'Put the most significant bit first.' },
  { id: 'drop', label: 'Drop', description: 'Remove the leading one.' },
  { id: 'done', label: 'Code', description: 'Report the encoding.' },
]

export const code = `FUNCTION encodeNumber(num)
    x ← num + 1
    bits ← empty list
    WHILE x > 0
        append x mod 2 to bits; x ← floor(x / 2)
    reverse bits so the most significant bit comes first
    RETURN bits without its first digit, as text`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def encode_number(num):
    x = num + 1
    bits = []
    while x > 0:
        bits.append(str(x % 2))
        x //= 2
    bits.reverse()
    return "".join(bits[1:])


if __name__ == "__main__":
    import sys, json
    print(json.dumps(encode_number(json.loads(sys.stdin.read()))))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const num = typeof text === 'string' ? JSON.parse(text) : text
  if (!Number.isInteger(num) || num < 0 || num > MAX_NUM) throw new Error(`num is an integer from 0 to ${MAX_NUM}.`)
  return num
}

export function buildTrace(num) {
  const frames = []
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    x: null, bits: [], bit: null, ordered: null, result: null, ...extra,
  })
  let x = num + 1
  emit('setup', 'x ← num + 1', 'x = num + 1', `${num} + 1 = ${x}.`, { x })
  const bits = []
  while (x > 0) {
    const bit = x % 2
    bits.push(String(bit))
    x = Math.floor(x / 2)
    emit('divide', 'append x mod 2 to bits', 'bits.append(str(x % 2))', `Lowest bit ${bit}; ${x} is left.`, { x, bits: bits.slice(), bit })
  }
  bits.reverse()
  emit('reverse', 'reverse bits so the most significant bit comes first', 'bits.reverse()', `Reading the bits from the top gives ${bits.join('')}.`, { bits: bits.slice(), ordered: bits.join('') })
  const result = bits.slice(1).join('')
  emit('drop', 'RETURN bits without its first digit, as text', 'return "".join(bits[1:])', `Drop the leading one: the code is "${result}".`, { bits: bits.slice(), ordered: bits.join(''), result })
  emit('done', 'RETURN bits without its first digit, as text', 'return "".join(bits[1:])', `encode(${num}) = "${result}".`, { bits: bits.slice(), ordered: bits.join(''), result })
  return { input: num, result, frames }
}

// The code of every number up to limit, for the sequence strip in the view.
export function codeOf(num) {
  return buildTrace(num).result
}
