// Calculate money: day i (0-based) brings money (i div 7) + (i mod 7) + 1.
const JS_LINES = [
  { text: 'let total = 0', py: 'total = 0' },
  { text: 'for (let day = 0; day < n; day++) {', py: 'for day in range' },
  { text: 'const week = Math.floor(day / 7)', py: 'week = day // 7' },
  { text: 'total += week + (day % 7) + 1', py: 'total += week' },
  { text: '}', py: null },
  { text: 'return total', py: 'return total' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def totalMoney(n):
    total = 0
    for day in range(n):
        week = day // 7
        total += week + (day % 7) + 1
    return total
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return total')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'No money saved yet.' },
  { id: 'deposit', label: 'Deposit', description: 'Each day deposits one more than the day before, but the Monday amount resets to the week number.' },
  { id: 'done', label: 'Result', description: 'The total after n days.' },
]

export const examples = [
  { label: 'Within the first week', input: '5' },
  { label: 'Into the second week', input: '9' },
  { label: 'Three weeks', input: '15' },
]

export const complexity = 'O(n) time and O(1) space for n days.'

export function parseInput(text) {
  const n = Number(text.trim())
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('Enter an integer from 1 to 1000.')
  return n
}

export function buildTrace(n) {
  const frames = []
  const weeks = []
  let total = 0
  const snap = extra => ({ total, weeks: weeks.map(w => [...w]), ...extra })
  frames.push({ phase: 'start', activeLine: 1, day: -1, message: 'Start with nothing saved.', snapshot: snap({}) })
  for (let day = 0; day < n; day++) {
    const week = Math.floor(day / 7)
    const amount = week + (day % 7) + 1
    total += amount
    if (!weeks[week]) weeks[week] = []
    weeks[week][day % 7] = amount
    frames.push({ phase: 'deposit', activeLine: 4, day, amount, message: `Day ${day + 1} deposits ${amount}; total ${total}.`, snapshot: snap({}) })
  }
  frames.push({ phase: 'done', activeLine: 6, day: n - 1, result: total, message: `Total after ${n} days: ${total}.`, snapshot: snap({ result: total }) })
  return { input: n, result: total, frames }
}
