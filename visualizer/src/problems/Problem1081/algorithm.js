export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with one key, s.')
  const { s } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 40) throw new Error('s must be a string of 1 to 40 characters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s may contain only lowercase letters a to z.')
  return { s }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function smallestSubsequence(s) {', 'def smallest_subsequence(s):'],
  ['  const last = {}', '    last = {}'],
  ['  for (let i = 0; i < s.length; i++) last[s[i]] = i', '    for i, c in enumerate(s): last[c] = i'],
  ['  const stack = []', '    stack = []'],
  ['  const inStack = new Set()', '    in_stack = set()'],
  ['  for (let i = 0; i < s.length; i++) { const c = s[i]', '    for i, c in enumerate(s):'],
  ['    if (inStack.has(c)) continue', '        if c in in_stack: continue'],
  ['    while (stack.length && stack[stack.length - 1] > c && last[stack[stack.length - 1]] > i) {', '        while stack and stack[-1] > c and last[stack[-1]] > i:'],
  ['      const top = stack.pop()', '            top = stack.pop()'],
  ['      inStack.delete(top)', '            in_stack.discard(top)'],
  ['    }', ''],
  ['    stack.push(c)', '        stack.append(c)'],
  ['    inStack.add(c)', '        in_stack.add(c)'],
  ['  }', ''],
  ["  return stack.join('')", "    return ''.join(stack)"],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = codeLines.findIndex(c => c.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ s }) {
  const last = {}
  for (let i = 0; i < s.length; i++) last[s[i]] = i
  const stack = []
  const inStack = new Set()
  const frames = []
  const frame = (phase, activeKey, pyKey, index, message) => frames.push({ phase, pythonLine: P(pyKey), activeLine: L(activeKey), index, stack: [...stack], inStack: [...inStack], message })
  frame('start', 'const last = {}', 'last = {}', -1, 'Record where each letter last appears in s.')
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    frame('scan', 'const c = s[i]', 'for i, c in enumerate(s)', i, `Look at ${c} at position ${i}.`)
    if (inStack.has(c)) {
      frame('skip', 'if (inStack.has(c)) continue', 'if c in in_stack', i, `${c} is already in the stack, so this copy is skipped.`)
      continue
    }
    while (stack.length && stack[stack.length - 1] > c && last[stack[stack.length - 1]] > i) {
      const top = stack.pop()
      inStack.delete(top)
      frame('pop', 'const top = stack.pop()', 'top = stack.pop()', i, `${top} is larger than ${c} and appears again later, so it is removed.`)
    }
    stack.push(c)
    inStack.add(c)
    frame('push', 'stack.push(c)', 'stack.append(c)', i, `Push ${c}. The stack reads ${stack.join('')}.`)
  }
  const result = stack.join('')
  frame('done', "return stack.join('')", "return ''.join(stack)", -1, `Smallest subsequence: ${result}.`)
  return { input: { s }, result, frames }
}
