export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string') throw new Error('Use an object with a string s.')
  const { s } = obj
  if (s.length < 1 || s.length > 30) throw new Error('s has 1 to 30 characters.')
  if (!/^[a-z*]+$/.test(s)) throw new Error('Use lowercase letters and stars only.')
  let letters = 0
  for (const c of s) {
    if (c === '*') { letters--; if (letters < 0) throw new Error('Every star needs a letter to its left.') } else letters++
  }
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const stack = []
  const frames = [{ phase: 'start', activeLine: L('set stack to an empty list'), i: -1, stack: [], message: 'Read the string left to right with an empty stack.' }]
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '*') {
      const top = stack.pop()
      frames.push({ phase: 'star', activeLine: L('remove the top'), i, stack: [...stack], message: `Star at ${i} removes ${top}.` })
    } else {
      stack.push(s[i])
      frames.push({ phase: 'letter', activeLine: L('push the character'), i, stack: [...stack], message: `Push ${s[i]} onto the stack.` })
    }
  }
  const result = stack.join('')
  frames.push({ phase: 'done', activeLine: L('return the stack'), i: s.length, stack: [...stack], message: `Remaining string: ${result || '(empty)'}.` })
  return { input, result, frames }
}

export const code = `remove stars and the closest letter to their left
  set stack to an empty list
  for each character c of s do
    if c is a star then
      remove the top of the stack
    otherwise push the character c onto the stack
  return the stack as a string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def remove_stars(s):
    stack = []
    for c in s:
        if c == '*':
            stack.pop()
        else:
            stack.append(c)
    return ''.join(stack)
`
