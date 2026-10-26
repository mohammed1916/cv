export function parseInput(text) {
  const bits = JSON.parse(text)
  if (!Array.isArray(bits) || bits.length < 1 || bits.length > 1000 || bits.some(b => b !== 0 && b !== 1)) throw new Error('Enter a JSON array of 1–1,000 bits (0 or 1).')
  return bits
}

// A 1 starts a two-bit character (10 or 11) and consumes the next bit; a 0 is a one-bit character.
// The last character is one-bit exactly when the walk lands on the final bit.
export function buildTrace(bits) {
  const n = bits.length
  let i = 0
  const frames = [{ phase: 'start', index: 0, activeLine: 2, message: 'Read characters from the left.' }]
  while (i < n - 1) {
    if (bits[i] === 1) {
      frames.push({ phase: 'two', index: i, activeLine: 4, message: `Bit ${i} is 1: a two-bit character covers bits ${i} and ${i + 1}.` })
      i += 2
    } else {
      frames.push({ phase: 'one', index: i, activeLine: 6, message: `Bit ${i} is 0: a one-bit character.` })
      i += 1
    }
  }
  const result = i === n - 1
  frames.push({ phase: 'done', index: n - 1, result, activeLine: 8, message: result ? 'The walk lands on the final bit: the last character is one bit.' : 'The walk passes the final bit: the last character is two bits.' })
  return { input: bits, result, frames }
}

export const code = `def isOneBitCharacter(bits):
    i = 0
    while i < len(bits) - 1:
        i += 2 if bits[i] == 1 else 1
    return i == len(bits) - 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
