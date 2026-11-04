import { TracedHeap, heapView } from '../../components/shared/heapModel.js'

export const phases = [
  { id: 'build', label: 'Build', description: 'Every layer starts in the heap with count 0.' },
  { id: 'call', label: 'Call', description: 'The next operation arrives.' },
  { id: 'noop', label: 'No change', description: 'The cell already holds that bit.' },
  { id: 'flip', label: 'Flip', description: 'Change the bit and the layer count.' },
  { id: 'push', label: 'Push', description: 'Add the layer with its new count; older entries are left behind.' },
  { id: 'peek', label: 'Peek', description: 'Compare the top entry with the true count of its layer.' },
  { id: 'stale', label: 'Discard', description: 'A count that no longer matches is thrown away.' },
  { id: 'answer', label: 'Answer', description: 'A matching top entry is the layer to report.' },
  { id: 'done', label: 'Result', description: 'All calls are finished.' },
]

const MAX_N = 6
const MAX_CALLS = 24

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and calls.')
  const { n, calls } = input
  if (!Number.isInteger(n) || n < 1 || n > MAX_N) throw new Error(`n is an integer from 1 to ${MAX_N} here.`)
  if (!Array.isArray(calls) || calls.length < 1 || calls.length > MAX_CALLS) throw new Error(`calls has 1 to ${MAX_CALLS} entries.`)
  for (const call of calls) {
    if (!Array.isArray(call)) throw new Error('Each call is a list such as ["setCell",0,1,2] or ["largestMatrix"].')
    const [name, ...args] = call
    if (name === 'largestMatrix') {
      if (args.length) throw new Error('largestMatrix takes no arguments.')
    } else if (name === 'setCell' || name === 'unsetCell') {
      if (args.length !== 3 || args.some(v => !Number.isInteger(v) || v < 0 || v >= n)) throw new Error(`${name} needs x, y and z from 0 to ${n - 1}.`)
    } else throw new Error('Calls are setCell, unsetCell or largestMatrix.')
  }
  return { n, calls: calls.map(call => [...call]) }
}

export const code = `class keeping an n by n by n grid of bits
  on start: all bits 0, every layer count 0, heap holds (0, x) for every layer
  to set or clear cell (x, y, z)
    if the bit already has that value, stop
    change the bit and add or subtract 1 from count[x]
    push (count[x], x) and leave older entries of x where they are
  to report the largest layer
    while the top entry's count differs from count[x], pop it
    return x from the top entry`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import heapq


class Matrix3D:
    def __init__(self, n):
        self.on = set()
        self.count = [0] * n
        self.heap = [(0, -x) for x in range(n)]
        heapq.heapify(self.heap)

    def _write(self, x, y, z, value):
        if ((x, y, z) in self.on) == value:
            return
        if value:
            self.on.add((x, y, z))
            self.count[x] += 1
        else:
            self.on.remove((x, y, z))
            self.count[x] -= 1
        heapq.heappush(self.heap, (-self.count[x], -x))

    def setCell(self, x, y, z):
        self._write(x, y, z, True)

    def unsetCell(self, x, y, z):
        self._write(x, y, z, False)

    def largestMatrix(self):
        while -self.heap[0][0] != self.count[-self.heap[0][1]]:
            heapq.heappop(self.heap)
        return -self.heap[0][1]


def run_calls(n, calls):
    matrix = Matrix3D(n)
    return [getattr(matrix, name)(*args) for name, *args in calls]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Pseudocode line missing: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.trim().split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line missing: ${text}`)
  return index + 1
}

const TITLE = 'Max-heap of count@layer: more 1s first, then the larger layer'
const parseEntry = ([count, x]) => ({ count, x })

export function buildTrace({ n, calls }) {
  const on = new Set()
  const count = Array(n).fill(0)
  const heap = new TracedHeap((a, b) => b[0] - a[0] || b[1] - a[1], { order: 'max', format: ([c, x]) => `${c}@${x}` })
  for (let x = 0; x < n; x++) heap.push([0, x])
  heap.takeOps()
  const ops = calls.map(([name, ...args]) => ({ name, args }))
  const frames = []
  let current = -1
  const emit = (phase, activeLine, pythonLine, message, extra = {}) => {
    frames.push({
      phase, activeLine, pythonLine, message, n, current,
      on: [...on], count: [...count], ops: ops.map(op => ({ ...op })),
      cell: null, layer: null, top: null, stale: false, answer: null,
      ...heapView(heap, { title: TITLE }), ...extra,
    })
  }

  emit('build', L('on start'), P('heapq.heapify'), `The ${n} by ${n} by ${n} grid is empty. Layer ${n - 1} leads because a tie goes to the larger index.`)
  const returned = []
  calls.forEach(([name, ...args], k) => {
    current = k
    if (name === 'largestMatrix') {
      emit('call', L('to report the largest layer'), P('def largestMatrix'), 'Which layer holds the most 1s?')
      for (;;) {
        const top = parseEntry(heap.peek())
        const stale = top.count !== count[top.x]
        emit('peek', L('top entry\'s count'), P('while -self.heap'), stale
          ? `The top says layer ${top.x} has ${top.count}, but it really has ${count[top.x]}. This entry is out of date.`
          : `The top says layer ${top.x} has ${top.count}, and count[${top.x}] agrees.`, { top, stale, layer: top.x })
        if (!stale) break
        heap.pop()
        emit('stale', L('top entry\'s count'), P('heapq.heappop'), `Pop ${top.count}@${top.x}. It described layer ${top.x} before its count changed.`, { top, stale: true, layer: top.x })
      }
      const { x } = parseEntry(heap.peek())
      ops[k].returned = x
      returned.push(x)
      emit('answer', L('return x from the top'), P('return -self.heap[0][1]'), `Return ${x}: layer ${x} has ${count[x]} ones and no layer beats it.`, { answer: x, layer: x, top: parseEntry(heap.peek()) })
      return
    }
    const [x, y, z] = args
    const value = name === 'setCell'
    const cell = [x, y, z]
    const key = cell.join(',')
    emit('call', L('to set or clear'), P(value ? 'def setCell' : 'def unsetCell'), `${name}(${x}, ${y}, ${z}) wants this bit to be ${value ? 1 : 0}.`, { cell, layer: x })
    if (on.has(key) === value) {
      ops[k].returned = null
      returned.push(null)
      emit('noop', L('if the bit already'), P('return'), `Cell (${x}, ${y}, ${z}) is already ${value ? 1 : 0}. count[${x}] must not change, so nothing is pushed.`, { cell, layer: x })
      return
    }
    if (value) { on.add(key); count[x]++ } else { on.delete(key); count[x]-- }
    emit('flip', L('change the bit'), P(value ? 'self.count[x] += 1' : 'self.count[x] -= 1'), `Bit is now ${value ? 1 : 0}. count[${x}] becomes ${count[x]}.`, { cell, layer: x })
    heap.push([count[x], x])
    ops[k].returned = null
    returned.push(null)
    emit('push', L('push (count[x], x)'), P('heapq.heappush'), `Push ${count[x]}@${x}. Any older entry for layer ${x} stays in the heap until it reaches the top.`, { cell, layer: x })
  })
  current = -1
  const answers = returned.filter(value => value !== null)
  emit('done', L('class keeping'), P('return [getattr'), answers.length ? `The largestMatrix calls returned ${answers.join(', ')}.` : 'No largestMatrix call was made.')
  return { input: { n, calls }, result: returned, frames }
}
