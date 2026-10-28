export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s, for example {"s":"zadb"}.')
  const { s } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 20) throw new Error('s must be 1 to 20 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s may contain only lowercase letters.')
  return { s }
}

// Two letters are consecutive when they differ by 1, or are a and z (the alphabet is circular).
const consecutive = (x, y) => {
  const d = Math.abs(x.charCodeAt(0) - y.charCodeAt(0))
  return d === 1 || d === 25
}

export function buildTrace(input) {
  const { s } = input
  const stack = []
  const frames = [{ phase: 'start', activeLine: L('set the stack to empty'), at: -1, stack: [], message: 'Start with an empty stack. Each letter is pushed unless it cancels the letter on top.' }]
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (stack.length && consecutive(stack[stack.length - 1], ch)) {
      const top = stack.pop()
      frames.push({ phase: 'remove', activeLine: L('pop the top letter'), at: i, stack: [...stack], message: `${top} and ${ch} are consecutive, so both are removed. Stack is ${stack.join('') || 'empty'}.` })
    } else {
      stack.push(ch)
      frames.push({ phase: 'push', activeLine: L('push ch onto the stack'), at: i, stack: [...stack], message: `${ch} does not cancel the top letter, so it is pushed. Stack is ${stack.join('')}.` })
    }
  }
  const result = stack.join('')
  frames.push({ phase: 'done', activeLine: L('return the stack as a string'), at: -1, stack: [...stack], message: `The resulting string is ${result === '' ? 'empty' : result}.` })
  return { input, result, frames }
}

export const code = `resulting string after adjacent removals (s)
  set the stack to empty
  for each letter ch in s
    if the stack is not empty and the top letter and ch are consecutive then
      pop the top letter
    otherwise push ch onto the stack
  return the stack as a string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def resulting_string(s):
    stack = []
    for ch in s:
        if stack and (abs(ord(stack[-1]) - ord(ch)) in (1, 25)):
            stack.pop()
        else:
            stack.append(ch)
    return ''.join(stack)
`
