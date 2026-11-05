export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.expression !== 'string') throw new Error('Use an object with a string expression, for example {"expression":"|(&(t,f,t),!(t))"}.')
  if (data.expression.length < 1 || data.expression.length > 60) throw new Error('expression must have 1 to 60 characters.')
  if (!/^[tf!&|(),]+$/.test(data.expression)) throw new Error('expression may contain only t, f, !, &, |, (, ), and commas.')
  return { expression: data.expression }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function parseBoolExpr(expression) {', 'def parse_bool_expr(expression):'],
  ['  let pos = 0', '    pos = 0'],
  ['  const parse = () => {', '    def parse():'],
  ['    // pos is shared with the code that calls parse', '        nonlocal pos'],
  ['    const ch = expression[pos]', '        ch = expression[pos]'],
  ["    if (ch === 't' || ch === 'f') {", "        if ch in 'tf':"],
  ["      pos += 1; return ch === 't'", "            pos += 1; return ch == 't'"],
  ['    }', ''],
  ['    pos += 2', '        pos += 2'],
  ['    const values = [parse()]', '        values = [parse()]'],
  ["    while (expression[pos] === ',') {", "        while expression[pos] == ',':"],
  ['      pos += 1', '            pos += 1'],
  ['      values.push(parse())', '            values.append(parse())'],
  ['    }', ''],
  ['    pos += 1', '        pos += 1'],
  ["    if (ch === '!') return !values[0]", "        if ch == '!': return not values[0]"],
  ["    if (ch === '&') return values.every(Boolean)", "        if ch == '&': return all(values)"],
  ['    return values.some(Boolean)', '        return any(values)'],
  ['  }', ''],
  ['  const result = parse()', '    result = parse()'],
  ["  if (pos !== expression.length) throw new Error('Extra characters follow the expression.')", "    if pos != len(expression): raise ValueError('extra characters')"],
  ['  return result', '    return result'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ expression }) {
  const frames = []
  let pos = 0
  const fail = message => { throw new Error(message) }
  frames.push({ phase: 'start', activeLine: L('let pos = 0'), pythonLine: P('pos = 0'), at: 0, value: null, message: 'Read the expression from left to right. Each operator waits for its operands, then combines them.' })
  function parse() {
    const ch = expression[pos]
    if (ch === undefined) fail('The expression ends too early.')
    if (ch === 't' || ch === 'f') {
      pos += 1
      const value = ch === 't'
      frames.push({ phase: 'leaf', activeLine: L("return ch === 't'"), pythonLine: P("return ch == 't'"), at: pos - 1, value, message: `${ch} is ${value}.` })
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
    frames.push({ phase: 'combine', activeLine: L(ch === '!' ? "if (ch === '!')" : ch === '&' ? "if (ch === '&')" : 'return values.some'), pythonLine: ch === '!' ? P('return not values[0]') : ch === '&' ? P('return all(values)') : P('return any(values)'), at: pos - 1, value, message: `${word} of ${values.map(v => (v ? 't' : 'f')).join(', ')} is ${value}.` })
    return value
  }
  const result = parse()
  if (pos !== expression.length) fail('Extra characters follow the expression.')
  frames.push({ phase: 'done', activeLine: L('const result = parse()'), pythonLine: P('return result'), at: expression.length - 1, value: result, message: `The whole expression is ${result}.` })
  return { input: { expression }, result, frames }
}
