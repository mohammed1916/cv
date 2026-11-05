export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with expression.')
  const { expression } = input
  if (typeof expression !== 'string' || expression.length < 3 || expression.length > 10) throw new Error('expression has 3 to 10 characters.')
  if (!/^[1-9]+\+[1-9]+$/.test(expression)) throw new Error('expression is digits 1 to 9, one plus sign, digits 1 to 9.')
  return { expression }
}

export function buildTrace({ expression }) {
  const plus = expression.indexOf('+')
  const left = expression.slice(0, plus)
  const right = expression.slice(plus + 1)
  const frames = []
  let best = null
  let bestValue = Infinity
  let bestTerms = null
  frames.push({ pythonLine: PL('plus = expression.index'), phase: 'setup', activeLine: CL('const plus'), at: -1, shown: expression, value: null, best: null, message: `Split at the plus sign into ${left} and ${right}.` })
  for (let i = 0; i < left.length; i++) {
    for (let k = 1; k <= right.length; k++) {
      const a = i === 0 ? 1 : Number(left.slice(0, i))
      const sum = Number(left.slice(i)) + Number(right.slice(0, k))
      const b = k === right.length ? 1 : Number(right.slice(k))
      const value = a * sum * b
      const candidate = `${left.slice(0, i)}(${left.slice(i)}+${right.slice(0, k)})${right.slice(k)}`
      const improved = value < bestValue
      if (improved) { bestValue = value; best = candidate; bestTerms = { i, k } }
      frames.push({ pythonLine: PL('value = a * s * b'), phase: 'try', activeLine: CL('const value'), at: -1, shown: candidate, value, best: best, improved, message: `${candidate} evaluates to ${value}${improved ? ', the smallest so far' : ''}.` })
    }
  }
  frames.push({ pythonLine: PL('return best'), phase: 'done', activeLine: CL('return best'), at: -1, shown: best, value: bestValue, best, improved: false, message: `The smallest value is ${bestValue}, from ${best}.` })
  return { input: { expression }, result: best, frames, bestTerms }
}

export const code = `function minimizeResult(expression) {
  const plus = expression.indexOf('+');
  const left = expression.slice(0, plus);
  const right = expression.slice(plus + 1);
  let best = null;
  let bestValue = Infinity;
  for (let i = 0; i < left.length; i++) {
    for (let k = 1; k <= right.length; k++) {
      const a = i === 0 ? 1 : Number(left.slice(0, i));
      const sum = Number(left.slice(i)) + Number(right.slice(0, k));
      const b = k === right.length ? 1 : Number(right.slice(k));
      const value = a * sum * b;
      if (value < bestValue) {
        bestValue = value;
        best = \`\${left.slice(0, i)}(\${left.slice(i)}+\${right.slice(0, k)})\${right.slice(k)}\`;
      }
    }
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def minimize_result(expression):
    plus = expression.index("+")
    left = expression[:plus]
    right = expression[plus + 1:]
    best = None
    best_value = float("inf")
    for i in range(len(left)):
        for k in range(1, len(right) + 1):
            a = int(left[:i]) if i > 0 else 1
            s = int(left[i:]) + int(right[:k])
            b = int(right[k:]) if k < len(right) else 1
            value = a * s * b
            if value < best_value:
                best_value = value
                best = f"{left[:i]}({left[i:]}+{right[:k]}){right[k:]}"
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
