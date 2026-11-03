export const phases = [
  { id: 'start', label: 'Setup', description: 'Nothing is counted yet.' },
  { id: 'read', label: 'Read', description: 'Look at the next character.' },
  { id: 'skip', label: 'Repeat', description: 'A repeated character adds nothing.' },
  { id: 'add', label: 'Score', description: 'A new character adds its points.' },
  { id: 'done', label: 'Result', description: 'Report the total score.' },
]

const POINTS = { lower: 1, upper: 2, digit: 3, symbol: 5 }
const kindOf = ch => (/[a-z]/.test(ch) ? 'lower' : /[A-Z]/.test(ch) ? 'upper' : /[0-9]/.test(ch) ? 'digit' : 'symbol')

export function parseInput(text) {
  const password = String(text).trim()
  if (!/^[A-Za-z0-9!@#$]{1,60}$/.test(password)) throw new Error('Use 1 to 60 letters, digits, or the symbols ! @ # $.')
  return { password }
}

export function buildTrace({ password }) {
  const seen = new Set()
  let score = 0
  const frames = [{ phase: 'start', activeLine: L('let seen be'), pythonLine: P('seen = set()'), message: 'Nothing has been counted yet.', index: -1, ch: null, kind: null, added: 0, seen: [], score }]
  for (let i = 0; i < password.length; i++) {
    const ch = password[i]
    frames.push({ phase: 'read', activeLine: L('for each character ch'), pythonLine: P('for ch in text'), message: `Read ${ch}.`, index: i, ch, kind: kindOf(ch), added: 0, seen: [...seen], score })
    if (seen.has(ch)) {
      frames.push({ phase: 'skip', activeLine: L('already in seen'), pythonLine: P('if ch in seen'), message: `${ch} was already counted, so it adds nothing.`, index: i, ch, kind: kindOf(ch), added: 0, seen: [...seen], score })
      continue
    }
    seen.add(ch)
    const kind = kindOf(ch)
    const added = POINTS[kind]
    score += added
    const line = { lower: 'lowercase letter', upper: 'uppercase letter', digit: 'digit', symbol: 'else add 5' }[kind]
    frames.push({ phase: 'add', activeLine: L(line), pythonLine: P(kind === 'symbol' ? 'score += 5' : `score += ${added}`), message: `${ch} is new and adds ${added}; the score is ${score}.`, index: i, ch, kind, added, seen: [...seen], score })
  }
  frames.push({ phase: 'done', activeLine: L('return score'), pythonLine: P('return score'), message: `The password strength is ${score}.`, index: -1, ch: null, kind: null, added: 0, seen: [...seen], score })
  return { input: { password }, result: score, frames }
}

export const code = `sum the score of each distinct character
  let seen be an empty set and score be 0
  for each character ch in the password
    if ch is already in seen then continue
    add ch to seen
    if ch is a lowercase letter then add 1
    else if ch is an uppercase letter then add 2
    else if ch is a digit then add 3
    else add 5
  return score`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def password_strength(text):
    seen = set()
    score = 0
    for ch in text:
        if ch in seen:
            continue
        seen.add(ch)
        if ch.islower():
            score += 1
        elif ch.isupper():
            score += 2
        elif ch.isdigit():
            score += 3
        else:
            score += 5
    return score`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
