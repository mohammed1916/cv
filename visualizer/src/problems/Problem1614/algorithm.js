export const phases = [
  { id: 'start', label: 'Start', description: 'Start with depth 0 and no best depth seen yet.' },
  { id: 'other', label: 'Other character', description: 'Digits, operators and spaces do not change the depth.' },
  { id: 'open', label: 'Open', description: 'An opening parenthesis enters a deeper group, so depth rises and the best depth may update.' },
  { id: 'close', label: 'Close', description: 'A closing parenthesis leaves a group, so depth falls.' },
  { id: 'done', label: 'Complete', description: 'After the last character, the best depth seen is the answer.' },
]

const ALLOWED = /^[0-9+\-*/() ]+$/

export function parseInput(text) {
  const expr = text.trim()
  if (expr.length < 1 || expr.length > 60) throw new Error('Enter an expression of 1 to 60 characters.')
  if (!ALLOWED.test(expr)) throw new Error('Use digits, + - * /, parentheses and spaces only.')
  let depth = 0
  for (const ch of expr) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (depth < 0) throw new Error('A closing parenthesis appears before its opening partner.')
  }
  if (depth !== 0) throw new Error('Every opening parenthesis needs a closing partner.')
  return expr
}

export const code = [
  "function maxDepth(expr) {",
  "  let depth = 0;",
  "  let best = 0;",
  "  for (const ch of expr) {",
  "    if (ch === '(') {",
  "      depth++;",
  "      best = Math.max(best, depth);",
  "    } else if (ch === ')') {",
  "      depth--;",
  "    }",
  "  }",
  "  return best;",
  "}",
].map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def max_depth(expr):
    depth = 0
    best = 0
    for ch in expr:
        if ch == '(':
            depth += 1
            best = max(best, depth)
        elif ch == ')':
            depth -= 1
    return best
`

const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (phase, pseudo, py, message, snapshot) => ({ phase, activeLine: L(pseudo), pythonLine: P(py), message, snapshot })

export function buildTrace(expr) {
  let depth = 0
  let best = 0
  const snap = (index, ch) => ({ expr, index, ch, depth, best })
  const frames = [at('start', 'let depth = 0', 'depth = 0', `Walk the expression left to right with depth 0. The expression has ${expr.length} characters.`, snap(null, null))]
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i]
    if (ch === '(') {
      depth += 1
      best = Math.max(best, depth)
      frames.push(at('open', 'depth++', 'depth += 1', `"(" at position ${i + 1} opens a group. Depth is now ${depth}; best is ${best}.`, snap(i, ch)))
    } else if (ch === ')') {
      depth -= 1
      frames.push(at('close', 'depth--', 'depth -= 1', `")" at position ${i + 1} closes a group. Depth falls to ${depth}; best stays ${best}.`, snap(i, ch)))
    } else {
      frames.push(at('other', 'for (const ch of expr)', 'for ch in expr', `"${ch}" at position ${i + 1} does not change depth, which stays ${depth}.`, snap(i, ch)))
    }
  }
  frames.push(at('done', 'return best;', 'return best', `The deepest point reached has depth ${best}.`, snap(null, null)))
  return { input: expr, result: best, frames }
}
