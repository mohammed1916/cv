export const phases = [
  { id: 'start', label: 'Empty stack', description: 'Start with an empty stack. Numbers wait on it until an operator needs them.' },
  { id: 'push', label: 'Push a number', description: 'A number token goes on top of the stack.' },
  { id: 'apply', label: 'Apply an operator', description: 'An operator takes the top two values. The right operand is the one pushed last.' },
  { id: 'done', label: 'Complete', description: 'When the tokens are used up, exactly one value remains: the answer.' },
]

const OPERATORS = ['+', '-', '*', '/']

export function parseInput(text) {
  const tokens = JSON.parse(text)
  if (!Array.isArray(tokens) || tokens.length < 1 || tokens.length > 15) throw new Error('Enter a JSON array of 1 to 15 tokens, such as ["2","1","+"].')
  tokens.forEach((t, i) => {
    if (typeof t !== 'string' || !(OPERATORS.includes(t) || (/^-?\d+$/.test(t) && Math.abs(Number(t)) <= 20))) {
      throw new Error(`Token ${i + 1} must be +, -, *, / or an integer from -20 to 20 written as a string.`)
    }
  })
  return tokens
}

export function buildTrace(tokens) {
  const stack = []
  const snap = (token, operands = null, value = null) => ({ stack: [...stack], token, operands, value })
  const frames = [{
    phase: 'start', activeLine: L('stack = empty list'), pythonLine: P('stack = []'), snapshot: snap(null),
    message: 'The stack is empty. Read the tokens from left to right.',
  }]
  tokens.forEach((token, i) => {
    if (OPERATORS.includes(token)) {
      if (stack.length < 2) throw new Error(`Token ${i + 1}: ${token} needs two values on the stack.`)
      const right = stack.pop()
      const left = stack.pop()
      if (token === '/' && right === 0) throw new Error(`Token ${i + 1}: division by zero.`)
      const value = token === '+' ? left + right
        : token === '-' ? left - right
          : token === '*' ? left * right
            : (Math.trunc(left / right) || 0)
      if (Math.abs(value) > 1e9) throw new Error('An intermediate value is too large for this visual.')
      stack.push(value)
      frames.push({
        phase: 'apply', activeLine: L('result = left op right'), pythonLine: P('stack.append(result)'), snapshot: snap(token, [left, right], value),
        message: `${token} takes ${left} (left) and ${right} (right). ${token === '/' ? 'Division truncates toward zero. ' : ''}The result ${value} goes back on the stack.`,
      })
    } else {
      stack.push(Number(token))
      frames.push({
        phase: 'push', activeLine: L('push the integer t'), pythonLine: P('stack.append(int(token))'), snapshot: snap(token),
        message: `${token} is a number, so it goes on the stack.`,
      })
    }
  })
  if (stack.length !== 1) throw new Error(`The tokens leave ${stack.length} values on the stack; exactly one must remain.`)
  const result = stack[0]
  frames.push({
    phase: 'done', activeLine: L('return the only value'), pythonLine: P('return stack[-1]'), snapshot: snap(null, null, result),
    message: `Only ${result} is left on the stack, so that is the value of the expression.`,
  })
  return { input: tokens, result, frames }
}

export const code = `evaluate rpn (tokens):
  stack = empty list
  for each token t in tokens:
    if t is an operator:
      right = pop the stack
      left = pop the stack
      result = left op right, division truncated toward zero
      push result onto stack
    else:
      push the integer t onto stack
  return the only value left on the stack`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def eval_rpn(tokens):
    stack = []
    for token in tokens:
        if token in ('+', '-', '*', '/'):
            right = stack.pop()
            left = stack.pop()
            if token == '+':
                result = left + right
            elif token == '-':
                result = left - right
            elif token == '*':
                result = left * right
            else:
                quotient = abs(left) // abs(right)
                result = quotient if (left < 0) == (right < 0) else -quotient
            stack.append(result)
        else:
            stack.append(int(token))
    return stack[-1]
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
