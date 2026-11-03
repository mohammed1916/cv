export const phases = [
  { id: 'setup', label: 'Setup', description: 'Read the stick lengths and load them into a min-heap.' },
  { id: 'heapify', label: 'Heap', description: 'Arrange the sticks so the two shortest are always at the front.' },
  { id: 'join', label: 'Join', description: 'Remove the two shortest sticks, pay their sum, and put the joined stick back.' },
  { id: 'done', label: 'Result', description: 'Report the total cost once one stick remains.' },
]

const CODE_LINES = [
  'FUNCTION minimumCost(sticks)',
  '  heap <- sticks arranged as a min-heap',
  '  total <- 0',
  '  WHILE the heap holds more than one stick',
  '    a <- remove the smallest stick',
  '    b <- remove the smallest stick',
  '    joined <- a + b; total <- total + joined',
  '    push joined back onto the heap',
  '  RETURN total',
]

const PYTHON_LINES = [
  'import heapq',
  'def minimumCost(sticks):',
  '    heap = list(sticks)',
  '    heapq.heapify(heap)',
  '    total = 0',
  '    while len(heap) > 1:',
  '        a = heapq.heappop(heap)',
  '        b = heapq.heappop(heap)',
  '        joined = a + b',
  '        total += joined',
  '        heapq.heappush(heap, joined)',
  '    return total',
]

const py = text => PYTHON_LINES.findIndex(line => line.includes(text)) + 1

export const python = PYTHON_LINES.join('\n')
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = {
  1: py('def '), 2: py('heapify'), 3: py('total = 0'), 4: py('while'), 5: py('a = heapq'), 6: py('joined = '), 7: py('heappush'), 8: py('return total'),
}

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

export function buildTrace(text) {
  const { sticks } = parseInput(text)
  const frames = []
  let heap = [...sticks].sort((a, b) => a - b)
  let total = 0
  let joins = 0
  const snap = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message, snapshot: { heap: [...heap], pair: [], joined: null, total, joins, ...extra },
  })

  snap('setup', 1, `There are ${sticks.length} sticks. Each join costs the sum of the two lengths joined.`)
  snap('heapify', 2, `The smallest stick is ${heap[0]}, so it will be joined first.`)
  snap('heapify', 3, 'The total cost starts at 0.')

  while (heap.length > 1) {
    heap.sort((a, b) => a - b)
    const [a, b] = heap.splice(0, 2)
    snap('join', 5, `Remove the smallest stick ${a}.`, { pair: [a] })
    const joined = a + b
    total += joined
    joins += 1
    snap('join', 6, `Join ${a} and ${b} for cost ${joined}. The running total is ${total}.`, { pair: [a, b], joined, total, joins })
    heap.push(joined)
    snap('join', 7, `Put the new stick ${joined} back into the heap. ${heap.length} stick(s) remain.`, { pair: [], joined, total, joins })
  }

  snap('done', 8, `One stick remains. The total cost is ${total}.`, { total, joins })
  return { input: { sticks }, result: total, frames }
}
