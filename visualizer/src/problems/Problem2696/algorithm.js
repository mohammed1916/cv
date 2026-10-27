export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string') throw new Error('Use an object with a string s.')
  const { s } = obj
  if (s.length < 1 || s.length > 30) throw new Error('s has 1 to 30 characters.')
  if (!/^[A-Z]+$/.test(s)) throw new Error('Use uppercase letters only.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const stack = []
  const frames = [{ phase: 'start', activeLine: L('set stack to an empty list'), i: -1, stack: [], message: 'Read the string with an empty stack.' }]
  for (let i = 0; i < s.length; i++) {
    stack.push(s[i])
    frames.push({ phase: 'push', activeLine: L('push c onto the stack'), i, stack: [...stack], message: `Push ${s[i]}.` })
    const m = stack.length
    if (m >= 2 && ((stack[m - 2] === 'A' && stack[m - 1] === 'B') || (stack[m - 2] === 'C' && stack[m - 1] === 'D'))) {
      const pair = stack[m - 2] + stack[m - 1]
      stack.pop()
      stack.pop()
      frames.push({ phase: 'remove', activeLine: L('remove both letters'), i, stack: [...stack], message: `The top two letters form ${pair}; remove them.` })
    }
  }
  const result = stack.length
  frames.push({ phase: 'done', activeLine: L('return the length'), i: s.length, stack: [...stack], message: `${result} letters remain.` })
  return { input, result, frames }
}

export const code = `minimum length after removing AB and CD substrings
  set stack to an empty list
  for each character c of s do
    push c onto the stack
    if the top two letters are AB or CD then
      remove both letters from the stack
  return the length of the stack`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_length(s):
    stack = []
    for c in s:
        stack.append(c)
        if len(stack) >= 2 and ((stack[-2] == 'A' and stack[-1] == 'B') or (stack[-2] == 'C' and stack[-1] == 'D')):
            stack.pop()
            stack.pop()
    return len(stack)
`
