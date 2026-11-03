export const phases = [
  { id: 'links', label: 'Neighbors', description: 'Pick each index closest neighbor by value.' },
  { id: 'query', label: 'Query', description: 'Start a cheapest-cost search for one pair.' },
  { id: 'settle', label: 'Settle', description: 'Fix the cheapest unsettled index.' },
  { id: 'relax', label: 'Relax', description: 'Offer a cheaper cost to another index.' },
  { id: 'store', label: 'Store', description: 'Record the answer for this query.' },
  { id: 'done', label: 'Result', description: 'Return every query answer.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12) throw new Error('nums has 2 to 12 values.')
  if (!nums.every(v => Number.isInteger(v)) || nums.some((v, i) => i > 0 && v <= nums[i - 1])) throw new Error('nums must be strictly increasing integers.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries has 1 to 6 [start, end] pairs.')
  for (const pair of queries) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(x => Number.isInteger(x) && x >= 0 && x < nums.length)) throw new Error('Each query is [start, end] with valid zero-based indices.')
  }
  return { nums, queries }
}

function closestOf(nums, i) {
  const options = []
  if (i > 0) options.push(i - 1)
  if (i < nums.length - 1) options.push(i + 1)
  let best = options[0]
  for (const k of options) {
    if (Math.abs(nums[i] - nums[k]) < Math.abs(nums[i] - nums[best])) best = k
  }
  return best
}

export function buildTrace({ nums, queries }) {
  const n = nums.length
  const closest = nums.map((_, i) => closestOf(nums, i))
  const frames = []
  const answers = []
  frames.push({ phase: 'links', activeLine: L('let closest[i]'), pythonLine: P('closest = []'), message: 'Each index keeps one closest neighbor by value gap. Ties go to the lower index.', nums, closest, start: -1, end: -1, current: -1, dist: null, relaxTo: -1, answers: [] })
  for (const [start, end] of queries) {
    const dist = Array(n).fill(Infinity)
    const done = Array(n).fill(false)
    dist[start] = 0
    frames.push({ phase: 'query', activeLine: L('for each query [start'), pythonLine: P('for start, end in queries'), message: `Search from index ${start} toward index ${end}.`, nums, closest, start, end, current: -1, dist: dist.slice(), relaxTo: -1, answers: answers.slice() })
    for (;;) {
      let u = -1
      for (let v = 0; v < n; v++) if (!done[v] && dist[v] < Infinity && (u < 0 || dist[v] < dist[u])) u = v
      if (u < 0) break
      done[u] = true
      frames.push({ phase: 'settle', activeLine: L('let u be the unsettled'), pythonLine: P('u = -1'), message: `Index ${u} settles at cost ${dist[u]}.`, nums, closest, start, end, current: u, dist: dist.slice(), relaxTo: -1, answers: answers.slice() })
      if (u === end) break
      for (let v = 0; v < n; v++) {
        if (v === u) continue
        const cost = dist[u] + Math.abs(nums[u] - nums[v])
        if (cost < dist[v]) {
          dist[v] = cost
          frames.push({ phase: 'relax', activeLine: L('relax dist[v]'), pythonLine: P('dist[v] = min(dist[v]'), message: `A direct move from ${u} to ${v} costs ${cost}.`, nums, closest, start, end, current: u, dist: dist.slice(), relaxTo: v, answers: answers.slice() })
        }
      }
      const c = closest[u]
      if (dist[u] + 1 < dist[c]) {
        dist[c] = dist[u] + 1
        frames.push({ phase: 'relax', activeLine: L('relax dist[closest[u]]'), pythonLine: P('dist[closest[u]] = min'), message: `The neighbor move from ${u} to ${c} costs one.`, nums, closest, start, end, current: u, dist: dist.slice(), relaxTo: c, answers: answers.slice() })
      }
    }
    answers.push(dist[end])
    frames.push({ phase: 'store', activeLine: L('store dist[end]'), pythonLine: P('answers.append(dist[end])'), message: `The cheapest cost from ${start} to ${end} is ${dist[end]}.`, nums, closest, start, end, current: -1, dist: dist.slice(), relaxTo: -1, answers: answers.slice() })
  }
  frames.push({ phase: 'done', activeLine: L('return the stored answers'), pythonLine: P('return answers'), message: 'All query costs are stored.', nums, closest, start: -1, end: -1, current: -1, dist: null, relaxTo: -1, answers: answers.slice() })
  return { input: { nums, queries }, result: answers, frames }
}

export const code = `minimum cost between indices
  let closest[i] be the neighbor with the smallest value gap, lower index on ties
  for each query [start, end]
    let dist be infinity everywhere with dist[start] set to 0
    repeat
      let u be the unsettled index with the smallest dist
      if u is end then stop
      mark u as settled
      for each index v other than u
        relax dist[v] with dist[u] plus the absolute value gap
      relax dist[closest[u]] with dist[u] plus one
    store dist[end] as the answer
  return the stored answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def minimum_move_costs(nums, queries):
    n = len(nums)
    closest = []
    for i in range(n):
        options = []
        if i > 0:
            options.append(i - 1)
        if i < n - 1:
            options.append(i + 1)
        best = options[0]
        for k in options:
            if abs(nums[i] - nums[k]) < abs(nums[i] - nums[best]):
                best = k
        closest.append(best)
    answers = []
    for start, end in queries:
        dist = [float('inf')] * n
        done = [False] * n
        dist[start] = 0
        while True:
            u = -1
            for v in range(n):
                if not done[v] and dist[v] < float('inf') and (u < 0 or dist[v] < dist[u]):
                    u = v
            if u < 0 or u == end:
                break
            done[u] = True
            for v in range(n):
                if v != u:
                    dist[v] = min(dist[v], dist[u] + abs(nums[u] - nums[v]))
            dist[closest[u]] = min(dist[closest[u]], dist[u] + 1)
        answers.append(dist[end])
    return answers`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
