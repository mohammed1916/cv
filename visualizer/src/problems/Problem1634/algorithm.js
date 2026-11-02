// LeetCode 1634 (draft): Add Two Polynomials Represented as Linked Lists.
// Input: { poly1, poly2 } where each polynomial is a list of [coefficient, power] terms in descending power order.
// Terms with a zero coefficient are not stored, and equal powers are merged. The result is a list in the same format.

const CODE_TEXT = `FUNCTION addPolynomials(poly1, poly2)
    i ← head of poly1, j ← head of poly2, result ← empty list
    WHILE i and j both point at a term
        IF power of i equals power of j
            total ← coefficient of i plus coefficient of j
            IF total is not zero, append (total, power) to result
            advance i and j
        ELSE IF power of i is greater than power of j
            append term i to result, advance i
        ELSE
            append term j to result, advance j
    append the remaining terms of whichever list has terms left
    RETURN result`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def add_polynomials(poly1, poly2):
    result = []
    i = 0
    j = 0
    while i < len(poly1) and j < len(poly2):
        c1, p1 = poly1[i]
        c2, p2 = poly2[j]
        if p1 == p2:
            total = c1 + c2
            if total != 0:
                result.append([total, p1])
            i += 1
            j += 1
        elif p1 > p2:
            result.append([c1, p1])
            i += 1
        else:
            result.append([c2, p2])
            j += 1
    result.extend(poly1[i:])
    result.extend(poly2[j:])
    return result
`

const PY = python.split('\n')
const L = text => {
  const index = code.findIndex(c => c.text.includes(text))
  if (index < 0) throw new Error(`missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Heads', description: 'Both pointers start at the highest power.' },
  { id: 'match', label: 'Match', description: 'Equal powers merge into one term.' },
  { id: 'take', label: 'Take', description: 'The higher power is copied alone.' },
  { id: 'rest', label: 'Rest', description: 'One list is exhausted; copy what is left.' },
  { id: 'done', label: 'Result', description: 'The merged polynomial.' },
]

const CAP = 8

function parsePoly(name, terms) {
  if (!Array.isArray(terms) || terms.length > CAP) throw new Error(`${name} is a list of at most ${CAP} [coefficient, power] terms in this visualization.`)
  let last = Infinity
  for (const term of terms) {
    if (!Array.isArray(term) || term.length !== 2 || !term.every(Number.isInteger)) throw new Error(`Each term of ${name} is [integer coefficient, integer power].`)
    const [c, p] = term
    if (c === 0) throw new Error('Stored terms have nonzero coefficients.')
    if (p < 0) throw new Error('Powers are nonnegative.')
    if (p >= last) throw new Error('Powers must strictly decrease within a polynomial.')
    last = p
  }
  return terms.map(([c, p]) => [c, p])
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with poly1 and poly2.')
  return { poly1: parsePoly('poly1', input.poly1), poly2: parsePoly('poly2', input.poly2) }
}

export function buildTrace({ poly1, poly2 }) {
  const frames = []
  const result = []
  let i = 0
  let j = 0
  const snap = () => result.map(term => [...term])
  frames.push({ pythonLine: P('i = 0'), phase: 'start', activeLine: L('i ← head of poly1'), i, j, result: snap(), message: 'Both pointers start at the highest power.' })
  while (i < poly1.length && j < poly2.length) {
    const [c1, p1] = poly1[i]
    const [c2, p2] = poly2[j]
    if (p1 === p2) {
      const total = c1 + c2
      const stored = total !== 0
      if (stored) result.push([total, p1])
      frames.push({ pythonLine: P('if p1 == p2:'), phase: 'match', activeLine: L('IF power of i equals power of j'), i, j, a: [c1, p1], b: [c2, p2], total, result: snap(), message: `Powers ${p1} match: ${c1} + ${c2} = ${total}${stored ? ', appended' : ', dropped because it is zero'}.` })
      i += 1
      j += 1
    } else if (p1 > p2) {
      result.push([c1, p1])
      frames.push({ pythonLine: P('elif p1 > p2:'), phase: 'take', activeLine: L('ELSE IF power of i is greater'), i, j, a: [c1, p1], b: [c2, p2], total: null, result: snap(), message: `Power ${p1} is higher than ${p2}, so copy ${c1}x^${p1} from poly1.` })
      i += 1
    } else {
      result.push([c2, p2])
      frames.push({ pythonLine: P('else:'), phase: 'take', activeLine: L('append term j to result'), i, j, a: [c1, p1], b: [c2, p2], total: null, result: snap(), message: `Power ${p2} is higher than ${p1}, so copy ${c2}x^${p2} from poly2.` })
      j += 1
    }
  }
  const rest = i < poly1.length ? 'poly1' : poly2.length > j ? 'poly2' : null
  if (rest !== null) {
    while (i < poly1.length) { result.push(poly1[i]); i += 1 }
    while (j < poly2.length) { result.push(poly2[j]); j += 1 }
    frames.push({ pythonLine: P('result.extend(poly1[i:])'), phase: 'rest', activeLine: L('append the remaining terms'), i, j, a: null, b: null, total: null, result: snap(), message: `${rest} still has terms, so they are copied unchanged.` })
  }
  frames.push({ pythonLine: P('return result'), phase: 'done', activeLine: L('RETURN result'), i, j, a: null, b: null, total: null, result: snap(), message: `Sum: [${result.map(([c, p]) => `[${c}, ${p}]`).join(', ')}].` })
  return { input: { poly1, poly2 }, result, frames }
}
