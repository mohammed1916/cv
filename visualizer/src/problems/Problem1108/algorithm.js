// Own character-by-character rewrite. The sample address is invented for this visualization.
const PSEUDO = [
  'out = empty text',
  'for ch in address:',
  '    if ch is ".":',
  '        append "[.]" to out',
  '    else:',
  '        append ch to out',
  'return out',
]

export const python = `def defang(address):
    out = []
    for ch in address:
        if ch == ".":
            out.append("[.]")
        else:
            out.append(ch)
    return "".join(out)`

const PY = python.split('\n')
export const code = PSEUDO.map((text, index) => ({ line: index + 1, text }))

const STEP = {
  start: ['out = empty', 'out = []'],
  read: ['for ch in address', 'for ch in address'],
  dot: ['append "[.]"', 'out.append("[.]")'],
  keep: ['append ch', 'out.append(ch)'],
  done: ['return out', 'return "".join(out)'],
}
function lineOf(lines, key) {
  const index = lines.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, step, message, snapshot) => ({
  phase,
  activeLine: lineOf(PSEUDO, STEP[step][0]),
  pythonLine: lineOf(PY, STEP[step][1]),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty output.' },
  { id: 'read', label: 'Read', description: 'Look at the next character of the address.' },
  { id: 'dot', label: 'Dot', description: 'Write a dot as three characters, brackets included.' },
  { id: 'keep', label: 'Copy', description: 'Copy a digit to the output unchanged.' },
  { id: 'done', label: 'Result', description: 'Return the rewritten text.' },
]

export const inputLabel = 'Dotted IPv4 address text, e.g. "10.0.0.7"'
export const complexity = 'O(n) time and O(n) output space, where n is the address length. The visualizer accepts up to 15 characters.'
export const examples = [
  { label: 'Sample', input: '"10.0.0.7"' },
  { label: 'Zero octets', input: '"0.0.0.0"' },
  { label: 'Large octets', input: '"255.1.99.254"' },
]

export function parseInput(text) {
  const value = JSON.parse(text)
  if (typeof value !== 'string') throw new Error('Use a JSON string such as "10.0.0.7".')
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) throw new Error('Use four dot-separated groups of digits.')
  if (value.length > 15) throw new Error('Use at most 15 characters.')
  return value
}

export function buildTrace(address) {
  const out = []
  let rendered = ''
  const snap = extra => ({ address, out: [...out], rendered, ...extra })
  const frames = [frame('start', 'start', 'The output starts empty.', snap({ index: -1 }))]
  for (let index = 0; index < address.length; index++) {
    const ch = address[index]
    frames.push(frame('read', 'read', `Read "${ch}" at position ${index}.`, snap({ index })))
    if (ch === '.') {
      out.push('[.]')
      rendered = out.join('')
      frames.push(frame('dot', 'dot', 'A separator becomes [.] in the output.', snap({ index })))
    } else {
      out.push(ch)
      rendered = out.join('')
      frames.push(frame('keep', 'keep', `Digit "${ch}" is copied unchanged.`, snap({ index })))
    }
  }
  const result = out.join('')
  frames.push(frame('done', 'done', 'Return the rewritten address.', snap({ index: address.length, rendered: result })))
  return { input: address, result, frames }
}
