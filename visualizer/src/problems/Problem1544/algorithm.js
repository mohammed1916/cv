export const phases = [
  { id: 'start', label: 'Start', description: 'Scan left to right and keep the reduced prefix on a stack.' },
  { id: 'inspect', label: 'Compare with top', description: 'Check whether the new letter is the same letter in the opposite case as the stack top.' },
  { id: 'cancel', label: 'Cancel pair', description: 'The pair is removed, which may expose earlier letters for later cancellations.' },
  { id: 'push', label: 'Keep letter', description: 'No cancellation applies, so the letter joins the reduced prefix.' },
  { id: 'done', label: 'Complete', description: 'The stack holds the final string.' },
]

export function parseInput(text) {
  const s = text.trim()
  if (!/^[A-Za-z]{1,40}$/.test(s)) throw new Error('Enter 1 to 40 English letters, without spaces.')
  return s
}

const opposite = (a, b) => a !== b && a.toLowerCase() === b.toLowerCase()

export function buildTrace(s) {
  const frames = []
  const stack = []
  const snap = (index, char, extra = {}) => ({ index, char, stack: [...stack], top: stack.length ? stack[stack.length - 1] : null, ...extra })
  frames.push({ phase: 'start', activeLine: L('stack = []'), pythonLine: P('stack = []'), snapshot: snap(null, null), message: 'The stack starts empty. Each letter either cancels the top or is kept.' })
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    const top = stack.length ? stack[stack.length - 1] : null
    frames.push({ phase: 'inspect', activeLine: L('if stack and'), pythonLine: P('if stack and'), snapshot: snap(i, ch), message: top === null ? `Letter ${ch} has an empty stack beneath it.` : `Compare ${ch} with the top ${top}.` })
    if (top !== null && opposite(top, ch)) {
      stack.pop()
      frames.push({ phase: 'cancel', activeLine: L('stack.pop()'), pythonLine: P('stack.pop()'), snapshot: snap(i, ch), message: `${top} and ${ch} are the same letter in opposite cases, so both disappear.` })
    } else {
      stack.push(ch)
      frames.push({ phase: 'push', activeLine: L('stack.append(ch)'), pythonLine: P('stack.append(ch)'), snapshot: snap(i, ch), message: `${ch} cannot cancel, so it stays on the stack.` })
    }
  }
  const result = stack.join('')
  frames.push({ phase: 'done', activeLine: L('return'), pythonLine: P('return'), snapshot: snap(null, null, { result }), message: result === '' ? 'Everything cancelled, so the answer is an empty string.' : `The final string is ${result}.` })
  return { input: s, result, frames }
}

export const code = `make good (s):
  stack = []
  for ch in s:
    if stack and ch is the opposite case of stack top:
      stack.pop()
    else:
      stack.append(ch)
  return join(stack)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def make_good(s):
    stack = []
    for ch in s:
        if stack and stack[-1] != ch and stack[-1].lower() == ch.lower():
            stack.pop()
        else:
            stack.append(ch)
    return "".join(stack)
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
