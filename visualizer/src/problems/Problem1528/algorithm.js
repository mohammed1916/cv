export const phases = [
  { id: 'start', label: 'Empty slots', description: 'Make one empty slot for every letter, numbered by its destination position.' },
  { id: 'place', label: 'Move a letter', description: 'Read the letter at the current index and drop it into the slot named by its index entry.' },
  { id: 'done', label: 'Read out', description: 'Read the slots from left to right to get the restored string.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"s": "abc", "indices": [2, 0, 1]}.')
  const { s, indices } = input
  if (typeof s !== 'string' || !/^[a-z]{1,12}$/.test(s)) throw new Error('s is 1 to 12 lowercase letters.')
  if (!Array.isArray(indices) || indices.length !== s.length || [...indices].sort((a, b) => a - b).some((v, i) => v !== i)) {
    throw new Error('indices must hold each number from 0 to length-1 exactly once, one per letter.')
  }
  return { s, indices }
}

export const code = [
  "function restoreString(s, indices) {",
  "  const out = new Array(s.length)",
  "  for (let i = 0; i < s.length; i++) {",
  "    out[indices[i]] = s[i] }",
  "  return out.join('') }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def restore_string(s, indices):
    out = [""] * len(s)
    for i in range(len(s)):
        out[indices[i]] = s[i]
    return "".join(out)
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

export function buildTrace({ s, indices }) {
  const out = Array(s.length).fill(null)
  const frames = []
  const snap = (i, slots) => ({ s, indices, i, slots: [...slots] })
  frames.push({ phase: 'start', ...at('out = new Array', 'out = ['), message: `Make ${s.length} empty slots. Each letter will be dropped into the slot named by its index.`, snapshot: snap(null, out) })
  for (let i = 0; i < s.length; i++) {
    out[indices[i]] = s[i]
    frames.push({ phase: 'place', ...at('out[indices[i]] = s[i]', 'out[indices[i]] = s[i]'), message: `Letter ${s[i]} (position ${i}) goes to slot ${indices[i]}.`, snapshot: snap(i, out) })
  }
  const result = out.join('')
  frames.push({ phase: 'done', ...at('return out.join', 'return "".join'), message: `Reading the slots left to right gives "${result}".`, snapshot: snap(null, out) })
  return { input: { s, indices }, result, frames }
}
