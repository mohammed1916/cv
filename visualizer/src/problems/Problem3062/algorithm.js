const CODE_TEXT = `set even and odd scores to zero
for each pair index p from 0 to n / 2 minus 1
  let a be the node at index 2p (even team) and b the node at 2p + 1 (odd team)
  if a > b then the even team gains one point
  else if b > a then the odd team gains one point
  otherwise the pair scores nothing
if even > odd then return "Even"
if odd > even then return "Odd"
return "Tie"`

const PYTHON_TEXT = `def winner_of_linked_list_game(values):
    even = 0
    odd = 0
    for p in range(len(values) // 2):
        a = values[2 * p]
        b = values[2 * p + 1]
        if a > b:
            even += 1
        elif b > a:
            odd += 1
    if even > odd:
        return "Even"
    if odd > even:
        return "Odd"
    return "Tie"`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON_TEXT
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`No pseudocode line: ${s}`); return i + 1 }
const PY = s => { const i = python.split('\n').findIndex(t => t.includes(s)); if (i < 0) throw new Error(`No python line: ${s}`); return i + 1 }

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 2 || values.length > 12 || values.length % 2 !== 0) throw new Error('Use an even-length JSON array of 2 to 12 integers.')
  if (!values.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return values
}

export function buildTrace(values) {
  const frames = []
  let even = 0
  let odd = 0
  frames.push({ phase: 'start', activeLine: L('set even and odd scores'), pythonLine: PY('even = 0'), pair: -1, even, odd, outcome: null, message: 'Both teams start with no points.' })
  for (let p = 0; p < values.length / 2; p++) {
    const a = values[2 * p]
    const b = values[2 * p + 1]
    let outcome = 'tie'
    if (a > b) {
      even++
      outcome = 'even'
      frames.push({ phase: 'pair', activeLine: L('if a > b'), pythonLine: PY('if a > b'), pair: p, even, odd, outcome, message: `Pair ${p}: ${a} beats ${b}, so the even team scores.` })
    } else if (b > a) {
      odd++
      outcome = 'odd'
      frames.push({ phase: 'pair', activeLine: L('else if b > a'), pythonLine: PY('elif b > a'), pair: p, even, odd, outcome, message: `Pair ${p}: ${b} beats ${a}, so the odd team scores.` })
    } else {
      frames.push({ phase: 'pair', activeLine: L('otherwise the pair scores nothing'), pythonLine: PY('elif b > a'), pair: p, even, odd, outcome, message: `Pair ${p}: both values are ${a}, so nobody scores.` })
    }
  }
  const result = even > odd ? 'Even' : odd > even ? 'Odd' : 'Tie'
  frames.push({ phase: 'done', activeLine: L('return "Tie"'), pythonLine: PY('return "Tie"'), pair: -1, even, odd, outcome: null, message: `Final scores ${even} to ${odd}: the result is ${result}.` })
  return { input: values, result, frames }
}
