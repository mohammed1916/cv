export function parseInput(text) {
  const input = JSON.parse(text)
  const { num1, num2 } = input ?? {}
  if (!Number.isInteger(num1) || num1 < 1 || num1 > 1000) throw new Error('num1 is an integer from 1 to 1000.')
  if (!Number.isInteger(num2) || num2 < -1000 || num2 > 1000) throw new Error('num2 is an integer from -1000 to 1000.')
  return { num1, num2 }
}

const setBits = v => {
  let count = 0
  for (let x = v; x > 0; x >>= 1) count += x & 1
  return count
}

export function buildTrace({ num1, num2 }) {
  const frames = [{ phase: 'start', activeLine: L('minimum operations to make num1 zero'), k: null, x: null, bits: null, message: `Try operation counts k = 0, 1, 2, ... until num1 - k * num2 can be written as a sum of exactly k powers of two.` }]
  for (let k = 0; k <= 64; k++) {
    const x = num1 - k * num2
    const bits = x >= 0 ? setBits(x) : null
    frames.push({ phase: 'try', activeLine: L('set x to num1 minus'), k, x, bits, message: `k = ${k}: x = ${x}.` })
    if (x >= k && bits <= k) {
      frames.push({ phase: 'accept', activeLine: L('return k'), k, x, bits, message: `x = ${x} has ${bits} set bits, which is at most ${k}, and it is at least ${k}. So ${k} operations suffice.` })
      return { input: { num1, num2 }, result: k, frames }
    }
    frames.push({ phase: 'reject', activeLine: L('if x is at least k'), k, x, bits, message: x < k ? `x = ${x} is smaller than k, so k operations cannot work.` : `x = ${x} has ${bits} set bits, more than ${k}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), k: null, x: null, bits: null, message: 'No operation count works.' })
  return { input: { num1, num2 }, result: -1, frames }
}

export const code = `minimum operations to make num1 zero
  for each operation count k from 0 to 64
    set x to num1 minus k times num2
    if x is at least k and the number of set bits in x is at most k then
      return k
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations_to_zero(num1, num2):
    for k in range(65):
        x = num1 - k * num2
        if x >= k and bin(x).count('1') <= k:
            return k
    return -1
`
