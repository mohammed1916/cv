// LeetCode 2138: Divide a String Into Groups of Size k.
// Cut the string into consecutive pieces of length k. The last piece is padded with the fill character.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"s":"abcdefghi","k":3,"fill":"x"}.') }
  const { s, k, fill } = data ?? {}
  if (typeof s !== 'string' || !/^[a-z]{1,40}$/.test(s)) throw new Error('s is 1 to 40 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 40) throw new Error('k is an integer from 1 to 40.')
  if (typeof fill !== 'string' || !/^[a-z]$/.test(fill)) throw new Error('fill is a single lowercase letter.')
  return { s, k, fill }
}

export const code = `function divideString(s, k, fill) {
  const groups = []
  for (let start = 0; start < s.length; start += k) {
    groups.push(s.slice(start, start + k).padEnd(k, fill))
  }
  return groups
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: divide_string
def divide_string(s, k, fill):
    groups = []
    for start in range(0, len(s), k):
        groups.append(s[start:start + k].ljust(k, fill))
    return groups
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

export const phases = [
  { id: 'cut', label: 'Cut', description: 'Take the next k characters as a group.' },
  { id: 'pad', label: 'Pad', description: 'A short last group is filled up with the fill letter.' },
  { id: 'done', label: 'Result', description: 'All groups, each exactly k long.' },
]

export function buildTrace({ s, k, fill }) {
  const frames = []
  const groups = []
  for (let start = 0; start < s.length; start += k) {
    const piece = s.slice(start, start + k)
    const group = piece.padEnd(k, fill)
    groups.push(group)
    const padded = group !== piece
    frames.push({ phase: padded ? 'pad' : 'cut', activeLine: L('groups.push'), pythonLine: P('groups.append'), message: padded ? `The last piece "${piece}" is padded to "${group}".` : `Group ${groups.length - 1} is "${group}".`, l: start, r: Math.min(s.length, start + k) - 1, groups: [...groups] })
  }
  frames.push({ phase: 'done', activeLine: L('return groups'), pythonLine: P('return groups'), message: `${groups.length} groups of length ${k}.`, l: -1, r: -1, groups: [...groups] })
  return { input: { s, k, fill }, result: groups, frames }
}
