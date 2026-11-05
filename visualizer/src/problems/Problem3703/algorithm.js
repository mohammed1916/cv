
const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

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
    frames.push({ pythonLine: PY('stack.append'), phase: 'push', activeLine: L('stack.push(ch)'), stack: [...stack], matched, message: `Push ${ch}.` })
    if (matched) {
      stack.splice(stack.length - 2 * k, 2 * k)
      frames.push({ pythonLine: PY('del stack'), phase: 'remove', activeLine: L('stack.length -= 2 * k'), stack: [...stack], matched: true, message: `The top ${2 * k} symbols form a k-balanced block; they are deleted.` })
    }
  }
  const result = stack.join('')
  frames.push({ pythonLine: PY('return'), phase: 'done', activeLine: L('return stack.join'), stack: [...stack], matched: false, message: `Final string: ${result === '' ? '(empty)' : result}.` })
  return { input: { s, k }, result, frames }
}

export const code = `function removeKBalanced(s, k) {
  const pattern = '('.repeat(k) + ')'.repeat(k)
  const stack = []
  for (const ch of s) {
    stack.push(ch)
    if (stack.length >= 2 * k && stack.slice(-2 * k).join('') === pattern) {
      stack.length -= 2 * k
    }
  }
  return stack.join('')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}

export const python = `def remove_k_balanced(s, k):
    pattern = '(' * k + ')' * k
    stack = []
    for ch in s:
        stack.append(ch)
        if len(stack) >= 2 * k and ''.join(stack[-2 * k:]) == pattern:
            del stack[-2 * k:]
    return ''.join(stack)
`
