export const phases = [
  { id: 'setup', label: 'Setup', description: 'Read the stick lengths and load them into a min-heap.' },
  { id: 'heapify', label: 'Heap', description: 'Arrange the sticks so the two shortest are always at the front.' },
  { id: 'join', label: 'Join', description: 'Remove the two shortest sticks, pay their sum, and put the joined stick back.' },
  { id: 'done', label: 'Result', description: 'Report the total cost once one stick remains.' },
]

const STICK_LIMIT = 24
const LENGTH_LIMIT = 1000

export function parseInput(text) {
  let obj
  try {
    obj = typeof text === 'string' ? JSON.parse(text) : text
  } catch {
    throw new Error('Input must be JSON such as {"sticks":[4,2,7,3]}')
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Input must be a JSON object with a sticks key')
  const { sticks } = obj
  if (!Array.isArray(sticks)) throw new Error('sticks must be an array of positive integers')
  if (sticks.length < 1 || sticks.length > STICK_LIMIT) throw new Error(`sticks must contain between 1 and ${STICK_LIMIT} entries for this visualization`)
  sticks.forEach((value, index) => {
    if (!Number.isInteger(value) || value < 1 || value > LENGTH_LIMIT) throw new Error(`sticks[${index}] must be an integer from 1 to ${LENGTH_LIMIT}`)
  })
  return { sticks: [...sticks] }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function minimumCost(sticks) {', 'import heapq'],
  ['  const heap = [...sticks]; heap.sort((a, b) => a - b)', 'def minimum_cost(sticks):'],
  ['  let total = 0', '    heap = list(sticks); heapq.heapify(heap); total = 0'],
  ['  while (heap.length > 1) {', '    while len(heap) > 1:'],
  ['    const a = heap.shift(), b = heap.shift()', '        a, b = heapq.heappop(heap), heapq.heappop(heap)'],
  ['    total += a + b; heap.push(a + b); heap.sort((x, y) => x - y)', '        total += a + b; heapq.heappush(heap, a + b)'],
  ['  }', ''],
  ['  return total', '    return total'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))

export function buildTrace(text) {
  const { sticks } = parseInput(text)
  const frames = []
  let heap = [...sticks].sort((a, b) => a - b)
  let total = 0
  let joins = 0
  const snap = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, snapshot: { heap: [...heap], pair: [], joined: null, total, joins, ...extra },
  })

  snap('setup', L('const heap'), P('heap = list'), `There are ${sticks.length} sticks. Each join costs the sum of the two lengths joined.`)
  snap('heapify', L('const heap'), P('heap = list'), `The smallest stick is ${heap[0]}, so it will be joined first.`)
  snap('heapify', L('let total = 0'), P('total = 0'), 'The total cost starts at 0.')

  while (heap.length > 1) {
    heap.sort((a, b) => a - b)
    const [a, b] = heap.splice(0, 2)
    snap('join', L('const a = heap.shift()'), P('a, b = heapq'), `Remove the smallest stick ${a}.`, { pair: [a] })
    const joined = a + b
    total += joined
    joins += 1
    snap('join', L('total += a + b'), P('total += a + b'), `Join ${a} and ${b} for cost ${joined}. The running total is ${total}.`, { pair: [a, b], joined, total, joins })
    heap.push(joined)
    snap('join', L('heap.push(a + b)'), P('heapq.heappush'), `Put the new stick ${joined} back into the heap. ${heap.length} stick(s) remain.`, { pair: [], joined, total, joins })
  }

  snap('done', L('return total'), P('return total'), `One stick remains. The total cost is ${total}.`, { total, joins })
  return { input: { sticks }, result: total, frames }
}
