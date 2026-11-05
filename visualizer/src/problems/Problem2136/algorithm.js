// LeetCode 2136: Earliest Possible Day of Full Bloom.
// Planting is one seed at a time, and growth can overlap with planting later seeds. Plant seeds with the
// longest growth time first. A seed finishes planting at the running total of plant times, and blooms
// grow time days after that. The answer is the largest finish-plus-growth over all seeds.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"plantTime":[1,4,3],"growTime":[2,3,1]}.') }
  const { plantTime, growTime } = data ?? {}
  if (!Array.isArray(plantTime) || !Array.isArray(growTime) || plantTime.length < 1 || plantTime.length > 12 || plantTime.length !== growTime.length) {
    throw new Error('plantTime and growTime need the same length, 1 to 12.')
  }
  if ([...plantTime, ...growTime].some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Times are integers from 1 to 50.')
  return { plantTime, growTime }
}

export const code = `function earliestFullBloom(plantTime, growTime) {
  const order = plantTime.map((_, i) => i).sort((a, b) => growTime[b] - growTime[a])
  let planted = 0
  let best = 0
  for (const i of order) {
    planted += plantTime[i]
    best = Math.max(best, planted + growTime[i])
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: earliest_full_bloom
def earliest_full_bloom(plantTime, growTime):
    order = sorted(range(len(plantTime)), key=lambda i: -growTime[i])
    planted = 0
    best = 0
    for i in order:
        planted += plantTime[i]
        best = max(best, planted + growTime[i])
    return best
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
  { id: 'sort', label: 'Longest growth first', description: 'Seeds with the longest growth time are planted first.' },
  { id: 'plant', label: 'Plant', description: 'Planting finishes at the running total; growth follows it.' },
  { id: 'done', label: 'Result', description: 'The last bloom day.' },
]

export function buildTrace({ plantTime, growTime }) {
  const frames = []
  const order = plantTime.map((_, i) => i).sort((a, b) => growTime[b] - growTime[a])
  frames.push({ phase: 'sort', activeLine: L('const order'), pythonLine: P('order = sorted'), message: `Plant order by growth time: ${order.map(i => `seed ${i} (grow ${growTime[i]})`).join(', ')}.`, rows: [], best: 0, planted: 0, current: -1 })
  let planted = 0
  let best = 0
  const rows = []
  for (const i of order) {
    planted += plantTime[i]
    const bloom = planted + growTime[i]
    best = Math.max(best, bloom)
    rows.push({ seed: i, plant: plantTime[i], grow: growTime[i], planted: planted, blooms: bloom })
    frames.push({ phase: 'plant', activeLine: L('planted += plantTime[i]'), pythonLine: P('planted += plantTime[i]'), message: `Seed ${i} is planted on day ${planted - 1}; it blooms on day ${bloom - 1}. Latest bloom so far: ${best - 1}.`, rows: rows.map(r => ({ ...r })), best, planted, current: i })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), message: `The last seed blooms after ${best} days (last bloom day ${best - 1}).`, rows: rows.map(r => ({ ...r })), best, planted, current: -1 })
  return { input: { plantTime, growTime }, result: best, frames }
}
