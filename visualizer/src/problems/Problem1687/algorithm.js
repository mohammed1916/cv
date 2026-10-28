const KEYS = ['boxes', 'max_boxes', 'max_weight', 'ports_count']

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join() !== KEYS.join()) {
    throw new Error('Use an object with exactly the keys boxes, ports_count, max_boxes, and max_weight.')
  }
  const { boxes, ports_count: ports, max_boxes: maxBoxes, max_weight: maxWeight } = data
  if (!Number.isInteger(ports) || ports < 1 || ports > 5) throw new Error('ports_count is an integer from 1 to 5.')
  if (!Number.isInteger(maxBoxes) || maxBoxes < 1 || maxBoxes > 5) throw new Error('max_boxes is an integer from 1 to 5.')
  if (!Number.isInteger(maxWeight) || maxWeight < 1 || maxWeight > 10) throw new Error('max_weight is an integer from 1 to 10.')
  if (!Array.isArray(boxes) || boxes.length < 1 || boxes.length > 8) throw new Error('Use 1 to 8 boxes.')
  for (const box of boxes) {
    if (!Array.isArray(box) || box.length !== 2 || !Number.isInteger(box[0]) || !Number.isInteger(box[1])) {
      throw new Error('Each box is [port, weight] with integer values.')
    }
    if (box[0] < 1 || box[0] > ports) throw new Error('Each port is from 1 to ports_count.')
    if (box[1] < 1 || box[1] > maxWeight) throw new Error('Each box weight is from 1 to max_weight.')
  }
  return data
}

export function buildTrace(data) {
  const boxes = data.boxes
  const n = boxes.length
  const trips = [0, ...Array(n).fill(Infinity)]
  const frames = [{ phase: 'start', activeLine: L('set trips[0]'), i: 0, j: null, trips: [...trips], message: 'Zero boxes need zero trips. Every other prefix is not reached yet.' }]
  for (let i = 1; i <= n; i++) {
    frames.push({ phase: 'end', activeLine: L('for each end position'), i, j: null, trips: [...trips], message: `Find the cheapest trip whose last box is box ${i}.` })
    let changes = 0
    let count = 0
    let weight = 0
    for (let j = i - 1; j >= 0; j--) {
      count++
      weight += boxes[j][1]
      if (count > data.max_boxes || weight > data.max_weight) {
        frames.push({ phase: 'limit', activeLine: L('stop as soon'), i, j, trips: [...trips], message: `Adding box ${j + 1} breaks a limit (${count} boxes, weight ${weight}). Stop extending this trip.` })
        break
      }
      if (j < i - 1 && boxes[j][0] !== boxes[j + 1][0]) changes++
      const cost = trips[j] + 2 + changes
      if (cost < trips[i]) trips[i] = cost
      frames.push({ phase: 'trip', activeLine: L('the trip costs'), i, j, trips: [...trips], message: `Trip carrying boxes ${j + 1} to ${i}: ${trips[j]} + 2 + ${changes} port changes = ${cost}. Keep the cheapest, now ${trips[i]}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return trips'), i: n, j: null, trips: [...trips], message: `The fewest trips for all ${n} boxes is ${trips[n]}.` })
  return { input: data, result: trips[n], frames, trips }
}

export const code = `minimum trips to deliver every box in order:
  set trips[0] to 0 and every other entry to infinity
  for each end position i from 1 to the number of boxes:
    walk the start j backwards from box i-1
    stop as soon as the boxes j to i-1 break a box or weight limit
    add one port change when boxes j and j+1 go to different ports
    the trip costs trips[j] + 2 + changes
    keep the cheapest cost in trips[i]
  return trips[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_trips(boxes, ports_count, max_boxes, max_weight):
    n = len(boxes)
    trips = [0] + [float('inf')] * n
    for i in range(1, n + 1):
        changes = 0
        count = 0
        weight = 0
        for j in range(i - 1, -1, -1):
            count += 1
            weight += boxes[j][1]
            if count > max_boxes or weight > max_weight:
                break
            if j < i - 1 and boxes[j][0] != boxes[j + 1][0]:
                changes += 1
            trips[i] = min(trips[i], trips[j] + 2 + changes)
    return trips[n]
`
