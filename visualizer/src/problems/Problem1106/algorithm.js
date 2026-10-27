export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.expression !== 'string') throw new Error('Use an object with a string expression, for example {"expression":"|(&(t,f,t),!(t))"}.')
  if (data.expression.length < 1 || data.expression.length > 60) throw new Error('expression must have 1 to 60 characters.')
  if (!/^[tf!&|(),]+$/.test(data.expression)) throw new Error('expression may contain only t, f, !, &, |, (, ), and commas.')
  return { expression: data.expression }
}

export function buildTrace({ expression }) {
  const frames = []
  let pos = 0
  const fail = message => { throw new Error(message) }
  frames.push({ phase: 'start', activeLine: L('set position to 0'), at: 0, value: null, message: 'Read the expression from left to right. Each operator waits for its operands, then combines them.' })
  function parse() {
    const ch = expression[pos]
    if (ch === undefined) fail('The expression ends too early.')
    if (ch === 't' || ch === 'f') {
      pos += 1
      const value = ch === 't'
      frames.push({ phase: 'leaf', activeLine: L('return true for t'), at: pos - 1, value, message: `${ch} is ${value}.` })
      return value
    }
    if (ch !== '!' && ch !== '&' && ch !== '|') fail(`Unexpected character ${ch}.`)
    if (expression[pos + 1] !== '(') fail(`${ch} must be followed by an open bracket.`)
    pos += 2
    const values = [parse()]
    while (expression[pos] === ',') {
      pos += 1
      values.push(parse())
    }
    if (expression[pos] !== ')') fail('A close bracket is missing.')
    pos += 1
    if (ch === '!' && values.length !== 1) fail('! takes exactly one operand.')
    const value = ch === '!' ? !values[0] : ch === '&' ? values.every(Boolean) : values.some(Boolean)
    const word = ch === '!' ? 'NOT' : ch === '&' ? 'AND' : 'OR'
    frames.push({ phase: 'combine', activeLine: L('otherwise return true if any'), at: pos - 1, value, message: `${word} of ${values.map(v => (v ? 't' : 'f')).join(', ')} is ${value}.` })
    return value
  }
  const result = parse()
  if (pos !== expression.length) fail('Extra characters follow the expression.')
  frames.push({ phase: 'done', activeLine: L('return the value from parse'), at: expression.length - 1, value: result, message: `The whole expression is ${result}.` })
  return { input: { expression }, result, frames }
}

export const code = `parsing a boolean expression (expression)
  set position to 0
  call parse to read the whole expression
  if position is not at the end of expression then
    report an error
  return the value from parse

parse
  read the character at position
  if it is t or f then
    move past it and return true for t, false for f
  move past the operator and its open bracket
  read the operands separated by commas, each by calling parse
  move past the close bracket
  if the operator is ! then
    return the negation of its single operand
  if the operator is & then
    return true only if every operand is true
  otherwise return true if any operand is true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def parse_bool_expr(expression):
    pos = 0

    def parse():
        nonlocal pos
        ch = expression[pos]
        if ch in 'tf':
            pos += 1
            return ch == 't'
        pos += 2
        values = [parse()]
        while expression[pos] == ',':
            pos += 1
            values.append(parse())
        pos += 1
        if ch == '!':
            return not values[0]
        if ch == '&':
            return all(values)
        return any(values)

    return parse()
`
