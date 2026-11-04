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
  const frames = [{ phase: 'start', pythonLine: PL('stack = []'), activeLine: L('const stack = []'), state: [], trees: [], message: 'The stack of subtrees is empty.' }]
  for (const tok of postfix) {
    if (!OPS.includes(tok)) {
      stack.push(Number(tok))
      trees.push({ label: tok, value: Number(tok), children: [] })
      frames.push({ phase: 'leaf', pythonLine: PL('stack.append(int(tok))'), activeLine: L('stack.push(Number(tok))'), state: stack.map(String), trees: [...trees], message: `Push leaf ${tok}.` })
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
    frames.push({ phase: 'combine', pythonLine: line, activeLine: L('const right = stack.pop()'), state: stack.map(String), trees: [...trees], message: `${left} ${tok} ${right} = ${value}.` })
  }
  if (stack.length !== 1) throw new Error('The tokens do not form one expression.')
  frames.push({ phase: 'done', pythonLine: PL('return stack[0]'), activeLine: L('return stack[0]'), state: stack.map(String), trees: [...trees], message: `The tree evaluates to ${stack[0]}.` })
  return { input: { postfix }, result: stack[0], frames }
}

export const code = [
  "function evaluateExpressionTree(postfix) {",
  "  const stack = [];",
  "  for (const tok of postfix) {",
  "    if (!OPS.includes(tok)) {",
  "      stack.push(Number(tok));",
  "    } else {",
  "      const right = stack.pop();",
  "      const left = stack.pop();",
  "      if (tok === '+') stack.push(left + right);",
  "      else if (tok === '-') stack.push(left - right);",
  "      else if (tok === '*') stack.push(left * right);",
  "      else stack.push(Math.trunc(left / right));",
  "    }",
  "  }",
  "  return stack[0];",
  "}",
].map((text, index) => ({ line: index + 1, text }))
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
