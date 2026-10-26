export function parseInput(text) {
  const code = JSON.parse(text)
  if (typeof code !== 'string' || code.length < 1 || code.length > 500) throw new Error('Enter a JSON string of 1–500 characters.')
  return code
}

const TAG = /^[A-Z]{1,9}$/

export function buildTrace(code) {
  const frames = []
  const stack = []
  let ok = true
  let i = 0
  const push = (message, phase, line, extra = {}) => frames.push({ phase, index: i, stack: [...stack], valid: true, activeLine: line, message, ...extra })
  push('Read the code left to right. A valid code is one enclosed tag, so the first character must open a tag.', 'start', 2)
  if (code[0] !== '<') { ok = false }
  while (ok && i < code.length) {
    if (code.startsWith('<![CDATA[', i)) {
      if (!stack.length) { ok = false; break }
      const end = code.indexOf(']]>', i + 9)
      if (end < 0) { ok = false; break }
      push('CDATA section: copy its content literally until ]]>.', 'cdata', 5, { index: end + 2 })
      i = end + 3
    } else if (code.startsWith('</', i)) {
      const gt = code.indexOf('>', i)
      const name = gt < 0 ? '' : code.slice(i + 2, gt)
      if (gt < 0 || !stack.length || stack[stack.length - 1] !== name) { ok = false; break }
      stack.pop()
      push(`Closing </${name}> matches the open tag. Pop it.`, 'close', 8, { index: gt })
      i = gt + 1
      if (!stack.length && i < code.length) { ok = false; push('The enclosed tag closed before the end of the code.', 'reject', 9); break }
    } else if (code[i] === '<') {
      const gt = code.indexOf('>', i)
      const name = gt < 0 ? '' : code.slice(i + 1, gt)
      if (gt < 0 || !TAG.test(name)) { ok = false; break }
      stack.push(name)
      push(`Opening <${name}> is valid. Push it.`, 'open', 6, { index: gt })
      i = gt + 1
    } else {
      if (!stack.length) { ok = false; break }
      i++
    }
  }
  const result = ok && stack.length === 0 && code.length > 0
  if (!result) frames.push({ phase: 'reject', index: i, stack: [...stack], valid: false, activeLine: 10, message: 'Invalid: a tag is unmatched, misnamed, or outside the enclosing tag.' })
  frames.push({ phase: 'done', index: code.length - 1, stack: [...stack], valid: result, result, activeLine: 11, message: result ? 'Every opened tag was closed in order: valid.' : 'The stack is not empty or a rule was broken: invalid.' })
  return { input: code, result, frames }
}

export const code = `def isValid(code):
    if code[0] != '<': return False
    stack, i = [], 0
    while i < len(code):
        if code.startswith('<![CDATA[', i):
            ...
        elif code.startswith('</', i):
            ...
        elif code[i] == '<':
            ...
    return not stack`.split('\n').map((text, index) => ({ line: index + 1, text }))
