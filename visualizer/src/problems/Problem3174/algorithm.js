export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 40) throw new Error('Use a JSON string of 1 to 40 characters.')
  if (!/^[a-z0-9]+$/.test(s)) throw new Error('Use only lowercase letters a to z and digits 0 to 9.')
  let letters = 0
  for (const c of s) {
    if (/[0-9]/.test(c)) {
      if (letters === 0) throw new Error(`The digit ${c} has no letter to its left to remove.`)
      letters--
    } else letters++
  }
  return s
}

export function buildTrace(s) {
  const stack = []
  const frames = [{ phase: 'start', activeLine: L('set the stack'), stack: [], pos: -1, message: 'Start with an empty stack of letters.' }]
  ;[...s].forEach((c, pos) => {
    if (/[0-9]/.test(c)) {
      const removed = stack.pop()
      frames.push({ phase: 'pop', activeLine: L('pop the top letter'), stack: [...stack], pos, message: `Digit ${c} deletes the closest letter to its left, ${removed}.` })
    } else {
      stack.push(c)
      frames.push({ phase: 'push', activeLine: L('push c onto'), stack: [...stack], pos, message: `Letter ${c} stays, so push it.` })
    }
  })
  const result = stack.join('')
  frames.push({ phase: 'done', activeLine: L('return the stack'), stack: [...stack], pos: s.length, message: `Remaining string: "${result}".` })
  return { input: s, result, frames }
}

export const code = `clear the digits from a string of letters and digits
set the stack to empty
for each character c of the string do
  if c is a digit then
    pop the top letter, the closest letter to the left of c
  otherwise
    push c onto the stack
return the stack read from bottom to top`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def clear_digits(s):
    stack = []
    for c in s:
        if c.isdigit():
            stack.pop()
        else:
            stack.append(c)
    return ''.join(stack)
`
