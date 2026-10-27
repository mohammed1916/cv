export function parseInput(text) {
  const eq = JSON.parse(text)
  if (typeof eq !== 'string' || eq.length > 1000 || eq.split('=').length !== 2) throw new Error('Enter a JSON string with one "=", such as "x+5-3+x=6+x-2".')
  if (!/^[-+x0-9]+=[-+x0-9]+$/.test(eq) || /[+-]{2}|^[+]|=[+]|x[0-9x]|[0-9]x[0-9x]/.test(eq.replace(/\s/g, ''))) throw new Error('Use only x, digits, + and − with a single unknown x and no spaces.')
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
  const leftSide = side(left), rightSide = side(right)
  const a = leftSide.coefficient - rightSide.coefficient
  const b = rightSide.constant - leftSide.constant
  const frames = [
    { phase: 'split', left: leftSide, right: rightSide, a: null, b: null, activeLine: L('split the equation'), message: `Left side: ${leftSide.coefficient}x + ${leftSide.constant}; right side: ${rightSide.coefficient}x + ${rightSide.constant}.` },
    { phase: 'move', left: leftSide, right: rightSide, a, b, activeLine: L('a = left.coefficient'), message: `Move everything to one side: ${a}x = ${b}.` },
  ]
  let result
  if (a === 0 && b === 0) result = 'Infinite solutions'
  else if (a === 0) result = 'No solution'
  else result = `x=${b / a}`
  frames.push({ phase: 'done', left: leftSide, right: rightSide, a, b, result, activeLine: result === 'No solution' ? L('if a is 0: return') : result === 'Infinite solutions' ? L('if a is 0 and b is 0') : L('followed by b / a'), message: `Result: ${result}.` })
  return { input: equation, result, frames }
}

export const code = `split the equation at "=" into left text and right text
left = side(left text)
right = side(right text)
a = left.coefficient - right.coefficient
b = right.constant - left.constant
if a is 0 and b is 0: return "Infinite solutions"
if a is 0: return "No solution"
return "x=" followed by b / a

side(text):
  coefficient = 0, constant = 0
  for each signed term in text:
    if term is "x": coefficient += sign
    else if term ends with "x": coefficient += sign * its number
    else: constant += sign * its number
  return (coefficient, constant)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import re


def solve_equation(equation):
    def side(text):
        coefficient = constant = 0
        for sign, term in re.findall(r'([+-]?)([^+-]+)', text):
            s = -1 if sign == '-' else 1
            if term == 'x':
                coefficient += s
            elif term.endswith('x'):
                coefficient += s * int(term[:-1])
            else:
                constant += s * int(term)
        return coefficient, constant

    left, right = equation.split('=')
    a1, b1 = side(left)
    a2, b2 = side(right)
    a, b = a1 - a2, b2 - b1
    if a == 0:
        return 'Infinite solutions' if b == 0 else 'No solution'
    q = b / a
    return 'x=' + (str(int(q)) if q == int(q) else repr(q))`

