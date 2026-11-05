// A polynomial is a Map from a monomial key (sorted variable names joined by '*') to a nonzero coefficient.
const keyOf = vars => vars.join('*')
const varsOf = key => (key === '' ? [] : key.split('*'))

export function tokenize(expression) {
  return expression.match(/[a-z]+|\d+|[()+\-*]/g) || []
}
export function compareKeys(a, b) {
  const x = varsOf(a), y = varsOf(b)
  if (x.length !== y.length) return y.length - x.length
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1
  return 0
}
export function formatPoly(poly) {
  const keys = [...poly.keys()].sort(compareKeys)
  return keys.map(k => [String(poly.get(k)), ...varsOf(k)].join('*'))
}
const clean = poly => { for (const [k, v] of [...poly]) if (v === 0) poly.delete(k); return poly }
function add(p, q, sign) {
  const r = new Map(p)
  for (const [k, v] of q) r.set(k, (r.get(k) || 0) + sign * v)
  return clean(r)
}
function mul(p, q) {
  const r = new Map()
  for (const [a, x] of p) for (const [b, y] of q) {
    const k = keyOf([...varsOf(a), ...varsOf(b)].sort())
    r.set(k, (r.get(k) || 0) + x * y)
  }
  return clean(r)
}
const show = poly => (poly.size ? formatPoly(poly).join(' + ') : '0')

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Enter a JSON object {"expression": "...", "evalvars": [...], "evalints": [...]}.')
  const { expression, evalvars, evalints } = obj
  if (typeof expression !== 'string' || expression.length < 1 || expression.length > 80) throw new Error('expression must be a string of 1-80 characters (visualization cap).')
  if (!/^[a-z0-9()+\-* ]+$/.test(expression)) throw new Error('expression may contain lowercase letters, digits, spaces, + - * and parentheses only.')
  if (!Array.isArray(evalvars) || !Array.isArray(evalints) || evalvars.length !== evalints.length || evalvars.length > 20) throw new Error('evalvars and evalints must be arrays of equal length (at most 20).')
  if (evalvars.some(v => typeof v !== 'string' || !/^[a-z]+$/.test(v)) || evalints.some(v => !Number.isInteger(v) || Math.abs(v) > 100)) throw new Error('evalvars are lowercase names; evalints are integers with absolute value at most 100.')
  if (new Set(evalvars).size !== evalvars.length) throw new Error('evalvars must be distinct.')
  const tokens = tokenize(expression)
  // Validate by dry run of the grammar.
  let pos = 0
  const fail = () => { throw new Error('expression is not a valid sum/product of terms, e.g. "(e + 8) * (e - 8)". Unary minus is not supported.') }
  const atom = () => { const t = tokens[pos++]; if (t === undefined) fail(); if (t === '(') { expr(); if (tokens[pos++] !== ')') fail() } else if (!/^[a-z]+$|^\d+$/.test(t)) fail() }
  const term = () => { atom(); while (tokens[pos] === '*') { pos++; atom() } }
  const expr = () => { term(); while (tokens[pos] === '+' || tokens[pos] === '-') { pos++; term() } }
  expr()
  if (pos !== tokens.length || tokens.length > 60) throw new Error('expression is not valid or has more than 60 tokens.')
  return { expression, evalvars, evalints }
}

export function buildTrace({ expression, evalvars, evalints }) {
  const env = new Map(evalvars.map((v, i) => [v, evalints[i]]))
  const tokens = tokenize(expression)
  const frames = [{ phase: 'start', activeLine: L('const tokens = expression.match'), pythonLine: 5, pos: 0, depth: 0, poly: '', message: `Tokenize "${expression}" into ${tokens.length} tokens. Known variables: ${evalvars.length ? evalvars.map((v, i) => `${v}=${evalints[i]}`).join(', ') : 'none'}.` }]
  let pos = 0
  let depth = 0
  const push = (phase, activeLine, message, poly, pythonLine) => frames.push({ phase, activeLine, pythonLine, pos, depth, poly: poly ? show(poly) : '', message })
  function atom() {
    const t = tokens[pos++]
    if (t === '(') {
      depth++
      push('atom', L("if (t === '(')"), 'Open parenthesis: parse the inner expression as its own polynomial.', undefined, 41)
      const p = expr()
      pos++
      depth--
      push('atom', L('skip the closing parenthesis'), `Close parenthesis: inner polynomial is ${show(p)}.`, p, 42)
      return p
    }
    let p
    let note
    let line = L('return constant(Number(t))')
    let pyLine = 44
    if (/^\d+$/.test(t)) { const v = Number(t); p = new Map(v ? [['', v]] : []); note = `Number ${t} is a constant term.` }
    else if (env.has(t)) { const v = env.get(t); p = new Map(v ? [['', v]] : []); line = L('if (env.has(t))'); pyLine = 46; note = `Variable ${t} is known (${v}), so it becomes the constant ${v}.` }
    else { p = new Map([[t, 1]]); line = L('return new Map([[t, 1]])'); pyLine = 48; note = `Variable ${t} is unknown, so it stays symbolic as 1*${t}.` }
    push('atom', line, note, p, pyLine)
    return p
  }
  function term() {
    let p = atom()
    while (pos < tokens.length && tokens[pos] === '*') {
      pos++
      const q = atom()
      const before = show(p)
      p = mul(p, q)
      push('combine', L("while (pos < tokens.length && tokens[pos] === '*')"), `Multiply (${before}) by (${show(q)}): every term pairs with every term, variable lists are sorted, like terms add. Result: ${show(p)}.`, p, 35)
    }
    return p
  }
  function expr() {
    let p = term()
    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++]
      const q = term()
      const before = show(p)
      p = add(p, q, op === '+' ? 1 : -1)
      push('combine', L('const op = tokens[pos++]'), `${op === '+' ? 'Add' : 'Subtract'} (${show(q)}) ${op === '+' ? 'to' : 'from'} (${before}); like terms combine and zero terms vanish. Result: ${show(p)}.`, p, 27)
    }
    return p
  }
  const poly = expr()
  const result = formatPoly(poly)
  frames.push({ phase: 'done', activeLine: L('return formatPoly(expr())'), pythonLine: 51, pos: tokens.length, depth: 0, poly: show(poly), message: `Sort terms by degree (descending) then lexicographically: ${JSON.stringify(result)}.` })
  return { input: { expression, evalvars, evalints, tokens }, result, frames }
}
export const code = `function basicCalculatorIV(expression, evalvars, evalints) {
  const env = new Map(evalvars.map((v, i) => [v, evalints[i]]))
  const tokens = expression.match(/[a-z]+|\\d+|[()+\\-*]/g) || []
  const constant = v => new Map(v ? [['', v]] : [])
  let pos = 0
  function expr() {
    let p = term()
    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++]
      p = add(p, term(), op === '+' ? 1 : -1)
    }
    return p
  }
  function term() {
    let p = atom()
    while (pos < tokens.length && tokens[pos] === '*') {
      pos++
      p = mul(p, atom())
    }
    return p
  }
  function atom() {
    const t = tokens[pos++]
    if (t === '(') {
      const p = expr()
      pos++ // skip the closing parenthesis
      return p
    }
    if (/^\\d+$/.test(t)) return constant(Number(t))
    if (env.has(t)) return constant(env.get(t))
    return new Map([[t, 1]])
  }
  return formatPoly(expr())
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import re

def basic_calculator_iv(expression, evalvars, evalints):
    env = dict(zip(evalvars, evalints))
    tokens = re.findall(r'[a-z]+|\\d+|[()+\\-*]', expression)
    pos = 0

    def add(p, q, sign):
        r = dict(p)
        for k, v in q.items():
            r[k] = r.get(k, 0) + sign * v
        return {k: v for k, v in r.items() if v}

    def mul(p, q):
        r = {}
        for a, x in p.items():
            for b, y in q.items():
                k = tuple(sorted(a + b))
                r[k] = r.get(k, 0) + x * y
        return {k: v for k, v in r.items() if v}

    def expr():
        nonlocal pos
        p = term()
        while pos < len(tokens) and tokens[pos] in ('+', '-'):
            op = tokens[pos]; pos += 1
            p = add(p, term(), 1 if op == '+' else -1)
        return p

    def term():
        nonlocal pos
        p = atom()
        while pos < len(tokens) and tokens[pos] == '*':
            pos += 1
            p = mul(p, atom())
        return p

    def atom():
        nonlocal pos
        t = tokens[pos]; pos += 1
        if t == '(':
            p = expr(); pos += 1
            return p
        if t.isdigit():
            return {(): int(t)} if int(t) else {}
        if t in env:
            return {(): env[t]} if env[t] else {}
        return {(t,): 1}

    res = expr()
    keys = sorted(res, key=lambda k: (-len(k), k))
    return ['*'.join((str(res[k]),) + k) for k in keys]`
