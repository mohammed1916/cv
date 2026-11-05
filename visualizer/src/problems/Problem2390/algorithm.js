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
  const removedPairs = []
  const frames = [{ phase: 'start', activeLine: L('const stack = []'), pythonLine: P('stack = []'), i: -1, stack: [], pairs: [], message: 'Read the string left to right with an empty stack of letter positions.' }]
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '*') {
      const top = stack.pop()
      removedPairs.push([top, i])
      frames.push({ phase: 'star', activeLine: L('stack.pop()'), pythonLine: P('stack.pop()'), i, stack: stack.map(p => ({ p, ch: s[p] })), pairs: [...removedPairs], message: `The star at ${i} removes the letter ${s[top]} at ${top}, the closest letter still on the stack.` })
    } else {
      stack.push(i)
      frames.push({ phase: 'letter', activeLine: L('stack.push(c)'), pythonLine: P('stack.append(c)'), i, stack: stack.map(p => ({ p, ch: s[p] })), pairs: [...removedPairs], message: `Push ${s[i]} at ${i} onto the stack.` })
    }
  }
  const result = stack.map(p => s[p]).join('')
  frames.push({ phase: 'done', activeLine: L('return stack.join'), pythonLine: P("return ''.join(stack)"), i: s.length, stack: stack.map(p => ({ p, ch: s[p] })), pairs: [...removedPairs], message: `Remaining string: ${result || '(empty)'}.` })
  return { input, result, frames }
}

export const code = `function removeStars(s) {
  const stack = []
  for (const c of s) {
    if (c === '*') {
      stack.pop()
    } else {
      stack.push(c)
    }
  }
  return stack.join('')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def remove_stars(s):
    stack = []
    for c in s:
        if c == '*':
            stack.pop()
        else:
            stack.append(c)
    return ''.join(stack)
`
