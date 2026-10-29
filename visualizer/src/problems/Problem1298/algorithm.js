const FIELDS = ['status', 'candies', 'keys', 'containedBoxes', 'initialBoxes']

export function parseInput(text) {
  let obj
  try { obj = typeof text === 'string' ? JSON.parse(text) : text } catch { throw new Error('Use a JSON object with status, candies, keys, containedBoxes and initialBoxes.') }
  if (!obj || typeof obj !== 'object' || FIELDS.some(field => !(field in obj))) throw new Error('Use an object with status, candies, keys, containedBoxes and initialBoxes.')
  const { status, candies, keys, containedBoxes, initialBoxes } = obj
  if (!Array.isArray(status) || status.length < 1 || status.length > 24) throw new Error('This visualization accepts 1 to 24 boxes.')
  const n = status.length
  const isBox = value => Number.isInteger(value) && value >= 0 && value < n
  if (status.some(value => value !== 0 && value !== 1)) throw new Error('status entries must be 0 (locked) or 1 (open).')
  if (!Array.isArray(candies) || candies.length !== n || candies.some(value => !Number.isInteger(value) || value < 1 || value > 1000)) {
    throw new Error('candies must have one integer from 1 to 1000 per box.')
  }
  for (const [name, lists] of [['keys', keys], ['containedBoxes', containedBoxes]]) {
    if (!Array.isArray(lists) || lists.length !== n) throw new Error(`${name} must have one list per box.`)
    lists.forEach(list => {
      if (!Array.isArray(list) || list.length > n || list.some(value => !isBox(value)) || new Set(list).size !== list.length) {
        throw new Error(`Each ${name} entry must be a list of distinct box indices from 0 to ${n - 1}.`)
      }
    })
  }
  if (!Array.isArray(initialBoxes) || initialBoxes.some(value => !isBox(value))) throw new Error(`initialBoxes must list box indices from 0 to ${n - 1}.`)
  return { status, candies, keys, containedBoxes, initialBoxes }
}

export const code = [
  { line: 1, text: 'hasKey and opened are all false; waiting is empty; queue = initialBoxes; total = 0' },
  { line: 2, text: 'while queue is not empty:' },
  { line: 3, text: '  box = take the last box from queue' },
  { line: 4, text: '  if opened[box]: continue' },
  { line: 5, text: '  if box is locked and no key is held: add box to waiting; continue' },
  { line: 6, text: '  open box: opened[box] = true; total += candies[box]' },
  { line: 7, text: '  for each key in keys[box]: hasKey[key] = true; if key is waiting, move it to queue' },
  { line: 8, text: '  for each contained in containedBoxes[box]: add contained to queue' },
  { line: 9, text: 'return total' },
]

export const python = `def maxCandies(status, candies, keys, containedBoxes, initialBoxes):
    n = len(status)
    has_key = [False] * n
    opened = [False] * n
    waiting = set()
    queue = list(initialBoxes)
    total = 0
    while queue:
        box = queue.pop()
        if opened[box]:
            continue
        if status[box] == 0 and not has_key[box]:
            waiting.add(box)
            continue
        opened[box] = True
        total += candies[box]
        for key in keys[box]:
            has_key[key] = True
            if key in waiting:
                waiting.remove(key)
                queue.append(key)
        for contained in containedBoxes[box]:
            queue.append(contained)
    return total`

export const pythonLineMap = { 1: 6, 2: 8, 3: 9, 4: 10, 5: 12, 6: 15, 7: 17, 8: 22, 9: 24 }

export function buildTrace(input) {
  const { status, candies, keys, containedBoxes, initialBoxes } = parseInput(input)
  const n = status.length
  const hasKey = Array(n).fill(false)
  const opened = Array(n).fill(false)
  const waiting = []
  const queue = [...initialBoxes]
  let total = 0
  let current = null
  const frames = []
  const snap = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message, status, candies, current,
    hasKey: [...hasKey], opened: [...opened], waiting: [...waiting], queue: [...queue], total, ...extra,
  })

  snap('start', 1, `Queue the ${initialBoxes.length} initial boxes. Nothing is open yet.`)
  while (queue.length) {
    snap('loop', 2, `Queue has ${queue.length} box(es); take the last one.`)
    const box = queue.pop()
    current = box
    if (opened[box]) {
      snap('skip', 4, `Box ${box} is already open, so skip it.`)
      continue
    }
    if (status[box] === 0 && !hasKey[box]) {
      if (!waiting.includes(box)) waiting.push(box)
      snap('wait', 5, `Box ${box} is locked and no key is held, so it waits.`)
      continue
    }
    opened[box] = true
    total += candies[box]
    snap('open', 6, `Open box ${box} and collect ${candies[box]} candies.`)
    for (const key of keys[box]) {
      hasKey[key] = true
      const at = waiting.indexOf(key)
      if (at !== -1) {
        waiting.splice(at, 1)
        queue.push(key)
      }
    }
    snap('key', 7, keys[box].length ? `Box ${box} holds keys ${keys[box].join(', ')}.` : `Box ${box} holds no keys.`)
    for (const contained of containedBoxes[box]) queue.push(contained)
    snap('contain', 8, containedBoxes[box].length ? `Box ${box} contains boxes ${containedBoxes[box].join(', ')}.` : `Box ${box} contains no boxes.`)
  }
  current = null
  snap('done', 9, `No reachable box is left. Return ${total} candies.`, { result: total })
  return { input: { status, candies, keys, containedBoxes, initialBoxes }, result: total, frames }
}
