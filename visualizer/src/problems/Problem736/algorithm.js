export const code = `set tokens to the expression with parentheses padded by spaces, then split on spaces
set pos to 0, and scopes to one empty scope
define value() to read the token at pos
  if the token is not "(", advance pos
    if the token is a name, return the lookup of the name, searching scopes from innermost outward
    otherwise return the integer literal
  otherwise advance past "(" and read the operator op
    if op is let, push a new scope, then loop:
      while the next item is "(" or the item after it is ")"
        result = value() for the final expression, then stop
      otherwise name = tokens[pos], and advance pos
        then scopes[-1][name] = value(), binding it in the innermost scope
      pop the scope, so its variables vanish, and return the let result
    otherwise, for add or mult, a = value() then b = value()
      return a + b for add, or a * b for mult
return value()`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def evaluate(expression):
    tokens = expression.replace('(', ' ( ').replace(')', ' ) ').split()
    pos = 0
    scopes = [{}]

    def lookup(name):
        for scope in reversed(scopes):
            if name in scope:
                return scope[name]

    def value():
        nonlocal pos
        tok = tokens[pos]
        if tok != '(':
            pos += 1
            if tok[0].isalpha():
                return lookup(tok)
            return int(tok)
        pos += 1
        op = tokens[pos]
        pos += 1
        if op == 'let':
            scopes.append({})
            while True:
                if tokens[pos] == '(' or tokens[pos + 1] == ')':
                    result = value()
                    break
                name = tokens[pos]
                pos += 1
                scopes[-1][name] = value()
            scopes.pop()
        else:
            a = value()
            b = value()
            result = a + b if op == 'add' else a * b
        pos += 1
        return result

    return value()`
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function tokenize(expression) {
  return expression.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').split(/\s+/).filter(Boolean)
}

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !s.length || s.length > 300) throw new Error('Enter a JSON string expression of at most 300 characters (visualization cap).')
  if (!/^[a-z0-9() -]+$/.test(s)) throw new Error('The expression may only contain lowercase letters, digits, spaces, parentheses and minus signs.')
  const tokens = tokenize(s)
  let depth = 0
  for (const t of tokens) { if (t === '(') depth++; else if (t === ')' && --depth < 0) throw new Error('Unbalanced parentheses.') }
  if (depth !== 0) throw new Error('Unbalanced parentheses.')
  // Validate by evaluating; the evaluator throws readable errors for malformed forms.
  evaluateOrThrow(tokens)
  return s
}

function evaluateOrThrow(tokens) {
  buildFrames(tokens, false)
}

function buildFrames(tokens, record) {
  const frames = []
  let pos = 0
  const scopes = [{}]
  const bail = msg => { throw new Error(msg) }
  const snapScopes = () => scopes.map(s => Object.entries(s).map(([k, v]) => `${k}=${v}`))
  const push = (phase, activeLine, message, extra = {}) => { if (record) frames.push({ phase, activeLine, pos, scopes: snapScopes(), depth: extra.depth ?? 0, message, ...extra }) }
  const lookup = name => {
    for (let i = scopes.length - 1; i >= 0; i--) if (name in scopes[i]) return { value: scopes[i][name], level: i }
    return bail(`Variable "${name}" is used before it is defined.`)
  }
  const at = i => (i < tokens.length ? tokens[i] : bail('The expression ended unexpectedly.'))
  function value(depth) {
    const tok = at(pos)
    if (tok !== '(') {
      pos++
      if (/^[a-z]/.test(tok)) {
        if (tok === 'let' || tok === 'add' || tok === 'mult') bail(`"${tok}" is a keyword, not a variable.`)
        const { value: v, level } = lookup(tok)
        push('lookup', L('return the lookup of the name'), `Variable ${tok}: search scopes from innermost outward; found ${tok} = ${v} in scope ${level}.`, { pythonLine: 17, depth, value: v, token: pos - 1 })
        return v
      }
      if (!/^-?[0-9]+$/.test(tok)) bail(`Invalid token "${tok}".`)
      const v = parseInt(tok, 10)
      push('literal', L('return the integer literal'), `Integer literal ${v}.`, { pythonLine: 18, depth, value: v, token: pos - 1 })
      return v
    }
    pos++
    const op = at(pos)
    pos++
    if (op === 'let') {
      scopes.push({})
      push('enter', L('if op is let'), 'Enter a let: push a fresh scope. Variables bound here shadow outer ones until the let ends.', { pythonLine: 23, depth, token: pos - 1 })
      let result
      for (;;) {
        if (at(pos) === '(' || at(pos + 1) === ')') {
          push('enter', L('result = value()'), `Next item is the final expression of the let (a lone value or a nested form): evaluate it.`, { pythonLine: 26, depth, token: pos })
          result = value(depth + 1)
          break
        }
        const name = at(pos)
        if (!/^[a-z][a-z0-9]*$/.test(name) || ['let', 'add', 'mult'].includes(name)) bail(`"${name}" is not a valid variable name.`)
        pos++
        push('enter', L('name = tokens[pos]'), `Variable name "${name}": evaluate its value expression next.`, { pythonLine: 28, depth, token: pos - 1 })
        const v = value(depth + 1)
        scopes[scopes.length - 1][name] = v
        push('bind', L('scopes[-1][name]'), `Bind ${name} = ${v} in the innermost scope.`, { pythonLine: 30, depth, token: pos - 1, value: v })
      }
      scopes.pop()
      pos++
      push('combine', L('pop the scope'), `Close the let: pop its scope (its variables vanish). The let evaluates to ${result}.`, { pythonLine: 31, depth, value: result, token: pos - 1 })
      return result
    }
    if (op !== 'add' && op !== 'mult') bail(`Unknown operator "${op}".`)
    push('enter', L('a = value()'), `Enter ${op}: evaluate both operands left to right.`, { pythonLine: 33, depth, token: pos - 1 })
    const a = value(depth + 1)
    const b = value(depth + 1)
    const result = op === 'add' ? a + b : a * b
    pos++
    push('combine', L('return a + b for add'), `${op}(${a}, ${b}) = ${result}.`, { pythonLine: 35, depth, value: result, token: pos - 1 })
    return result
  }
  push('start', L('set tokens to'), `Tokenise by padding parentheses with spaces: ${tokens.length} tokens. A stack of scopes starts with one empty scope.`, { pythonLine: 4, token: -1 })
  const result = value(0)
  if (pos !== tokens.length) bail('Unexpected tokens after the expression.')
  if (!Number.isSafeInteger(result)) bail('Result is too large.')
  push('done', L('return value()'), `The expression evaluates to ${result}.`, { pythonLine: 39, value: result, token: -1 })
  return { frames, result }
}

export function buildTrace(expression) {
  const tokens = tokenize(expression)
  const { frames, result } = buildFrames(tokens, true)
  return { input: expression, tokens, result, frames }
}
