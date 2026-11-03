// Evaluate a valid nested expression.
// Grammar: expr := signed integer | op "(" expr "," expr ")" with op one of add, sub, mul, div.
// Division is exact. The parser is recursive descent; each call pushes a frame onto a stack of open calls,
// and the stack is shown while its arguments are read.

const CODE_TEXT = `FUNCTION evaluate(text)
    pos ← 0
    FUNCTION expr()
        IF text at pos starts a call add( sub( mul( div(
            op ← that name; pos ← position after "("
            left ← expr()
            expect "," at pos; pos ← pos + 1
            right ← expr()
            expect ")" at pos; pos ← pos + 1
            RETURN apply(op, left, right)
        ELSE
            read a signed integer literal at pos; pos ← after it
            RETURN its value
    result ← expr()
    expect the end of text
    RETURN result`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `import re

CALL = re.compile(r"(add|sub|mul|div)\\(")
LITERAL = re.compile(r"-?\\d+")


def evaluate(text):
    pos = 0

    def expr():
        nonlocal pos
        call = CALL.match(text, pos)
        if call is None:
            literal = LITERAL.match(text, pos)
            if literal is None:
                raise ValueError("expected a literal or a call")
            pos = literal.end()
            return int(literal.group())
        op = call.group(1)
        pos = call.end()
        left = expr()
        if text[pos:pos + 1] != ",":
            raise ValueError("expected a comma")
        pos += 1
        right = expr()
        if text[pos:pos + 1] != ")":
            raise ValueError("expected a closing parenthesis")
        pos += 1
        if op == "add":
            return left + right
        if op == "sub":
            return left - right
        if op == "mul":
            return left * right
        if right == 0:
            raise ValueError("division by zero")
        return left // right

    result = expr()
    if pos != len(text):
        raise ValueError("unexpected text after the expression")
    return result


if __name__ == "__main__":
    import json
    import sys
    print(json.dumps(evaluate(json.loads(sys.stdin.read()))))
`

const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Parse', description: 'Start at the first character of the expression.' },
  { id: 'open', label: 'Open call', description: 'A function name opens a call; its arguments come next.' },
  { id: 'literal', label: 'Literal', description: 'Read a signed integer.' },
  { id: 'combine', label: 'Combine', description: 'Both arguments are known; apply the operation.' },
  { id: 'done', label: 'Result', description: 'The whole text was consumed; report the value.' },
]

export function parseInput(text) {
  const expression = JSON.parse(text)
  if (typeof expression !== 'string' || expression.length < 1 || expression.length > 80) throw new Error('Use a JSON string of at most 80 characters.')
  if (!/^[a-z0-9,()\-]+$/.test(expression)) throw new Error('Use only add, sub, mul, div, digits, minus signs, commas and parentheses.')
  return expression
}

const CALL = /(add|sub|mul|div)\(/y
const LITERAL = /-?\d+/y

export function buildTrace(text) {
  const frames = []
  const stack = []
  let pos = 0
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message, pos, stack: stack.map(frame => ({ op: frame.op, args: [...frame.args] })),
    value: null, consumed: pos, ...extra,
  })
  const apply = (op, a, b) => {
    if (op === 'add') return a + b
    if (op === 'sub') return a - b
    if (op === 'mul') return a * b
    if (b === 0) throw new Error('division by zero')
    return Math.trunc(a / b)
  }
  function expr() {
    CALL.lastIndex = pos
    const call = CALL.exec(text)
    if (!call) {
      LITERAL.lastIndex = pos
      const literal = LITERAL.exec(text)
      if (!literal) throw new Error(`Expected a literal or a call at position ${pos}.`)
      pos += literal[0].length
      const value = Number(literal[0])
      push('literal', 'read a signed integer literal', 'literal = LITERAL.match', `Read the literal ${value}.`, { value })
      return value
    }
    const op = call[1]
    pos += call[0].length
    const frame = { op, args: [] }
    stack.push(frame)
    push('open', 'IF text at pos starts a call', 'call = CALL.match', `Open ${op}( ; read its first argument.`)
    frame.args.push(expr())
    if (text[pos] !== ',') throw new Error(`Expected a comma at position ${pos}.`)
    pos += 1
    frame.args.push(expr())
    if (text[pos] !== ')') throw new Error(`Expected a closing parenthesis at position ${pos}.`)
    pos += 1
    const value = apply(op, frame.args[0], frame.args[1])
    stack.pop()
    push('combine', 'RETURN apply(op, left, right)', 'return left + right', `${op}(${frame.args[0]}, ${frame.args[1]}) = ${value}.`, { value })
    return value
  }
  push('start', 'pos ← 0', 'pos = 0', 'Start at the first character.')
  const result = expr()
  if (pos !== text.length) throw new Error(`Unexpected text after position ${pos}.`)
  push('done', 'RETURN result', 'return result', `Expression value: ${result}.`, { value: result })
  return { input: text, result, frames }
}
