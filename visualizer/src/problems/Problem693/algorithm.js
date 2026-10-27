export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 2147483647) throw new Error('Enter a positive integer up to 2,147,483,647.')
  return n
}

// Adjacent bits must differ. XOR each bit with its right neighbour: every result must be 1.
export function buildTrace(n) {
  const bits = n.toString(2)
  const frames = [{ phase: 'start', index: -1, bits, ok: true, activeLine: 2, message: `Binary of ${n}: ${bits}.` }]
  let ok = true
  for (let i = 1; i < bits.length && ok; i++) {
    const xor = (n >> (bits.length - 1 - i)) ^ (n >> (bits.length - i))
    const pair = (xor & 1) === 1
    frames.push({ phase: 'pair', index: i, bits, ok: pair, activeLine: 5, message: `Bits ${bits[i - 1]} and ${bits[i]}: ${pair ? 'differ' : 'equal'}.` })
    if (!pair) ok = false
  }
  frames.push({ phase: 'done', index: bits.length - 1, bits, ok, result: ok, activeLine: 8, message: ok ? 'Every neighbouring pair differs.' : 'Two neighbouring bits match.' })
  return { input: n, result: ok, bits, frames }
}

export const code = `write n in binary as the list of its bits
for each adjacent pair of bits
  compare the two bits
  if they are equal then return false
return true`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 3 compares each adjacent pair of bits; line 1 and line 5 match the setup and return.
export const LINE_MAP = { 1: 1, 3: 3, 5: 5 }

export const python = `def has_alternating_bits(n):
    bits = bin(n)[2:]
    for i in range(len(bits) - 1):
        if bits[i] == bits[i + 1]:
            return False
    return True`
