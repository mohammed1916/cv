export function parseInput(text) {
  const input = JSON.parse(text)
  const n = input?.n
  if (!Number.isInteger(n) || n < 1 || n > 10000) throw new Error('n is an integer from 1 to 10000.')
  return { n }
}

export function buildTrace({ n }) {
  let value = n
  let ops = 0
  const frames = [{ phase: 'start', activeLine: L('set the operation count to zero'), value, ops, message: `Reduce ${n} (binary ${n.toString(2)}) to zero.` }]
  while (value !== 0) {
    if (value % 2 === 0) {
      value /= 2
      frames.push({ phase: 'shift', activeLine: L('halve the number'), value, ops, message: `${value * 2} is even, so halve it to ${value}.` })
    } else if (value % 4 === 3) {
      value += 1
      ops++
      frames.push({ phase: 'add', activeLine: L('add one to the number'), value, ops, message: `Low bits are 11, so add one to get ${value} (operation ${ops}).` })
    } else {
      value -= 1
      ops++
      frames.push({ phase: 'subtract', activeLine: L('subtract one from the number'), value, ops, message: `Low bits are 01, so subtract one to get ${value} (operation ${ops}).` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the operation count'), value, ops, message: `Minimum operations: ${ops}.` })
  return { input: { n }, result: ops, frames }
}

export const code = `minimum operations to reduce n to zero
  set the operation count to zero
  while the number is not zero
    if the number is even then
      halve the number
    else if the number mod 4 is 3 then
      add one to the number and count an operation
    else
      subtract one from the number and count an operation
  return the operation count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(n):
    ops = 0
    while n != 0:
        if n % 2 == 0:
            n //= 2
        elif n % 4 == 3:
            n += 1
            ops += 1
        else:
            n -= 1
            ops += 1
    return ops
`
