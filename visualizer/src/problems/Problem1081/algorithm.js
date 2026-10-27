export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with one key, s.')
  const { s } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 40) throw new Error('s must be a string of 1 to 40 characters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s may contain only lowercase letters a to z.')
  return { s }
}

export function buildTrace({ s }) {
  const last = {}
  for (let i = 0; i < s.length; i++) last[s[i]] = i
  const stack = []
  const inStack = new Set()
  const frames = []
  const frame = (phase, line, index, message, extra = {}) => frames.push({ phase, activeLine: line, index, stack: [...stack], inStack: [...inStack], message, ...extra })
  frame('start', L('record the last position'), -1, 'Record where each letter last appears in s.')
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    frame('scan', L('for each letter'), i, `Look at ${c} at position ${i}.`)
    if (inStack.has(c)) {
      frame('skip', L('already in the stack'), i, `${c} is already in the stack, so this copy is skipped.`)
      continue
    }
    while (stack.length && stack[stack.length - 1] > c && last[stack[stack.length - 1]] > i) {
      const top = stack.pop()
      inStack.delete(top)
      frame('pop', L('remove the top'), i, `${top} is larger than ${c} and appears again later, so it is removed.`)
    }
    stack.push(c)
    inStack.add(c)
    frame('push', L('push c onto the stack'), i, `Push ${c}. The stack reads ${stack.join('')}.`)
  }
  const result = stack.join('')
  frame('done', L('return the stack'), -1, `Smallest subsequence: ${result}.`)
  return { input: { s }, result, frames }
}

export const code = `smallest subsequence with each letter once
  record the last position of each letter in s
  set stack to empty, and track which letters are in it
  for each letter c of s, from left to right
    if c is already in the stack then skip it
    while the stack is not empty and its top letter is larger than c and the top letter appears later in s
      remove the top letter from the stack
    push c onto the stack
  return the stack read from bottom to top as a string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def smallest_subsequence(s):
    last = {}
    for i, ch in enumerate(s):
        last[ch] = i
    stack = []
    in_stack = set()
    for i, ch in enumerate(s):
        if ch in in_stack:
            continue
        while stack and stack[-1] > ch and last[stack[-1]] > i:
            in_stack.discard(stack.pop())
        stack.append(ch)
        in_stack.add(ch)
    return ''.join(stack)
`
