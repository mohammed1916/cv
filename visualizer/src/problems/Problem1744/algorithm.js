// Can you eat candy: eating at least one a day and at most cap a day, you can be on type t on day d when d+1 <= total up to t and prefix before t < (d+1) * cap.
const JS_LINES = [
  { text: 'const prefix = [0]', py: 'prefix = [0]' },
  { text: 'for (const c of candiesCount) prefix.push(prefix[prefix.length - 1] + c)', py: 'for c in candies' },
  { text: 'return queries.map(([t, d, cap]) => d + 1 <= prefix[t + 1] && prefix[t] < (d + 1) * cap)', py: 'return [' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def canEat(candies, queries):
    prefix = [0]
    for c in candies:
        prefix.append(prefix[-1] + c)
    return [d + 1 <= prefix[t + 1] and prefix[t] < (d + 1) * cap for t, d, cap in queries]
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py)]))

export const phases = [
  { id: 'prefix', label: 'Prefix', description: 'Prefix sums give the range of candy numbers for each type.' },
  { id: 'window', label: 'Window', description: 'The favourite type covers candy numbers from prefix[t]+1 to prefix[t+1].' },
  { id: 'pace', label: 'Pace', description: 'By day d you have eaten between d+1 and (d+1) × cap candies; the two ranges must overlap.' },
  { id: 'done', label: 'Result', description: 'One answer per query, in order.' },
]

export const examples = [
  { label: 'Pace fits', input: '{"candies":[4,2,6],"queries":[[0,3,2],[2,1,3],[1,0,2]]}' },
  { label: 'Too slow', input: '{"candies":[5,1],"queries":[[1,0,2]]}' },
]

export const complexity = 'O(n + q) time for n types and q queries, with prefix sums built once.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.candies) || !Array.isArray(input.queries)) throw new Error('Use an object with candies and queries.')
  const { candies, queries } = input
  if (candies.length < 1 || candies.length > 10) throw new Error('Use 1 to 10 candy types (visual cap).')
  if (!candies.every(c => Number.isInteger(c) && c >= 1 && c <= 20)) throw new Error('Candy counts are integers from 1 to 20.')
  for (const [t, d, cap] of queries) {
    if (![t, d, cap].every(Number.isInteger) || t < 0 || t >= candies.length || d < 0 || d > 60 || cap < 1 || cap > 20) throw new Error('Each query is [type, day, cap] within the visual limits.')
  }
  return { candies, queries }
}

export function buildTrace({ candies, queries }) {
  const frames = []
  const prefix = [0]
  for (const c of candies) prefix.push(prefix[prefix.length - 1] + c)
  const answers = []
  frames.push({ phase: 'prefix', activeLine: 2, query: -1, prefix: [...prefix], message: `Candy numbers end at ${prefix.slice(1).join(', ')}.`, snapshot: { prefix: [...prefix], answers: [] } })
  queries.forEach(([t, d, cap], j) => {
    const low = prefix[t] + 1
    const high = prefix[t + 1]
    frames.push({ phase: 'window', activeLine: 3, query: j, prefix: [...prefix], type: t, day: d, cap, message: `Type ${t}: candy numbers ${low} to ${high}.`, snapshot: { prefix: [...prefix], answers: [...answers] } })
    const ok = d + 1 <= prefix[t + 1] && prefix[t] < (d + 1) * cap
    answers.push(ok)
    frames.push({ phase: 'pace', activeLine: 3, query: j, prefix: [...prefix], type: t, day: d, cap, verdict: ok, message: `By day ${d} you eat ${d + 1} to ${(d + 1) * cap}; ${ok ? 'overlaps' : 'does not overlap'} with ${low} to ${high}.`, snapshot: { prefix: [...prefix], answers: [...answers] } })
  })
  frames.push({ phase: 'done', activeLine: 3, query: -1, result: answers, message: `Answers: ${answers.map(String).join(', ')}.`, snapshot: { prefix: [...prefix], answers: [...answers] } })
  return { input: { candies, queries }, result: answers, frames }
}
