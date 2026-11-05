export function parseInput(text) {
  const bits = JSON.parse(text)
  if (!Array.isArray(bits) || bits.length < 1 || bits.length > 1000 || bits.some(b => b !== 0 && b !== 1)) throw new Error('Enter a JSON array of 1–1,000 bits (0 or 1).')
  return bits
}

const JS_LINES = [
  'function isOneBitCharacter(bits) {',
  '  let i = 0 // index of the start of the next character',
  '  while (i < bits.length - 1) { // stop at the final bit',
  '    if (bits[i] === 1) i += 2 // a 1 starts a two-bit character: 10 or 11',
  '    else i += 1 // a 0 is a one-bit character',
  '  }',
  '  return i === bits.length - 1 // the walk must land exactly on the final bit',
  '}',
]
const PY_LINES = [
  'def is_one_bit_character(bits):',
  '    index = 0',
  '    while index < len(bits) - 1:',
  '        if bits[index] == 1:',
  '            index += 2',
  '        else:',
  '            index += 1',
  '    return index == len(bits) - 1',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// A 1 starts a two-bit character (10 or 11) and consumes the next bit; a 0 is a one-bit character.
// The last character is one-bit exactly when the walk lands on the final bit.
export function buildTrace(bits) {
  const n = bits.length
  let i = 0
  const starts = []
  const frames = [{ phase: 'start', index: 0, starts: [], activeLine: L('let i = 0'), pythonLine: P('index = 0'), message: 'Read characters from the left. Each character starts where the previous one ended.' }]
  while (i < n - 1) {
    starts.push(i)
    if (bits[i] === 1) {
      frames.push({ phase: 'two', index: i, starts: [...starts], covers: [i, i + 1], activeLine: L('i += 2'), pythonLine: P('index += 2'), message: `Bit ${i} is 1, so a two-bit character covers bits ${i} and ${i + 1}. The next character starts at ${i + 2}.` })
      i += 2
    } else {
      frames.push({ phase: 'one', index: i, starts: [...starts], covers: [i], activeLine: L('i += 1'), pythonLine: P('index += 1'), message: `Bit ${i} is 0, a one-bit character. The next character starts at ${i + 1}.` })
      i += 1
    }
  }
  const result = i === n - 1
  frames.push({ phase: 'done', index: i, starts: [...starts], result, activeLine: L('return i ==='), pythonLine: P('return index =='), message: result ? `The walk lands on the final bit ${n - 1}: the last character is one bit.` : `The walk jumps past the final bit: the last character is two bits.` })
  return { input: bits, result, frames }
}
