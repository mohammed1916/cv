export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 2147483647) throw new Error('Enter a JSON integer from 1 to 2,147,483,647.')
  return n
}

// Write n in binary. The number alternates exactly when no two neighbouring bits are equal.
export function buildTrace(n) {
  const bits = n.toString(2)
  const frames = [{ phase: 'start', bits, i: null, result: null, activeLine: L('const bits = '), pythonLine: P('bits = bin('), message: `${n} is ${bits} in binary.` }]
  let result = true
  for (let i = 1; i < bits.length; i++) {
    if (bits[i] === bits[i - 1]) {
      result = false
      frames.push({ phase: 'fail', bits, i, result, activeLine: L('return false'), pythonLine: P('return False'), message: `Bits ${i - 1} and ${i} are both ${bits[i]}: not alternating.` })
      break
    }
    frames.push({ phase: 'pair', bits, i, result: null, activeLine: L('if (bits[i] === bits[i - 1])'), pythonLine: P('if bits[i] == bits[i - 1]'), message: `Bits ${i - 1} and ${i} are ${bits[i - 1]} and ${bits[i]}: they differ.` })
  }
  if (result) frames.push({ phase: 'done', bits, i: null, result, activeLine: L('return true'), pythonLine: P('return True'), message: 'Every neighbouring pair differs.' })
  return { input: n, result, frames }
}

const SOURCE = `function hasAlternatingBits(n) {
  const bits = n.toString(2)
  for (let i = 1; i < bits.length; i++) {
    if (bits[i] === bits[i - 1]) return false
  }
  return true
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def has_alternating_bits(n):
    bits = bin(n)[2:]
    for i in range(1, len(bits)):
        if bits[i] == bits[i - 1]:
            return False
    return True`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
