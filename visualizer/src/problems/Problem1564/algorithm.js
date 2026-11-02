const CODE_LINES = [
  'limit is infinity and effective is an empty list',
  'for each room i from left to right',
  'limit = min(limit, height of room i), then append limit to effective',
  'sort effective ascending and sort boxes ascending',
  'b is 0 and placed is 0',
  'for each room value r in effective',
  'if boxes[b] fits under r then place it: placed plus 1, b plus 1',
  'return placed',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `def max_boxes(boxes, warehouse):
    limit = float("inf")
    effective = []
    for h in warehouse:
        limit = min(limit, h)
        effective.append(limit)
    effective.sort()
    boxes = sorted(boxes)
    b = 0
    placed = 0
    for r in effective:
        if b < len(boxes) and boxes[b] <= r:
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
  { id: 'start', label: 'Ceiling', description: 'A box can only pass rooms at least as tall as itself.' },
  { id: 'scan', label: 'Effective height', description: 'Each room is limited by the lowest ceiling before it.' },
  { id: 'sort', label: 'Sort', description: 'Sort boxes and effective rooms, smallest first.' },
  { id: 'try', label: 'Try room', description: 'Test the smallest unplaced box against this room.' },
  { id: 'place', label: 'Place', description: 'The box fits and takes this room.' },
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
  const frames = []
  const effective = []
  let limit = Infinity
  const frame = (phase, activeLine, pythonLine, index, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, index, message, warehouse, effective: [...effective], boxes, ...extra,
  })
  frame('start', L('limit is infinity'), P('limit = float'), -1, 'Boxes go in from the left, so each room is limited by every ceiling before it.')
  warehouse.forEach((h, i) => {
    limit = Math.min(limit, h)
    effective.push(limit)
    frame('scan', L('for each room i from left'), P('for h in warehouse'), i, `Room ${i} has ceiling ${h}; effective height ${limit}.`)
  })
  const rooms = [...effective].sort((a, b) => a - b)
  const sortedBoxes = [...boxes].sort((a, b) => a - b)
  frame('sort', L('sort effective ascending'), P('effective.sort()'), -1, `Rooms ascending: [${rooms.join(', ')}]. Boxes ascending: [${sortedBoxes.join(', ')}].`, { rooms, sortedBoxes, b: 0 })
  let b = 0
  let placed = 0
  rooms.forEach((r, index) => {
    if (b < sortedBoxes.length && sortedBoxes[b] <= r) {
      placed++
      b++
      frame('place', L('if boxes[b] fits under r'), P('if b < len(boxes)'), index, `Box ${sortedBoxes[b - 1]} fits under ${r} and takes this room.`, { rooms, sortedBoxes, b, placed })
    } else {
      frame(b < sortedBoxes.length ? 'skip' : 'try', L('for each room value r'), P('for r in effective'), index,
        b < sortedBoxes.length ? `Box ${sortedBoxes[b]} is taller than ${r}; this room stays empty.` : 'No boxes are left to place.', { rooms, sortedBoxes, b, placed })
    }
  })
  frame('done', L('return placed'), P('return placed'), -1, `${placed} box${placed === 1 ? '' : 'es'} placed.`, { rooms, sortedBoxes, b, placed })
  return { input: { boxes, warehouse }, result: placed, frames }
}
