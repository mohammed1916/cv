export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.s !== 'string') throw new Error('Use an object with a binary string s, for example {"s":"1001101"}.')
  if (data.s.length < 1 || data.s.length > 40) throw new Error('s must have 1 to 40 characters.')
  if (![...data.s].every(ch => ch === '0' || ch === '1')) throw new Error('s may contain only the characters 0 and 1.')
  return { s: data.s }
}

export function buildTrace(input) {
  const { s } = input
  let ones = 0
  let operations = 0
  const frames = [{ phase: 'start', activeLine: L('set operations to 0'), cursor: -1, ones, operations, message: 'Scan left to right. Each 1 seen so far can move past the next 0 that follows a 1.' }]
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '1') {
      ones += 1
      frames.push({ phase: 'count', activeLine: L('add 1 to ones'), cursor: i, ones, operations, message: `Index ${i} is 1, so there are ${ones} ones so far.` })
    } else if (i > 0 && s[i - 1] === '1') {
      operations += ones
      frames.push({ phase: 'zero', activeLine: L('add ones to operations'), cursor: i, ones, operations, message: `Index ${i} is 0 after a 1. The ${ones} ones before it can each move past it, adding ${ones} operations.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return operations'), cursor: -1, ones, operations, message: `Maximum operations: ${operations}.` })
  return { input, result: operations, frames }
}

export const code = `maximum number of operations on a binary string s
  set operations to 0
  set ones to 0
  for each index i from 0 to the last index of s
    if s[i] is 1 then
      add 1 to ones
    otherwise if i is not 0 and s[i - 1] is 1 then
      add ones to operations
  return operations`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_operations(s):
    ones = 0
    operations = 0
    for i, ch in enumerate(s):
        if ch == '1':
            ones += 1
        elif i > 0 and s[i - 1] == '1':
            operations += ones
    return operations
`
