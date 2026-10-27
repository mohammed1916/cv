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

export const code = `start with an empty tag stack at the first character
while the position is still inside the markup
  if the root has already closed, reject
  if a CDATA section starts here, require an open tag and skip to its closing delimiter
  otherwise if a closing tag starts here, require its name to equal the stack top and pop it
  otherwise if an opening tag starts here, require a valid name and push it
  otherwise require an open tag and skip ordinary text up to the next tag
accept only when the markup is nonempty and the stack is empty`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The family visualizer reports code stages rather than line numbers. This maps each frame onto the lines above.
export function familyLine(frame) {
  if (frame.phase === 'start') return 1
  if (frame.phase === 'done') return 8
  return { cdata: 4, close: 5, open: 6, text: 7, return: 8 }[frame.codeStage] ?? 8
}

export const python = `def is_valid_markup(code):
    import re
    stack, index = [], 0
    while index < len(code):
        if index > 0 and not stack:
            return False
        if code.startswith('<![CDATA[', index):
            end = code.find(']]>', index + 9)
            if not stack or end < 0:
                return False
            index = end + 3
        elif code.startswith('</', index):
            end = code.find('>', index + 2)
            name = code[index + 2:end] if end >= 0 else ''
            if not re.fullmatch(r'[A-Z]{1,9}', name) or not stack or stack[-1] != name:
                return False
            stack.pop()
            index = end + 1
        elif code[index] == '<':
            end = code.find('>', index + 1)
            name = code[index + 1:end] if end >= 0 else ''
            if not re.fullmatch(r'[A-Z]{1,9}', name):
                return False
            stack.append(name)
            index = end + 1
        else:
            if not stack:
                return False
            end = code.find('<', index)
            index = len(code) if end < 0 else end
    return len(code) > 0 and not stack`
