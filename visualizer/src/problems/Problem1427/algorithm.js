export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the original string and a net shift of zero.' },
  { id: 'operation', label: 'Add operation', description: 'A right shift adds its amount to the net shift; a left shift subtracts it. Only the net matters, because a full cycle changes nothing.' },
  { id: 'normalise', label: 'Reduce net shift', description: 'Reduce the net shift modulo the string length so it is a rotation between 0 and length minus one.' },
  { id: 'rotate', label: 'Rotate once', description: 'Move the last characters of the net rotation to the front in a single rotation.' },
  { id: 'done', label: 'Complete', description: 'The rotated string is the result of every operation.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"s": "abcde", "shift": [[0, 1], [1, 3]]}.')
  const { s, shift } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[a-z]+$/.test(s)) throw new Error('s is 1 to 30 lowercase letters.')
  if (!Array.isArray(shift) || shift.length < 1 || shift.length > 20 || !shift.every(op => Array.isArray(op) && op.length === 2 && (op[0] === 0 || op[0] === 1) && Number.isInteger(op[1]) && op[1] >= 0 && op[1] <= 100)) throw new Error('shift is 1 to 20 pairs [direction, amount]; direction 0 is left, 1 is right, amount is 0 to 100.')
  return { s, shift }
}

export function buildTrace({ s, shift }) {
  const n = s.length
  let net = 0
  const snap = (opIndex, extra = {}) => ({ opIndex, net, s, ...extra })
  const frames = [{ phase: 'start', activeLine: L('net = 0'), pythonLine: P('net = 0'), snapshot: snap(null), message: `Start with "${s}" and net shift 0.` }]
  shift.forEach(([direction, amount], i) => {
    net += direction === 1 ? amount : -amount
    frames.push({ phase: 'operation', activeLine: L('net = net + amount'), pythonLine: P('net += amount'), snapshot: snap(i, { direction, amount }), message: `Operation ${i + 1}: ${direction === 1 ? 'right' : 'left'} by ${amount}. Net shift is now ${net}.` })
  })
  const r = ((net % n) + n) % n
  frames.push({ phase: 'normalise', activeLine: L('r = net mod'), pythonLine: P('r = net % n'), snapshot: snap(null, { r }), message: `Net ${net} reduces to ${r} for a string of length ${n}.` })
  const result = r === 0 ? s : s.slice(n - r) + s.slice(0, n - r)
  frames.push({ phase: 'rotate', activeLine: L('return'), pythonLine: P('return s[n - r'), snapshot: snap(null, { r, result }), message: r === 0 ? 'The net rotation is zero, so the string is unchanged.' : `Move the last ${r} character${r === 1 ? '' : 's'} to the front.` })
  frames.push({ phase: 'done', activeLine: L('return'), pythonLine: P('return s[n - r'), snapshot: snap(null, { r, result }), message: `Result "${result}".` })
  return { input: { s, shift }, result, frames }
}

export const code = `string shifts (s, shift):
  net = 0
  for each [direction, amount] in shift:
    net = net + amount if direction is right, else net - amount
  r = net mod length of s
  return last r characters followed by the rest of s`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def string_shift(s, shift):
    net = 0
    for direction, amount in shift:
        net += amount if direction == 1 else -amount
    n = len(s)
    r = net % n
    return s[n - r:] + s[:n - r]
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
