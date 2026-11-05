// LeetCode 2158: Amount of New Area Painted Each Day.
// Each day paints the half-open range [start, end). A "next unpainted" pointer for every cell lets each
// day skip the cells already painted, so every cell is painted once. Count the newly painted cells per day.

export function parseInput(text) {
  let plans
  try { plans = JSON.parse(text) } catch { throw new Error('Use a JSON array of [start, end] pairs, e.g. [[1,4],[4,7]].') }
  if (!Array.isArray(plans) || plans.length < 1 || plans.length > 15) throw new Error('Use 1 to 15 days.')
  for (const pair of plans) {
    if (!Array.isArray(pair) || pair.length !== 2 || !Number.isInteger(pair[0]) || !Number.isInteger(pair[1]) || pair[0] < 0 || pair[1] <= pair[0] || pair[1] > 60) {
      throw new Error('Each day is [start, end] with 0 <= start < end <= 60.')
    }
  }
  return { plans }
}

export const code = `function paintedPerDay(plans) {
  const limit = 61
  const next = Array.from({ length: limit + 1 }, (_, i) => i)
  const find = x => (next[x] === x ? x : (next[x] = find(next[x])))
  const result = []
  for (const [start, end] of plans) {
    let painted = 0
    let x = find(start)
    while (x < end) {
      painted++
      next[x] = x + 1
      x = find(x + 1)
    }
    result.push(painted)
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: painted_per_day
def painted_per_day(plans):
    limit = 61
    nxt = list(range(limit + 1))
    def find(x):
        while nxt[x] != x:
            nxt[x] = nxt[nxt[x]]
            x = nxt[x]
        return x
    result = []
    for start, end in plans:
        painted = 0
        x = find(start)
        while x < end:
            painted += 1
            nxt[x] = x + 1
            x = find(x + 1)
        result.append(painted)
    return result
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
  { id: 'day', label: 'Day range', description: 'Today paints the cells from start up to, not including, end.' },
  { id: 'skip', label: 'Skip painted', description: 'Cells already painted are skipped using the next-unpainted pointers.' },
  { id: 'paint', label: 'Paint', description: 'An unpainted cell gets painted and counts toward today.' },
  { id: 'done', label: 'Result', description: 'New area painted each day.' },
]

export function buildTrace({ plans }) {
  const frames = []
  const limit = 61
  const next = Array.from({ length: limit + 1 }, (_, i) => i)
  const find = x => (next[x] === x ? x : (next[x] = find(next[x])))
  const painted = new Array(limit).fill(false)
  const result = []
  const cells = () => painted.slice(0, 61).map(v => v)
  frames.push({ phase: 'day', activeLine: L('const next = Array'), pythonLine: P('nxt = list'), message: 'Nothing is painted yet.', day: -1, range: null, cells: cells(), current: null, result: [] })
  plans.forEach(([start, end], day) => {
    frames.push({ phase: 'day', activeLine: L('for (const [start, end]'), pythonLine: P('for start, end in plans'), message: `Day ${day}: paint [${start}, ${end}).`, day, range: [start, end], cells: cells(), current: null, result: [...result] })
    let count = 0
    let x = find(start)
    while (x < end) {
      count++
      painted[x] = true
      next[x] = x + 1
      frames.push({ phase: 'paint', activeLine: L('painted++'), pythonLine: P('painted += 1'), message: `Cell ${x} was unpainted and is now painted.`, day, range: [start, end], cells: cells(), current: x, result: [...result] })
      x = find(x + 1)
    }
    result.push(count)
    frames.push({ phase: 'skip', activeLine: L('result.push(painted)'), pythonLine: P('result.append(painted)'), message: `Day ${day} adds ${count} new cell${count === 1 ? '' : 's'}.`, day, range: [start, end], cells: cells(), current: null, result: [...result] })
  })
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), message: `New area per day: ${result.join(', ')}.`, day: -1, range: null, cells: cells(), current: null, result: [...result] })
  return { input: { plans }, result, frames }
}
