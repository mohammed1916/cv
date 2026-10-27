export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with one key, n.')
  const { n } = data
  if (!Number.isInteger(n) || n < 0 || n > 1023) throw new Error('n must be an integer from 0 to 1023.')
  return { n }
}

export function buildTrace({ n }) {
  const frames = []
  const bits = x => x.toString(2).padStart(10, '0')
  let result = 0
  let rest = n
  let bit = 0
  frames.push({ phase: 'start', activeLine: L('set result to 0'), bit: -1, rest, result, message: `Start with n = ${n} (${bits(n)}).` })
  while (rest > 0) {
    result ^= rest
    frames.push({ phase: 'fold', activeLine: L('xor result with'), bit, rest, result, message: `XOR the current value ${rest} into the result, which is now ${result}.` })
    rest >>= 1
    bit++
    frames.push({ phase: 'shift', activeLine: L('shift the value right'), bit, rest, result, message: `Shift right. The next value is ${rest}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), bit, rest, result, message: `Minimum operations: ${result}.` })
  return { input: { n }, result, frames }
}

export const code = `minimum operations to make n zero
  set result to 0
  set value to n
  while value is greater than 0 do
    xor result with value
    shift the value right by one bit
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def minimum_one_bit_operations(n):
    result = 0
    value = n
    while value > 0:
        result ^= value
        value >>= 1
    return result
`
