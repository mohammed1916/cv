const CODE_LINES = [
  'left[i] is the lowest ceiling from the left end up to room i, and right[i] from the right end',
  'for each room i, capacity[i] = max(left[i], right[i])',
  'sort capacity ascending and sort boxes ascending',
  'b is 0 and placed is 0',
  'for each capacity c in ascending order',
  'if boxes[b] fits under c then place it: placed plus 1, b plus 1',
  'return placed',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `def max_boxes_two_sided(boxes, warehouse):
    n = len(warehouse)
    left = [0] * n
    right = [0] * n
    limit = float("inf")
    for i in range(n):
        limit = min(limit, warehouse[i])
        left[i] = limit
    limit = float("inf")
    for i in range(n - 1, -1, -1):
        limit = min(limit, warehouse[i])
        right[i] = limit
    capacity = sorted(max(left[i], right[i]) for i in range(n))
    boxes = sorted(boxes)
    b = 0
    placed = 0
    for c in capacity:
        if b < len(boxes) and boxes[b] <= c:
            placed += 1
            b += 1
    return placed
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Two ends', description: 'Boxes may enter from either end of the warehouse.' },
  { id: 'scan', label: 'Ends', description: 'Each room has a limit from the left and from the right.' },
  { id: 'capacity', label: 'Capacity', description: 'A room takes any box that fits from its better side.' },
  { id: 'sort', label: 'Sort', description: 'Sort capacities and boxes, smallest first.' },
  { id: 'place', label: 'Place', description: 'The box fits this room from one end.' },
  { id: 'skip', label: 'Skip room', description: 'The smallest unplaced box is too tall for this room.' },
  { id: 'done', label: 'Result', description: 'Report the number of boxes placed.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with boxes and warehouse arrays.')
  const { boxes, warehouse } = input
  const ok = x => Number.isInteger(x) && x >= 1 && x <= 9
  if (!Array.isArray(boxes) || boxes.length < 1 || boxes.length > 10 || !boxes.every(ok)) throw new Error('boxes has 1 to 10 heights from 1 to 9 (visualization cap).')
  if (!Array.isArray(warehouse) || warehouse.length < 1 || warehouse.length > 10 || !warehouse.every(ok)) throw new Error('warehouse has 1 to 10 ceilings from 1 to 9 (visualization cap).')
  return { boxes, warehouse }
}

export function buildTrace({ boxes, warehouse }) {
  const n = warehouse.length
  const left = Array(n).fill(0)
  const right = Array(n).fill(0)
  const frames = []
  const frame = (phase, activeLine, pythonLine, index, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, index, message, warehouse, left: [...left], right: [...right], boxes, ...extra,
  })
  frame('start', L('left[i] is the lowest ceiling'), P('limit = float'), -1, 'A box may enter from the left or the right end.')
  let limit = Infinity
  for (let i = 0; i < n; i++) {
    limit = Math.min(limit, warehouse[i])
    left[i] = limit
    frame('scan', L('left[i] is the lowest ceiling'), P('left[i] = limit'), i, `From the left, room ${i} is limited to ${limit}.`)
  }
  limit = Infinity
  for (let i = n - 1; i >= 0; i--) {
    limit = Math.min(limit, warehouse[i])
    right[i] = limit
    frame('scan', L('left[i] is the lowest ceiling'), P('right[i] = limit'), i, `From the right, room ${i} is limited to ${limit}.`)
  }
  const capacity = Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    capacity[i] = Math.max(left[i], right[i])
    frame('capacity', L('capacity[i] = max'), P('capacity = sorted('), i, `Room ${i} takes boxes up to ${capacity[i]}, from its better end.`, { capacity: [...capacity] })
  }
  const rooms = [...capacity].sort((a, b) => a - b)
  const sortedBoxes = [...boxes].sort((a, b) => a - b)
  frame('sort', L('sort capacity ascending'), P('boxes = sorted(boxes)'), -1, `Capacities [${rooms.join(', ')}]; boxes [${sortedBoxes.join(', ')}].`, { rooms, sortedBoxes, b: 0 })
  let b = 0
  let placed = 0
  rooms.forEach((c, index) => {
    if (b < sortedBoxes.length && sortedBoxes[b] <= c) {
      placed++
      b++
      frame('place', L('if boxes[b] fits under c'), P('if b < len(boxes)'), index, `Box ${sortedBoxes[b - 1]} fits under ${c} and takes a room.`, { rooms, sortedBoxes, b, placed })
    } else {
      frame('skip', L('for each capacity c'), P('for c in capacity'), index,
        b < sortedBoxes.length ? `Box ${sortedBoxes[b]} is taller than ${c}; this room stays empty.` : 'No boxes are left to place.', { rooms, sortedBoxes, b, placed })
    }
  })
  frame('done', L('return placed'), P('return placed'), -1, `${placed} box${placed === 1 ? '' : 'es'} placed.`, { rooms, sortedBoxes, b, placed })
  return { input: { boxes, warehouse }, result: placed, frames }
}
