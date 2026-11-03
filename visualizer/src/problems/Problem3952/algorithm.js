export const code = `set covered to zero and open to negative infinity
for each index i from 0 to n minus 1
  let best be the larger of covered and open
  if index i holds no token, set open to best and covered to negative infinity
  otherwise, the token at i has two options
    stay: set new covered to best plus value at i
    move left: set new open to the larger of open plus value at i minus 1, and covered
    store both new values
return the larger of covered and open`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_covered_value(values, tokens):
    NEG = float('-inf')
    covered, open_slot = 0, NEG
    for i in range(len(values)):
        best = max(covered, open_slot)
        if tokens[i] == '0':
            covered, open_slot = NEG, best
        else:
            new_covered = best + values[i]
            new_open = NEG
            if i >= 1:
                new_open = max(open_slot + values[i - 1], covered)
            covered, open_slot = new_covered, new_open
    return max(covered, open_slot)
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with values and tokens.')
  const { values, tokens } = input
  if (!Array.isArray(values) || values.length < 1 || values.length > 12) throw new Error('values holds 1 to 12 integers.')
  if (!values.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  if (typeof tokens !== 'string' || tokens.length !== values.length || !/^[01]+$/.test(tokens)) throw new Error('tokens is a binary string with one character per value.')
  return { values, tokens }
}

export function buildTrace({ values, tokens }) {
  const NEG = -Infinity
  const n = values.length
  const frames = []
  let covered = 0
  let open = NEG
  const show = v => (v === NEG ? null : v)
  const push = (phase, codeText, pyText, index, choice, message) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), index, choice,
    token: index >= 0 && tokens[index] === '1', covered: show(covered), open: show(open), message,
  })
  push('start', 'set covered to zero', 'covered, open_slot = 0, NEG', -1, 'start', 'Start with no slots covered. The slot before index 0 cannot be used.')
  for (let i = 0; i < n; i++) {
    const best = Math.max(covered, open)
    if (tokens[i] === '0') {
      covered = NEG
      open = best
      push('index', 'if index i holds no token', 'if tokens[i] ==', i, 'empty', `Index ${i} has no token, so its slot stays free for a token at ${i + 1}.`)
    } else {
      const stay = best + values[i]
      const move = i >= 1 ? Math.max(open + values[i - 1], covered) : NEG
      covered = stay
      open = move
      push('index', 'set new covered to best plus value', 'new_covered = best', i, 'token', `Token ${i} stays for ${values[i]}${i >= 1 ? `, or moves to ${i - 1} for ${show(move) === null ? 'nothing' : move}` : ' (it cannot move left)'}.`)
    }
  }
  const result = Math.max(covered, open)
  push('done', 'return the larger of covered and open', 'return max(covered, open_slot)', -1, 'done', `The best total is ${result}.`)
  return { input: { values, tokens }, result, frames }
}
