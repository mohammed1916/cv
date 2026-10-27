export function parseInput(text) {
  const expr = JSON.parse(text)
  if (typeof expr !== 'string' || expr.length < 1 || expr.length > 40 || !/^[0-9+\-*/()]+$/.test(expr)) {
    throw new Error('Enter an expression of digits, + - * / and parentheses, up to 40 characters (no spaces).')
  }
  return expr
}

const tokenize = expr => expr.match(/\d+|[-+*/()]/g) ?? []

export function buildTrace(expr) {
  const tokens = tokenize(expr)
  let pos = 0
  const frames = [{ phase: 'start', activeLine: L('tokens = re.findall'), a: null, op: null, b: null, value: null, message: 'Read the expression left to right. * and / are applied before + and -.' }]
  const apply = (a, op, b) => {
    let value, activeLine
    if (op === '+') { value = a + b; activeLine = L('value = value + right') }
    else if (op === '-') { value = a - b; activeLine = L('value = value - right') }
    else if (op === '*') { value = a * b; activeLine = L('value = value * right') }
    else {
      if (b === 0) throw new Error('Division by zero.')
      value = Math.trunc(a / b)
      activeLine = L('value = int(value / right)')
    }
    frames.push({ phase: 'apply', activeLine, a, op, b, value, message: `${a} ${op} ${b} = ${value}.` })
    return value
  }
  const expression = () => {
    let value = term()
    while (tokens[pos] === '+' || tokens[pos] === '-') {
      const op = tokens[pos++]
      value = apply(value, op, term())
    }
    return value
  }
  const term = () => {
    let value = factor()
    while (tokens[pos] === '*' || tokens[pos] === '/') {
      const op = tokens[pos++]
      value = apply(value, op, factor())
    }
    return value
  }
  const factor = () => {
    if (tokens[pos] === '(') {
      pos++
      const value = expression()
      if (tokens[pos] !== ')') throw new Error('Missing closing parenthesis.')
      pos++
      return value
    }
    const token = tokens[pos++]
    if (token === undefined || !/^\d+$/.test(token)) throw new Error('Expected a number.')
    return Number(token)
  }
  const result = expression()
  if (pos !== tokens.length) throw new Error('Unexpected token.')
  frames.push({ phase: 'done', activeLine: L('return value'), a: null, op: null, b: null, value: result, message: `The expression evaluates to ${result}.` })
  return { input: expr, result, frames }
}

export const code = `def calculate(s):
    tokens = re.findall(r'\\d+|[-+*/()]', s)
    pos = 0
    def expression():
        nonlocal pos
        value = term()
        while pos < len(tokens) and tokens[pos] in ('+', '-'):
            op = tokens[pos]
            pos += 1
            right = term()
            if op == '+':
                value = value + right
            else:
                value = value - right
        return value
    def term():
        nonlocal pos
        value = factor()
        while pos < len(tokens) and tokens[pos] in ('*', '/'):
            op = tokens[pos]
            pos += 1
            right = factor()
            if op == '*':
                value = value * right
            else:
                value = int(value / right)
        return value
    def factor():
        nonlocal pos
        if tokens[pos] == '(':
            pos += 1
            value = expression()
            pos += 1
            return value
        pos += 1
        return int(tokens[pos - 1])
    return expression()`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
