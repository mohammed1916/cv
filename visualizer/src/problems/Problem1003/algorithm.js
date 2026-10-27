export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.s !== 'string') throw new Error('Use an object with a string s, for example {"s":"aabcbc"}.')
  if (data.s.length < 1 || data.s.length > 20) throw new Error('s must have 1 to 20 characters.')
  if (![...data.s].every(ch => 'abc'.includes(ch))) throw new Error('s may contain only the letters a, b and c.')
  return { s: data.s }
}

export function buildTrace(input) {
  const { s } = input
  const frames = []
  const stack = []
  frames.push({ phase: 'start', activeLine: L('set stack to empty'), cursor: -1, consumed: 0, stack: [], removed: [], result: null, message: 'Start with an empty stack. Each letter is pushed, and whenever the top three form abc they are removed.' })
  for (let i = 0; i < s.length; i++) {
    stack.push(s[i])
    frames.push({ phase: 'push', activeLine: L('push ch onto the stack'), cursor: i, consumed: i + 1, stack: [...stack], removed: [], result: null, message: `Push ${s[i]}. Stack is ${stack.join('') || 'empty'}.` })
    if (stack.length >= 3 && stack.slice(-3).join('') === 'abc') {
      const removed = stack.splice(-3)
      frames.push({ phase: 'pop', activeLine: L('remove the top three letters'), cursor: i, consumed: i + 1, stack: [...stack], removed, result: null, message: `The top three form abc, so remove them. Stack is ${stack.join('') || 'empty'}.` })
    }
  }
  const result = stack.length === 0
  frames.push({ phase: 'done', activeLine: L('return true when'), cursor: -1, consumed: s.length, stack: [...stack], removed: [], result, message: result ? 'The stack is empty, so the word is valid.' : `${stack.join('')} remains on the stack, so the word is invalid.` })
  return { input, result, frames }
}

export const code = `word is valid (s):
  set stack to empty
  for each letter ch in s:
    push ch onto the stack
    if the stack has at least 3 letters and its top three are a, b, c then
      remove the top three letters from the stack
  return true when the stack is empty`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def is_valid(s):
    stack = []
    for ch in s:
        stack.append(ch)
        if len(stack) >= 3 and stack[-3:] == ['a', 'b', 'c']:
            del stack[-3:]
    return not stack
`
