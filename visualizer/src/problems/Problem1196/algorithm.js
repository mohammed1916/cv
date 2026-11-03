// Independently authored greedy walkthrough. The weights are our own sample data.
const CAPACITY = 5000
const MAX_APPLES = 30

export const code = [
  { line: 1, text: 'sort the apple weights in ascending order' },
  { line: 2, text: 'total = 0, count = 0 (capacity is 5000)' },
  { line: 3, text: 'for each weight w in that order:' },
  { line: 4, text: '  if total + w is more than the capacity: stop' },
  { line: 5, text: '  total = total + w; count = count + 1' },
  { line: 6, text: 'return count' },
]

export const python = `def max_apples(weight):
    total = 0
    count = 0
    for w in sorted(weight):
        if total + w > 5000:
            break
        total += w
        count += 1
    return count`

export const pythonLineMap = { 1: 4, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9 }

export const phases = [
  { id: 'start', label: 'Sort', description: 'Order the apples from lightest to heaviest. The total and count start at zero.' },
  { id: 'inspect', label: 'Check fit', description: 'Test whether the next apple still fits the remaining capacity.' },
  { id: 'update', label: 'Take apple', description: 'Add the apple to the basket and count it.' },
  { id: 'done', label: 'Result', description: 'Return how many apples were taken.' },
]

export const inputLabel = 'Object with a weight array (JSON)'
export const complexity = 'O(n log n) for sorting the apples; the greedy pass is O(n). The visualization accepts up to 30 apples.'
export const examples = [
  { label: 'Light apples leave room before a heavy tail', input: '{"weight":[650,140,920,310,480,760,220,830,170,590,1100]}' },
  { label: 'One apple exactly fills capacity', input: '{"weight":[5000]}' },
  { label: 'Every apple is too heavy', input: '{"weight":[5001,7000]}' },
  { label: 'All apples fit', input: '{"weight":[400,700,900,600]}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.weight)) throw new Error('Use an object with a weight array, such as {"weight":[400,700]}.')
  const { weight } = input
  if (weight.length < 1 || weight.length > MAX_APPLES) throw new Error(`weight needs 1 to ${MAX_APPLES} apples.`)
  if (!weight.every(w => Number.isInteger(w) && w >= 1 && w <= 10000)) throw new Error('Each weight must be an integer from 1 to 10000.')
  return { weight: [...weight] }
}

export function buildTrace({ weight }) {
  const sorted = [...weight].sort((a, b) => a - b)
  const frames = []
  const taken = []
  let total = 0
  let count = 0
  const snap = (extra = {}) => ({ sorted: [...sorted], taken: [...taken], total, count, ...extra })
  frames.push({ phase: 'start', activeLine: 1, message: `Sort ${sorted.length} weights: ${sorted.join(', ')}. Start with total 0 and count 0.`, snapshot: snap() })
  let stop = -1
  for (let index = 0; index < sorted.length; index++) {
    const w = sorted[index]
    const fits = total + w <= CAPACITY
    frames.push({ phase: 'inspect', activeLine: 4, message: `Next weight ${w}: ${total} + ${w} = ${total + w}, which ${fits ? 'fits' : `is more than ${CAPACITY}`}.`, snapshot: snap({ index, w, fits }) })
    if (!fits) { stop = index; break }
    total += w
    count += 1
    taken.push(w)
    frames.push({ phase: 'update', activeLine: 5, message: `Take ${w}. Total ${total}, count ${count}.`, snapshot: snap({ index, w, fits: true }) })
  }
  const result = count
  frames.push({ phase: 'done', activeLine: 6, message: `Return ${count}. The basket holds ${total} of ${CAPACITY} weight units${stop >= 0 ? '; every heavier apple is left out' : ''}.`, snapshot: snap({ index: stop }) })
  return { input: { weight }, result, frames }
}
