export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty stack.' },
  { id: 'read', label: 'Compare', description: 'Compare the next character with the top of the stack.' },
  { id: 'pop', label: 'Pop pair', description: 'The character matches the top, so both disappear.' },
  { id: 'push', label: 'Push', description: 'No match, so the character joins the reduced prefix.' },
  { id: 'done', label: 'Answer', description: 'The stack holds the string with no adjacent duplicates left.' },
]

const PSEUDO = [
  'remove adjacent duplicates(s):',
  '  set stack to empty',
  '  for each character c in s:',
  '    if stack is not empty and its top equals c:',
  '      pop the top of the stack',
  '    else:',
  '      push c onto the stack',
  '  return the stack read as a string',
]

export const code = PSEUDO.map((text, index) => ({ line: index + 1, text }))

export const python = `def remove_adjacent_duplicates(s):
    stack = []
    for c in s:
        if stack and stack[-1] == c:
            stack.pop()
        else:
            stack.append(c)
    return ''.join(stack)
`

export function parseInput(text) {
  const s = String(text).trim().replace(/^"(.*)"$/, '$1')
  if (!/^[a-z]{1,20}$/.test(s)) throw new Error('Use 1 to 20 lowercase letters a to z.')
  return s
}

export function buildTrace(input) {
  const stack = []
  const frames = [{ phase: 'start', activeLine: 2, pythonLine: 2, message: 'Start with an empty stack.', snapshot: { stack: [], index: -1, c: null } }]
  for (let i = 0; i < input.length; i++) {
    const c = input[i]
    frames.push({ phase: 'read', activeLine: 4, pythonLine: 4, message: `Read ${c} at position ${i + 1}.`, snapshot: { stack: [...stack], index: i, c } })
    if (stack.length && stack[stack.length - 1] === c) {
      stack.pop()
      frames.push({ phase: 'pop', activeLine: 5, pythonLine: 5, message: `${c} matches the top, so both disappear.`, snapshot: { stack: [...stack], index: i, c } })
    } else {
      stack.push(c)
      frames.push({ phase: 'push', activeLine: 7, pythonLine: 7, message: `${c} does not match the top, so it joins the stack.`, snapshot: { stack: [...stack], index: i, c } })
    }
  }
  const result = stack.join('')
  frames.push({ phase: 'done', activeLine: 8, pythonLine: 8, message: result ? `The reduced string is ${result}.` : 'Everything cancelled, so the reduced string is empty.', snapshot: { stack: [...stack], index: input.length - 1, c: null } })
  return { input, result, frames }
}
