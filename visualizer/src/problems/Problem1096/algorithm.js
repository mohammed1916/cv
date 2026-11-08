// Recursive-descent walkthrough. The sample expression is invented for this visualization.
export const code = `function braceExpansionII(expression) {
  let pos = 0
  const concat = (left, right) => {
    const out = new Set()
    for (const a of left) for (const b of right) out.add(a + b)
    return out
  }
  const parseExpr = () => {
    let union = new Set()
    let product = new Set([''])
    while (pos < expression.length && expression[pos] !== '}') {
      if (expression[pos] === ',') {
        union = new Set([...union, ...product])
        product = new Set([''])
        pos++
      } else if (expression[pos] === '{') {
        pos++
        const inner = parseExpr()
        pos++
        product = concat(product, inner)
      } else {
        const begin = pos
        while (pos < expression.length && /[a-z]/.test(expression[pos])) pos++
        product = concat(product, new Set([expression.slice(begin, pos)]))
      }
    }
    return new Set([...union, ...product])
  }
  return [...parseExpr()].sort()
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CODE_LINES = code.map(line => line.text)

export const python = `def brace_expansion_ii(expression):
    pos = 0
    def parse_expr():
        nonlocal pos
        union, product = set(), {""}
        while pos < len(expression) and expression[pos] != "}":
            if expression[pos] == ",":
                union |= product
                product = {""}
                pos += 1
            elif expression[pos] == "{":
                pos += 1
                inner = parse_expr()
                pos += 1
                product = {a + b for a in product for b in inner}
            else:
                start = pos
                while pos < len(expression) and expression[pos].isalpha():
                    pos += 1
                word = expression[start:pos]
                product = {a + word for a in product}
        return union | product
    return sorted(parse_expr())`

const PY = python.split('\n')

const STEP = {
  start: ['let union = new Set()', 'union, product = set()'],
  letters: ['const begin = pos', 'start = pos'],
  group: ['product = concat(product, inner)', 'product = {a + b'],
  comma: ['union = new Set([...union, ...product])', 'union |= product'],
  done: ['return [...parseExpr()].sort()', 'return sorted(parse_expr())'],
}
function lineOf(lines, key) {
  const index = lines.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, step, message, snapshot) => ({
  phase,
  activeLine: lineOf(CODE_LINES, STEP[step][0]),
  pythonLine: lineOf(PY, STEP[step][1]),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Enter group', description: 'Start a call with an empty union and the empty-word prefix.' },
  { id: 'letters', label: 'Letters', description: 'Append a run of letters to every prefix in the product.' },
  { id: 'group', label: 'Nested group', description: 'Combine the prefixes with every word from the nested group.' },
  { id: 'comma', label: 'Alternative', description: 'Finish one comma-separated alternative and merge it into the union.' },
  { id: 'done', label: 'Result', description: 'Return the distinct words in sorted order.' },
]

export const inputLabel = 'JSON string with a brace expression, e.g. "{x,y}z{w,{p,q}}"'
export const complexity = 'Time depends on the number of distinct words produced. The visualizer accepts up to 20 characters and 64 result words.'
export const examples = [
  { label: 'Sample', input: '"{x,y}z{w,{p,q}}"' },
  { label: 'Repeated words', input: '"{m,mn}o"' },
  { label: 'Simple alternatives', input: '"ab,{c,d}"' },
  { label: 'Single letter', input: '"a"' },
  { label: 'Repeated alternatives collapse', input: '"{a,a}{b,b}"' },
  { label: 'Twenty characters, 16 words', input: '"{a,b}{c,d}{e,f}{g,h}"' },
  { label: 'Long run: nested and plain mix', input: '"{p,q{r,s}}t,{u,v}"' },
]

const LETTER = /[a-z]/

// Grammar: expr := term (',' term)* ; term := (letters | '{' expr '}')+ ; every term must be nonempty.
function checkGrammar(text) {
  let pos = 0
  const expr = () => {
    term()
    while (text[pos] === ',') { pos += 1; term() }
  }
  const term = () => {
    let count = 0
    while (pos < text.length) {
      if (LETTER.test(text[pos])) {
        while (pos < text.length && LETTER.test(text[pos])) pos += 1
        count += 1
      } else if (text[pos] === '{') {
        pos += 1
        expr()
        if (text[pos] !== '}') throw new Error('Every "{" needs a matching "}".')
        pos += 1
        count += 1
      } else break
    }
    if (count === 0) throw new Error('Alternatives cannot be empty.')
  }
  expr()
  if (pos !== text.length) throw new Error('Use only lowercase letters, commas and balanced braces.')
}

export function parseInput(text) {
  const value = JSON.parse(text)
  if (typeof value !== 'string') throw new Error('Use a JSON string such as "{x,y}z".')
  if (value.length < 1 || value.length > 20) throw new Error('Use 1 to 20 characters.')
  checkGrammar(value)
  return value
}

const concat = (left, right) => {
  const out = new Set()
  for (const a of left) for (const b of right) out.add(a + b)
  return out
}

export function buildTrace(expression) {
  const s = expression
  const frames = []
  let pos = 0
  const sorted = set => [...set].sort()
  const snap = (depth, product, union, extra = {}) => ({
    expression: s, depth, pos, product: sorted(product).slice(0, 64), union: sorted(union).slice(0, 64), ...extra,
  })

  function parseExpr(depth) {
    let union = new Set()
    let product = new Set([''])
    frames.push(frame('start', 'start', `Enter a group at depth ${depth}: union is empty, product holds the empty prefix.`, snap(depth, product, union)))
    while (pos < s.length && s[pos] !== '}') {
      if (s[pos] === ',') {
        union = new Set([...union, ...product])
        product = new Set([''])
        pos += 1
        frames.push(frame('comma', 'comma', 'A comma ends this alternative; its words join the union.', snap(depth, product, union)))
      } else if (s[pos] === '{') {
        pos += 1
        const inner = parseExpr(depth + 1)
        pos += 1
        product = concat(product, inner)
        frames.push(frame('group', 'group', `Combine the prefixes with the ${inner.size} word${inner.size === 1 ? '' : 's'} from the nested group.`, snap(depth, product, union, { inner: sorted(inner) })))
      } else {
        const begin = pos
        while (pos < s.length && LETTER.test(s[pos])) pos += 1
        const word = s.slice(begin, pos)
        product = concat(product, new Set([word]))
        frames.push(frame('letters', 'letters', `Append "${word}" to every prefix.`, snap(depth, product, union, { word })))
      }
    }
    return new Set([...union, ...product])
  }

  const words = parseExpr(0)
  const result = sorted(words)
  frames.push(frame('done', 'done', `Return the ${result.length} distinct word${result.length === 1 ? '' : 's'} in sorted order.`, snap(0, words, new Set(), { result })))
  return { input: expression, result, frames }
}
