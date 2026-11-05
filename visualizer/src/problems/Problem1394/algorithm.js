export const phases = [
  { id: 'start', label: 'Start', description: 'Count how often each value appears.' },
  { id: 'count', label: 'Count value', description: 'Add one to the count of the current value.' },
  { id: 'lucky', label: 'Lucky value', description: 'A value is lucky when its frequency equals the value itself; keep the largest lucky value.' },
  { id: 'skip', label: 'Not lucky', description: 'Frequency and value differ, so this value is not lucky.' },
  { id: 'done', label: 'Complete', description: 'Return the largest lucky value, or -1 if none exists.' },
]

export const examples = [
  { label: 'Two lucky values', input: '{"arr":[2,2,3,4]}' },
  { label: 'None lucky', input: '{"arr":[2,2,2,3,3]}' },
  { label: 'Repeated values', input: '{"arr":[1,2,2,3,3,3]}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.arr)) throw new Error('Use an object with an arr list, such as {"arr":[2,2,3,4]}.')
  if (data.arr.length < 1 || data.arr.length > 500) throw new Error('arr must have 1 to 500 values.')
  if (!data.arr.every(v => Number.isInteger(v) && v >= 1 && v <= 500)) throw new Error('Every value must be an integer from 1 to 500.')
  return { arr: data.arr }
}

export function buildTrace({ arr }) {
  const count = new Map()
  let best = -1
  const rows = () => [...count.entries()].sort((a, b) => a[0] - b[0]).map(([value, n]) => ({ value, count: n, lucky: n === value ? 'yes' : '' }))
  const snap = (extra = {}) => ({ counts: rows(), best, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const count = new Map()'), pythonLine: P('count = Counter'), snapshot: snap(),
    message: `Count the values in ${arr.length} entries, then find the largest value whose count equals itself.` }]
  for (const v of arr) {
    count.set(v, (count.get(v) || 0) + 1)
    frames.push({ phase: 'count', activeLine: L('count.set(v'), pythonLine: P('count[v] += 1'), snapshot: snap({ current: v }),
      message: `${v} seen; it now has ${count.get(v)} copies.` })
  }
  for (const [value, n] of [...count.entries()].sort((a, b) => a[0] - b[0])) {
    if (n === value) {
      best = Math.max(best, value)
      frames.push({ phase: 'lucky', activeLine: L('if (n === value)'), pythonLine: P('if n == value'), snapshot: snap({ current: value }),
        message: `${value} appears ${n} time(s), so it is lucky; the best is now ${best}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if (n === value)'), pythonLine: P('if n == value'), snapshot: snap({ current: value }),
        message: `${value} appears ${n} time(s), not ${value}, so it is not lucky.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), snapshot: snap({ result: best }),
    message: `Return ${best}.`, result: best })
  return { input: { arr }, result: best, frames }
}

export const code = `function findLucky(arr) {
  const count = new Map()
  for (const v of arr) count.set(v, (count.get(v) || 0) + 1)
  let best = -1
  for (const [value, n] of count) {
    if (n === value) best = Math.max(best, value)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const pythonLineMap = { 1: 3, 2: 4, 3: 4, 4: 5, 5: 6, 6: 7, 7: 7, 8: 9 }

export const python = `from collections import Counter

def find_lucky(arr):
    count = Counter(arr)
    best = -1
    for value, n in count.items():
        if n == value:
            best = max(best, value)
    return best
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
