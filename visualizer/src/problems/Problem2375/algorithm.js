export function parseInput(text) {
  const pattern = JSON.parse(text)
  if (typeof pattern !== 'string' || !/^[ID]{1,8}$/.test(pattern)) throw new Error('Use a JSON string of 1 to 8 characters, each I or D.')
  return pattern
}

export function buildTrace(pattern) {
  const n = pattern.length
  const stack = []
  let result = ''
  const frames = [{ phase: 'start', activeLine: L('set result'), stack: [], result: '', message: 'Start with an empty answer and an empty stack.' }]
  for (let i = 1; i <= n + 1; i++) {
    stack.push(i)
    frames.push({ phase: 'push', activeLine: L('push digit i'), stack: [...stack], result, message: `Push ${i} onto the stack.` })
    if (i === n + 1 || pattern[i - 1] === 'I') {
      while (stack.length) result += stack.pop()
      frames.push({ phase: 'flush', activeLine: L('if i is'), stack: [], result, message: i === n + 1 ? `The pattern ends, so pop everything: ${result}.` : `Position ${i} is I, so pop the run: ${result}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return result'), stack: [], result, message: `Smallest number: ${result}.` })
  return { input: pattern, result, frames }
}

export const code = `construct the smallest permutation of 1 to n + 1 that matches the pattern
set result to an empty string and stack to empty
for i from 1 to n + 1 do
  push digit i onto the stack
  if i is n + 1 or the pattern has I at position i then
    pop every digit from the stack onto the result
return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_number(pattern):
    n = len(pattern)
    result = []
    stack = []
    for i in range(1, n + 2):
        stack.append(str(i))
        if i == n + 1 or pattern[i - 1] == 'I':
            while stack:
                result.append(stack.pop())
    return ''.join(result)
`
