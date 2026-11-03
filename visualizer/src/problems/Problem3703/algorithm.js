const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[()]+$/.test(s)) throw new Error('s has 1 to 30 parentheses.')
  if (!Number.isInteger(k) || k < 1 || k > 5) throw new Error('k is an integer from 1 to 5.')
  return { s, k }
}

export function buildTrace({ s, k }) {
  const pattern = '('.repeat(k) + ')'.repeat(k)
  const stack = []
  const frames = []
  for (const ch of s) {
    stack.push(ch)
    const top = stack.slice(-2 * k).join('')
    const matched = stack.length >= 2 * k && top === pattern
    frames.push({ pythonLine: PY('stack.append'), phase: 'push', activeLine: L('push'), stack: [...stack], matched, message: `Push ${ch}.` })
    if (matched) {
      stack.splice(stack.length - 2 * k, 2 * k)
      frames.push({ pythonLine: PY('del stack'), phase: 'remove', activeLine: L('delete'), stack: [...stack], matched: true, message: `The top ${2 * k} symbols form a k-balanced block; they are deleted.` })
    }
  }
  const result = stack.join('')
  frames.push({ pythonLine: PY('return'), phase: 'done', activeLine: L('return'), stack: [...stack], matched: false, message: `Final string: ${result === '' ? '(empty)' : result}.` })
  return { input: { s, k }, result, frames }
}

export const code = [
  'remove k-balanced blocks until none remain',
  '  stack = empty',
  '  for each character',
  '    push it onto the stack',
  '    if the top 2k symbols are k opens then k closes, delete them',
  '  return the stack contents',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def remove_k_balanced(s, k):
    pattern = '(' * k + ')' * k
    stack = []
    for ch in s:
        stack.append(ch)
        if len(stack) >= 2 * k and ''.join(stack[-2 * k:]) == pattern:
            del stack[-2 * k:]
    return ''.join(stack)
`
