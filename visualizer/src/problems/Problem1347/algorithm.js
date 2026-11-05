export const phases = [
  { id: 'start', label: 'Start', description: 'Count the letters of s and of t.' },
  { id: 'count', label: 'Count letters', description: 'Tally each letter that appears in s or in t.' },
  { id: 'extra', label: 'Extra in t', description: 'Each letter that t has more of than s must be changed in s; each one is one step.' },
  { id: 'done', label: 'Complete', description: 'Return the total number of changes.' },
]

export const examples = [
  { label: 'Two swaps', input: '{"s":"bab","t":"aba"}' },
  { label: 'Disjoint letters', input: '{"s":"aabbcc","t":"xxyyzz"}' },
  { label: 'Already anagrams', input: '{"s":"abcd","t":"dcba"}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.s !== 'string' || typeof data.t !== 'string') throw new Error('Use an object with strings s and t, such as {"s":"bab","t":"aba"}.')
  if (data.s.length !== data.t.length) throw new Error('s and t must have the same length.')
  if (data.s.length < 1 || data.s.length > 20) throw new Error('s and t may have 1 to 20 letters in this visualization.')
  if (!/^[a-z]+$/.test(data.s + data.t)) throw new Error('Use lowercase letters only.')
  return { s: data.s, t: data.t }
}

export function buildTrace({ s, t }) {
  const count = new Map()
  for (const ch of s) count.set(ch, (count.get(ch) || 0) + 1)
  const rows = () => [...count.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([letter, n]) => ({ letter, n }))
  const snap = (extra = {}) => ({ counts: rows(), ...extra })
  const frames = [{ phase: 'start', activeLine: L('const count = new Map()'), pythonLine: P('count = Counter'), snapshot: snap({ s, t }),
    message: `Count the letters of ${s}, then see which letters of ${t} are missing.` }]
  const diff = new Map(count)
  for (const ch of t) {
    diff.set(ch, (diff.get(ch) || 0) - 1)
  }
  let steps = 0
  for (const [ch, v] of [...diff.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (v < 0) {
      steps += -v
      frames.push({ phase: 'extra', activeLine: L('if (v < 0)'), pythonLine: P('if d < 0'), snapshot: snap({ letter: ch, extra: -v }),
        message: `t has ${-v} more ${ch} than s, so ${-v} change(s) are needed.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return steps'), pythonLine: P('return steps'), snapshot: snap({ steps }),
    message: `Return ${steps}: that many letters of s must change.`, result: steps })
  return { input: { s, t }, result: steps, frames }
}

export const code = `function minSteps(s, t) {
  const count = new Map()
  for (const ch of s) count.set(ch, (count.get(ch) || 0) + 1)
  for (const ch of t) count.set(ch, (count.get(ch) || 0) - 1)
  let steps = 0
  for (const v of count.values()) {
    if (v < 0) steps += -v
  }
  return steps
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def min_steps(s, t):
    count = Counter(s)
    count.subtract(Counter(t))
    steps = 0
    for d in count.values():
        if d < 0:
            steps += -d
    return steps
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
