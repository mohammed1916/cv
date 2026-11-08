export const phases = [
  { id: 'start', label: 'Start', description: 'Boxes enter from the left only. A room can hold a box only if every room before it is at least as tall.' },
  { id: 'capacity', label: 'Room capacities', description: 'Each room keeps the lowest height from the entrance up to it: that is the tallest box it can ever receive.' },
  { id: 'skip', label: 'Room too short', description: 'The room capacity is smaller than the current box, so move to the next room.' },
  { id: 'place', label: 'Place box', description: 'The room is tall enough for this box, so the box goes in and the room is used.' },
  { id: 'done', label: 'Complete', description: 'Return how many boxes fit.' },
]

export const examples = [
  { label: 'Tall start', input: '{"boxes":[2,5,3],"warehouse":[4,6,2,5]}' },
  { label: 'Low entrance', input: '{"boxes":[3,3,3],"warehouse":[1,3,4]}' },
  { label: 'Single box, single room', input: '{"boxes":[1],"warehouse":[1]}' },
  { label: 'Equal boxes and rooms', input: '{"boxes":[3,3],"warehouse":[3,3]}' },
  { label: 'Largest: 12 boxes, 12 rooms', input: '{"boxes":[1,1,1,1,1,1,1,1,1,1,1,1],"warehouse":[20,20,20,20,20,20,20,20,20,20,20,20]}' },
  { label: 'Long run: 12 boxes', input: '{"boxes":[14,5,13,10,15,14,16,17,12,11,7,10],"warehouse":[5,13,5,11,14,1,10,7,8,11,5,17]}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.boxes) || !Array.isArray(data.warehouse)) throw new Error('Use an object with boxes and warehouse lists.')
  if (data.boxes.length < 1 || data.boxes.length > 12) throw new Error('Use 1 to 12 boxes in this visualization.')
  if (data.warehouse.length < 1 || data.warehouse.length > 12) throw new Error('Use 1 to 12 rooms in this visualization.')
  if (!data.warehouse.every(h => Number.isInteger(h) && h >= 1 && h <= 20)) throw new Error('Room heights must be integers from 1 to 20.')
  const tallest = Math.max(...data.warehouse)
  if (!data.boxes.every(b => Number.isInteger(b) && b >= 1 && b <= tallest)) throw new Error('Each box must be an integer from 1 to the tallest room height.')
  return { boxes: data.boxes, warehouse: data.warehouse }
}

export function buildTrace({ boxes, warehouse }) {
  const caps = []
  let low = Infinity
  for (const h of warehouse) { low = Math.min(low, h); caps.push(low) }
  const snap = (extra = {}) => ({ caps: [...caps], boxes: [...boxes], ...extra })
  const frames = [{ phase: 'start', activeLine: L('let low = Infinity'), pythonLine: P('low = float'), snapshot: snap(),
    message: 'Boxes enter from the left, so each room is limited by the shortest room before it.' }]
  frames.push({ phase: 'capacity', activeLine: L('caps.push(low)'), pythonLine: P('caps.append'), snapshot: snap({ caps: [...caps] }),
    message: `Room capacities from the entrance: ${caps.join(', ')}.` })
  const order = [...caps].sort((a, b) => a - b)
  const sorted = [...boxes].sort((a, b) => a - b)
  let j = 0, count = 0
  for (const box of sorted) {
    while (j < order.length && order[j] < box) {
      frames.push({ phase: 'skip', activeLine: L('while (j < caps.length'), pythonLine: P('while j < len'), snapshot: snap({ box, room: j, cap: order[j] }),
        message: `Room capacity ${order[j]} is below box ${box}; try a taller room.` })
      j++
    }
    if (j === order.length) break
    count++
    frames.push({ phase: 'place', activeLine: L('count++'), pythonLine: P('count += 1'), snapshot: snap({ box, room: j, cap: order[j], count }),
      message: `Box ${box} fits a room of capacity ${order[j]}; ${count} placed.` })
    j++
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), snapshot: snap({ count, result: count }),
    message: `Return ${count}.`, result: count })
  for (const f of frames) f.scene = { ...f.snapshot }
  return { input: { boxes, warehouse }, result: count, frames }
}

export const code = `function maxBoxesInWarehouse(boxes, warehouse) {
  const caps = []
  let low = Infinity
  for (const h of warehouse) { low = Math.min(low, h); caps.push(low) }
  caps.sort((a, b) => a - b)
  const sorted = [...boxes].sort((a, b) => a - b)
  let j = 0, count = 0
  for (const box of sorted) {
    while (j < caps.length && caps[j] < box) j++
    if (j === caps.length) break
    count++
    j++
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_boxes_in_warehouse(boxes, warehouse):
    caps = []
    low = float('inf')
    for h in warehouse:
        low = min(low, h)
        caps.append(low)
    caps.sort()
    sorted_boxes = sorted(boxes)
    j = 0
    count = 0
    for box in sorted_boxes:
        while j < len(caps) and caps[j] < box:
            j += 1
        if j == len(caps):
            break
        count += 1
        j += 1
    return count
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
