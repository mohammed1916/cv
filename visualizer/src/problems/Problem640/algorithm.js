export function parseInput(text) {
  const eq = JSON.parse(text)
  if (typeof eq !== 'string' || eq.length > 1000 || eq.split('=').length !== 2) throw new Error('Enter a JSON string with one "=", such as "x+5-3+x=6+x-2".')
  if (!/^[-+x0-9]+=[-+x0-9]+$/.test(eq) || /[+-]{2}|^[+]|=[+]|[x0-9]x/.test(eq.replace(/\s/g, ''))) throw new Error('Use only x, digits, + and − with a single unknown x and no spaces.')
  return eq
}

// Each side becomes (coefficient of x, constant). Subtract the right side from the left.
function side(text) {
  let coefficient = 0, constant = 0
  for (const [, sign, term] of text.matchAll(/([+-]?)([^+-]+)/g)) {
    const s = sign === '-' ? -1 : 1
    if (term === 'x') coefficient += s
    else if (term.endsWith('x')) coefficient += s * Number(term.slice(0, -1))
    else constant += s * Number(term)
  }
  return { coefficient, constant }
}

export function buildTrace(equation) {
  const [left, right] = equation.split('=')
  const L = side(left), R = side(right)
  const a = L.coefficient - R.coefficient
  const b = R.constant - L.constant
  const frames = [
    { phase: 'split', left: L, right: R, a: null, b: null, activeLine: 2, message: `Left side: ${L.coefficient}x + ${L.constant}; right side: ${R.coefficient}x + ${R.constant}.` },
    { phase: 'move', left: L, right: R, a, b, activeLine: 4, message: `Move everything to one side: ${a}x = ${b}.` },
  ]
  let result
  if (a === 0 && b === 0) result = 'Infinite solutions'
  else if (a === 0) result = 'No solution'
  else result = `x=${b / a}`
  frames.push({ phase: 'done', left: L, right: R, a, b, result, activeLine: 6, message: `Result: ${result}.` })
  return { input: equation, result, frames }
}

export const code = `def solveEquation(equation):
    def parse(side):
        coeff = const = 0
        # sum each signed term: 'x' terms into coeff, numbers into const
        ...
        return coeff, const
    (a1, b1), (a2, b2) = map(parse, equation.split('='))
    a, b = a1 - a2, b2 - b1
    if a == 0: return 'Infinite solutions' if b == 0 else 'No solution'
    return f'x={b // a}'`.split('\n').map((text, index) => ({ line: index + 1, text }))
