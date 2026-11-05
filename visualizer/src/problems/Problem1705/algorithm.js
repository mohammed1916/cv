// Maximum eaten apples: each day eat the apple batch that rots soonest among the ones still fresh.
const JS_LINES = [
  { text: 'let eaten = 0', py: 'eaten = 0' },
  { text: 'const pq = []', py: 'pq = []' },
  { text: 'for (let day = 0; day < n || pq.length > 0; day++) {', py: 'while day < n or pq' },
  { text: 'if (day < n && apples[day] > 0) pq.push({ expire: day + days[day], count: apples[day] })', py: 'heapq.heappush(pq, [day + days' },
  { text: 'pq.sort((a, b) => a.expire - b.expire)', py: null },
  { text: 'while (pq.length && (pq[0].expire <= day || pq[0].count === 0)) pq.shift()', py: 'while pq and' },
  { text: 'if (pq.length) { pq[0].count--; eaten++ }', py: 'if pq:' },
  { text: '}', py: null },
  { text: 'return eaten', py: 'return eaten' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `import heapq

def eatenApples(apples, days):
    n = len(apples)
    eaten = 0
    pq = []
    day = 0
    while day < n or pq:
        if day < n and apples[day] > 0:
            heapq.heappush(pq, [day + days[day], apples[day]])
        while pq and (pq[0][0] <= day or pq[0][1] == 0):
            heapq.heappop(pq)
        if pq:
            pq[0][1] -= 1
            eaten += 1
        day += 1
    return eaten
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'while day < n or pq')]))

export const phases = [
  { id: 'grow', label: 'Grow', description: 'A new batch joins with the day it rots on.' },
  { id: 'rot', label: 'Rot', description: 'Batches that rot today or earlier are thrown away.' },
  { id: 'eat', label: 'Eat', description: 'Eat one apple from the batch that rots soonest.' },
  { id: 'done', label: 'Result', description: 'Days continue after day n while fresh apples remain.' },
]

export const examples = [
  { label: 'Two batches overlap', input: '{"apples":[2,0,3,1,2],"days":[2,1,4,3,1]}' },
  { label: 'Rot before eating', input: '{"apples":[3,1],"days":[1,4]}' },
]

export const complexity = 'O(D * log n) with a heap, where D is the number of days simulated. This visual sorts the batches each day and caps n at 10.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.apples) || !Array.isArray(input.days) || input.apples.length !== input.days.length) throw new Error('Use an object with equal-length apples and days arrays.')
  const { apples, days } = input
  if (apples.length < 1 || apples.length > 10) throw new Error('Use 1 to 10 days (visual cap).')
  apples.forEach((a, i) => {
    if (!Number.isInteger(a) || a < 0 || a > 20) throw new Error('apples[i] is an integer from 0 to 20.')
    if (!Number.isInteger(days[i]) || days[i] < 0 || days[i] > 20) throw new Error('days[i] is an integer from 0 to 20.')
  })
  return { apples, days }
}

export function buildTrace({ apples, days }) {
  const n = apples.length
  const frames = []
  const pq = []
  let eaten = 0
  const snap = extra => ({ eaten, batches: pq.map(b => ({ expire: b.expire, count: b.count })), ...extra })
  for (let day = 0; day < n || pq.length > 0; day++) {
    if (day < n && apples[day] > 0) {
      pq.push({ expire: day + days[day], count: apples[day] })
      frames.push({ phase: 'grow', activeLine: 4, day, message: `Day ${day}: ${apples[day]} apples join, rotting on day ${day + days[day]}.`, snapshot: snap({}) })
    }
    pq.sort((a, b) => a.expire - b.expire)
    const before = pq.length
    while (pq.length && (pq[0].expire <= day || pq[0].count === 0)) pq.shift()
    if (pq.length < before) frames.push({ phase: 'rot', activeLine: 6, day, message: `Day ${day}: ${before - pq.length} batch${before - pq.length === 1 ? '' : 'es'} rotten and removed.`, snapshot: snap({}) })
    if (pq.length) {
      pq[0].count--
      eaten++
      frames.push({ phase: 'eat', activeLine: 7, day, message: `Day ${day}: eat one from the batch rotting on day ${pq[0].expire}.`, snapshot: snap({}) })
    } else {
      frames.push({ phase: 'eat', activeLine: 7, day, message: `Day ${day}: nothing fresh to eat.`, snapshot: snap({}) })
    }
  }
  frames.push({ phase: 'done', activeLine: 9, day: -1, result: eaten, message: `Eaten apples: ${eaten}.`, snapshot: snap({ result: eaten }) })
  return { input: { apples, days }, result: eaten, frames }
}
