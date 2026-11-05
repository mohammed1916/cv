// Count good meals: a pair sums to a power of two; each value looks up the earlier values that complete it.
const JS_LINES = [
  { text: 'const seen = new Map()', py: 'seen = {}' },
  { text: 'let pairs = 0', py: 'pairs = 0' },
  { text: 'for (const v of deliciousness) {', py: 'for v in' },
  { text: 'for (let p = 0; p <= 21; p++) {', py: 'for p in range(22)' },
  { text: 'const need = (1 << p) - v', py: 'need = (1 << p)' },
  { text: 'pairs += seen.get(need) ?? 0', py: 'pairs += seen.get' },
  { text: '}', py: null },
  { text: 'seen.set(v, (seen.get(v) ?? 0) + 1)', py: 'seen[v] = ' },
  { text: '}', py: null },
  { text: 'return pairs % 1000000007', py: 'return pairs' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def countPairs(deliciousness):
    seen = {}
    pairs = 0
    for v in deliciousness:
        for p in range(22):
            need = (1 << p) - v
            pairs += seen.get(need, 0)
        seen[v] = seen.get(v, 0) + 1
    return pairs % (10 ** 9 + 7)
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return pairs')]))

export const phases = [
  { id: 'meal', label: 'Meal', description: 'Take the next meal value v.' },
  { id: 'powers', label: 'Powers', description: 'For each power of two, look up the earlier meal that would complete the sum.' },
  { id: 'record', label: 'Record', description: 'Add this meal to the earlier meals before the next one.' },
  { id: 'done', label: 'Result', description: 'Every pair is counted once, when its later meal arrives.' },
]

export const examples = [
  { label: 'Small set', input: '[1,3,5,7,9]' },
  { label: 'Repeated values', input: '[2,2,6,2]' },
]

export const complexity = 'O(n * 22) time and O(n) space for n meals. Values are at most 2^20, so the sums stay below 2^21.'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 20) throw new Error('Use a JSON array of 1 to 20 meal values (visual cap).')
  if (!values.every(v => Number.isInteger(v) && v >= 0 && v <= 1 << 20)) throw new Error('Values are integers from 0 to 2^20.')
  return values
}

export function buildTrace(values) {
  const frames = []
  const seen = new Map()
  let pairs = 0
  const snap = extra => ({ pairs, seen: Object.fromEntries(seen), ...extra })
  values.forEach(v => {
    frames.push({ phase: 'meal', activeLine: 3, value: v, matches: [], message: `Meal ${v}.`, snapshot: snap({}) })
    const matches = []
    for (let p = 0; p <= 21; p++) {
      const need = (1 << p) - v
      const count = seen.get(need) ?? 0
      if (count > 0) {
        pairs += count
        matches.push({ power: 1 << p, need, count })
      }
    }
    frames.push({ phase: 'powers', activeLine: 6, value: v, matches, message: matches.length ? matches.map(m => `${v} + ${m.need} = ${m.power}: +${m.count}`).join('; ') : `No earlier meal completes a power of two with ${v}.`, snapshot: snap({}) })
    seen.set(v, (seen.get(v) ?? 0) + 1)
    frames.push({ phase: 'record', activeLine: 8, value: v, matches, message: `Meal ${v} is now available to later meals.`, snapshot: snap({}) })
  })
  const result = pairs % 1000000007
  frames.push({ phase: 'done', activeLine: 10, value: null, result, message: `Good meal pairs: ${result}.`, snapshot: snap({ result }) })
  return { input: values, result, frames }
}
