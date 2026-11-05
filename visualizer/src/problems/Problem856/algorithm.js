export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 2 || s.length > 50 || !/^[()]+$/.test(s)) throw new Error('Enter a JSON string of 2–50 parentheses.')
  let depth = 0
  for (const ch of s) {
    depth += ch === '(' ? 1 : -1
    if (depth < 0) throw new Error('Parentheses must be balanced.')
  }
  if (depth !== 0) throw new Error('Parentheses must be balanced.')
  return s
}

const JS_LINES = [
  'function scoreOfParentheses(s) {',
  '  const stack = [0] // stack[k] = score collected inside the k-th open pair',
  '  for (const ch of s) {',
  '    if (ch === \'(\') stack.push(0) // open a new pair with score 0',
  '    else {',
  '      const inside = stack.pop() // close the innermost pair',
  '      stack[stack.length - 1] += Math.max(2 * inside, 1) // "()" is 1; "(A)" doubles A',
  '    }',
  '  }',
  '  return stack[0] // the outer level holds the answer',
  '}',
]
const PY_LINES = [
  'def score_of_parentheses(s):',
  '    stack = [0]',
  '    for ch in s:',
  '        if ch == \'(\':',
  '            stack.append(0)',
  '        else:',
  '            inside = stack.pop()',
  '            stack[-1] += max(2 * inside, 1)',
  '    return stack[0]',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// A stack holds one running score per open pair. A closed pair "(A)" is worth twice A; the bare pair "()" is worth 1.
export function buildTrace(s) {
  const stack = [0]
  const frames = [{ phase: 'start', pos: -1, stack: [...stack], activeLine: L('const stack = [0]'), pythonLine: P('stack = [0]'), message: 'The outer level starts with score 0.' }]
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(0)
      frames.push({ phase: 'open', pos: i, stack: [...stack], activeLine: L("stack.push(0)"), pythonLine: P('stack.append(0)'), message: `"(" at ${i} opens a pair with score 0.` })
    } else {
      const inside = stack.pop()
      const add = Math.max(2 * inside, 1)
      stack[stack.length - 1] += add
      frames.push({ phase: inside === 0 ? 'bare' : 'nested', pos: i, stack: [...stack], inside, add, activeLine: L('const inside = stack.pop()'), pythonLine: P('inside = stack.pop()'),
        message: inside === 0 ? `")" at ${i} closes "()": it adds 1 to the outer level.` : `")" at ${i} closes a pair holding ${inside}: it adds ${add} (twice ${inside}).` })
    }
  }
  const result = stack[0]
  frames.push({ phase: 'done', pos: s.length, stack: [...stack], result, activeLine: L('return stack[0]'), pythonLine: P('return stack[0]'), message: `Score of the whole string: ${result}.` })
  return { input: s, result, frames }
}
