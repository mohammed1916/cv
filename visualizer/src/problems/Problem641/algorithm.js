export function parseInput(text) {
  const data = JSON.parse(text)
  const { k, ops } = data ?? {}
  if (!Number.isInteger(k) || k < 1 || k > 1000) throw new Error('k must be an integer from 1 to 1,000.')
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 3000) throw new Error('ops must be a list of 1–3,000 operations.')
  const names = ['insertFront', 'insertLast', 'deleteFront', 'deleteLast', 'getFront', 'getRear', 'isEmpty', 'isFull']
  for (const [name, value] of ops) {
    if (!names.includes(name)) throw new Error(`Unknown operation ${name}.`)
    if (name.startsWith('insert') && (!Number.isInteger(value) || Math.abs(value) > 1000)) throw new Error('Insert operations need an integer value with |value| ≤ 1000.')
  }
  return { k, ops }
}

// Ring buffer where both ends move: front index moves backward on insertFront.
export function buildTrace({ k, ops }) {
  const slots = Array(k).fill(null)
  let head = 0, size = 0
  const results = []
  const frames = [{ phase: 'start', op: -1, slots: [...slots], head, size, k, activeLine: L('slots = k empty'), pythonLine: 2, message: `Create a ring of ${k} slots.` }]
  ops.forEach(([name, value], op) => {
    let returned
    let phase = 'query'
    if (name === 'insertFront') {
      phase = 'write'
      if (size === k) returned = false
      else { head = (head - 1 + k) % k; slots[head] = value; size++; returned = true }
    } else if (name === 'insertLast') {
      phase = 'write'
      if (size === k) returned = false
      else { slots[(head + size) % k] = value; size++; returned = true }
    } else if (name === 'deleteFront') {
      phase = 'read'
      if (size === 0) returned = false
      else { slots[head] = null; head = (head + 1) % k; size--; returned = true }
    } else if (name === 'deleteLast') {
      phase = 'read'
      if (size === 0) returned = false
      else { slots[(head + size - 1) % k] = null; size--; returned = true }
    } else if (name === 'getFront') returned = size ? slots[head] : -1
    else if (name === 'getRear') returned = size ? slots[(head + size - 1) % k] : -1
    else if (name === 'isEmpty') returned = size === 0
    else returned = size === k
    results.push(returned === undefined ? null : returned)
    frames.push({ phase, op, name, value, slots: [...slots], head, size, k, returned, activeLine: ACTIVE[name],
      pythonLine: pythonLineFor(name, returned),
      message: `${name}${name.startsWith('insert') ? `(${value})` : '()'} → ${String(returned)}.` })
  })
  frames.push({ phase: 'done', op: ops.length - 1, slots: [...slots], head, size, k, activeLine: L('return results'), pythonLine: 48, message: `${ops.length} operations complete.` })
  return { input: { k, ops }, result: results, frames }
}

export const code = `slots = k empty slots, head = 0, size = 0
results = empty list
for each operation (name, value) in ops:
  if name is insertFront:
    if size equals k: result = false
    else: move head back one (wrap around), write value there, size += 1, result = true
  else if name is insertLast:
    if size equals k: result = false
    else: write value after the last element, size += 1, result = true
  else if name is deleteFront:
    if size is 0: result = false
    else: clear slot at head, move head forward one (wrap around), size -= 1, result = true
  else if name is deleteLast:
    if size is 0: result = false
    else: clear the last element's slot, size -= 1, result = true
  else if name is getFront:
    result = front value, or -1 if empty
  else if name is getRear:
    result = rear value, or -1 if empty
  else if name is isEmpty:
    result = size is 0
  else:
    result = size equals k
  append result to results
return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
// Python line (1-based index into `python` below) executed by an operation frame.
function pythonLineFor(name, returned) {
  const failed = returned === false
  if (name === 'insertFront') return failed ? 11 : 14   // result = False / slots[head] = value
  if (name === 'insertLast') return failed ? 19 : 21    // result = False / slots[(head + size) % k] = value
  if (name === 'deleteFront') return failed ? 26 : 28   // result = False / slots[head] = None
  if (name === 'deleteLast') return failed ? 34 : 36    // result = False / slots[(head + size - 1) % k] = None
  if (name === 'getFront') return 40
  if (name === 'getRear') return 42
  if (name === 'isEmpty') return 44
  return 46                                             // result = size == k
}
const ACTIVE = {
  insertFront: L('move head back one'), insertLast: L('write value after the last element'),
  deleteFront: L('clear slot at head'), deleteLast: L("clear the last element's slot"),
  getFront: L('result = front value'), getRear: L('result = rear value'),
  isEmpty: L('result = size is 0'), isFull: L('result = size equals k'),
}

export const python = `def design_circular_deque(k, ops):
    slots = [None] * k
    head = 0
    size = 0
    results = []
    for entry in ops:
        name = entry[0]
        value = entry[1] if len(entry) > 1 else None
        if name == 'insertFront':
            if size == k:
                result = False
            else:
                head = (head - 1) % k
                slots[head] = value
                size += 1
                result = True
        elif name == 'insertLast':
            if size == k:
                result = False
            else:
                slots[(head + size) % k] = value
                size += 1
                result = True
        elif name == 'deleteFront':
            if size == 0:
                result = False
            else:
                slots[head] = None
                head = (head + 1) % k
                size -= 1
                result = True
        elif name == 'deleteLast':
            if size == 0:
                result = False
            else:
                slots[(head + size - 1) % k] = None
                size -= 1
                result = True
        elif name == 'getFront':
            result = slots[head] if size else -1
        elif name == 'getRear':
            result = slots[(head + size - 1) % k] if size else -1
        elif name == 'isEmpty':
            result = size == 0
        else:
            result = size == k
        results.append(result)
    return results`
