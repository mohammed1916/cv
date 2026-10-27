export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s and shifts.')
  const { s, shifts } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[a-z]+$/.test(s)) throw new Error('s must be 1 to 20 lowercase letters.')
  if (!Array.isArray(shifts) || shifts.length < 1 || shifts.length > 8) throw new Error('shifts must be an array of 1 to 8 [start, end, direction] triples.')
  for (const sh of shifts) {
    if (!Array.isArray(sh) || sh.length !== 3 || !sh.every(Number.isInteger)) throw new Error('Each shift is [start, end, direction] with integers.')
    const [a, b, d] = sh
    if (a < 0 || b < a || b >= s.length) throw new Error('Each shift needs 0 <= start <= end < s.length.')
    if (d !== 0 && d !== 1) throw new Error('direction is 1 (forward) or 0 (backward).')
  }
  return { s, shifts }
}

export const code = `apply all shifts to a string of lowercase letters and return it
  let n be the length of the string
  make a difference array of zeros with one extra slot
  for each shift with start, end and direction
  add plus one or minus one at start, depending on direction
  take the opposite change just after end
  walk through the positions while keeping a running net shift
  move each letter by its net shift, wrapping from z back to a
  return the new string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ s, shifts }) {
  const n = s.length
  const diff = Array(n + 1).fill(0)
  const frames = [{ phase: 'start', activeLine: L('make a difference array'), index: -1, letters: null, nets: null, message: 'Record every shift at its endpoints instead of touching each letter.' }]
  for (const [start, end, direction] of shifts) {
    const delta = direction === 1 ? 1 : -1
    diff[start] += delta
    diff[end + 1] -= delta
    frames.push({ phase: 'mark', activeLine: L('for each shift'), index: start, letters: null, nets: null, message: `Shift [${start}, ${end}] ${direction === 1 ? 'forward' : 'backward'}: +${delta} at ${start}, ${-delta} after ${end}.` })
  }
  const nets = []
  const letters = []
  let net = 0
  for (let i = 0; i < n; i++) {
    net += diff[i]
    nets.push(net)
    const code0 = s.charCodeAt(i) - 97
    letters.push(String.fromCharCode(97 + (((code0 + net) % 26) + 26) % 26))
    frames.push({ phase: 'apply', activeLine: L('move each letter'), index: i, letters: [...letters], nets: [...nets], message: `Position ${i}: net shift ${net}, ${s[i]} becomes ${letters[i]}.` })
  }
  const result = letters.join('')
  frames.push({ phase: 'done', activeLine: L('return the new string'), index: -1, letters, nets, message: `Result: ${result}.` })
  return { input: { s, shifts }, nets, result, frames }
}

export const python = `def shift_letters(s, shifts):
    n = len(s)
    diff = [0] * (n + 1)
    for start, end, direction in shifts:
        delta = 1 if direction == 1 else -1
        diff[start] += delta
        diff[end + 1] -= delta
    out = []
    net = 0
    for i, ch in enumerate(s):
        net += diff[i]
        out.append(chr((ord(ch) - 97 + net) % 26 + 97))
    return ''.join(out)
`
