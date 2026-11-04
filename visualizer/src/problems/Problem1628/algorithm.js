const OPS = ['+', '-', '*', '/']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.postfix) || input.postfix.length < 1 || input.postfix.length > 15) throw new Error('postfix is a list of 1 to 15 tokens.')
  for (const tok of input.postfix) {
    if (typeof tok !== 'string' || !(OPS.includes(tok) || /^\d$/.test(tok))) throw new Error('Tokens are single digits or one of + - * /.')
  }
  return input
}

export function buildTrace({ postfix }) {
  const stack = []
  const trees = []
  const frames = [{ phase: 'start', pythonLine: PL('stack = []'), activeLine: L('start with an empty stack'), state: [], trees: [], message: 'The stack of subtrees is empty.' }]
  for (const tok of postfix) {
    if (!OPS.includes(tok)) {
      stack.push(Number(tok))
      trees.push({ label: tok, value: Number(tok), children: [] })
      frames.push({ phase: 'leaf', pythonLine: PL('stack.append(int(tok))'), activeLine: L('if the token is a number'), state: stack.map(String), trees: [...trees], message: `Push leaf ${tok}.` })
      continue
    }
    if (stack.length < 2) throw new Error(`Operator ${tok} needs two operands.`)
    const right = stack.pop()
    const left = stack.pop()
    const rightTree = trees.pop()
    const leftTree = trees.pop()
    if (tok === '/' && right === 0) throw new Error('Division by zero.')
    const value = tok === '+' ? left + right : tok === '-' ? left - right : tok === '*' ? left * right : Math.trunc(left / right)
    const line = tok === '+' ? PL('stack.append(left + right)') : tok === '-' ? PL('stack.append(left - right)') : tok === '*' ? PL('stack.append(left * right)') : PL('stack.append(int(left / right))')
    stack.push(value)
    trees.push({ label: tok, value, children: [leftTree, rightTree] })
    frames.push({ phase: 'combine', pythonLine: line, activeLine: L('pop the right and left'), state: stack.map(String), trees: [...trees], message: `${left} ${tok} ${right} = ${value}.` })
  }
  if (stack.length !== 1) throw new Error('The tokens do not form one expression.')
  frames.push({ phase: 'done', pythonLine: PL('return stack[0]'), activeLine: L('return its value'), state: stack.map(String), trees: [...trees], message: `The tree evaluates to ${stack[0]}.` })
  return { input: { postfix }, result: stack[0], frames }
}

export const code = `expression tree from postfix tokens
  start with an empty stack of subtrees
  for each token in order
    if the token is a number then push a leaf
    otherwise pop the right and left subtrees, combine them under the operator and push the result
  evaluate the single remaining tree
  return its value`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def evaluate_postfix(tokens):
    stack = []
    for tok in tokens:
        if tok in "+-*/":
            right = stack.pop()
            left = stack.pop()
            if tok == "+":
                stack.append(left + right)
            elif tok == "-":
                stack.append(left - right)
            elif tok == "*":
                stack.append(left * right)
            else:
                stack.append(int(left / right))
        else:
            stack.append(int(tok))
    return stack[0]
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
