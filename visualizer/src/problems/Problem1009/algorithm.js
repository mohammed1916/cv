export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 5}.')
  const { n } = input
  if (!Number.isInteger(n) || n < 0 || n > 1000000000) throw new Error('n must be an integer from 0 to 1000000000.')
  return { n }
}

export function buildTrace({ n }) {
  const width = Math.max(1, n.toString(2).length)
  const bits = n.toString(2).padStart(width, '0')
  const frames = []
  frames.push({ phase: 'start', activeLine: L('const width ='), pythonLine: P('width = max'), message: `n = ${n} is written as ${bits} with ${width} binary digit(s). Zero keeps its single digit.`, state: { bits, flipped: '', position: -1, width } })
  let flipped = ''
  for (let i = 0; i < bits.length; i++) {
    const flip = bits[i] === '0' ? '1' : '0'
    flipped += flip
    frames.push({ phase: 'flip', activeLine: L('for (const bit of bits)'), pythonLine: P('flipped += '), message: `Digit ${i + 1} is ${bits[i]}, so the complement digit is ${flip}.`, state: { bits, flipped, position: i, width } })
  }
  const result = parseInt(flipped, 2)
  frames.push({ phase: 'done', activeLine: L('return parseInt(flipped, 2)'), pythonLine: P('return int'), message: `Complemented digits ${flipped} read as ${result}.`, state: { bits, flipped, position: -1, width } })
  return { input: { n }, result, frames }
}

export const code = `function bitwiseComplement(n) {
  const width = Math.max(1, n.toString(2).length)
  const bits = n.toString(2).padStart(width, '0')
  let flipped = ''
  for (const bit of bits) {
    flipped += bit === '0' ? '1' : '0'
  }
  return parseInt(flipped, 2)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def bitwise_complement(n):
    width = max(1, n.bit_length())
    bits = format(n, f"0{width}b")
    flipped = ""
    for bit in bits:
        flipped += "1" if bit == "0" else "0"
    return int(flipped, 2)
`
