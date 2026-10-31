const OPS = ['enQueue', 'deQueue', 'Front', 'Rear', 'isEmpty', 'isFull']

export function parseInput(text) {
  const data = JSON.parse(text)
  const { k, ops } = data ?? {}
  if (!Number.isInteger(k) || k < 1 || k > 1000) throw new Error('k must be an integer from 1 to 1,000.')
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 3000) throw new Error('ops must be a list of 1–3,000 operations.')
  for (const [name, value] of ops) {
    if (!OPS.includes(name)) throw new Error(`Unknown operation ${name}.`)
    if (name === 'enQueue' && (!Number.isInteger(value) || Math.abs(value) > 1000)) throw new Error('enQueue needs an integer value with |value| ≤ 1000.')
  }
  return { k, ops }
}

// Ring buffer: head is the front slot; size counts the stored values.
export function buildTrace({ k, ops }) {
  const slots = Array(k).fill(null)
  let head = 0, size = 0
  const results = []
  const frames = [{ phase: 'start', op: -1, slots: [...slots], head, size, k, returned: undefined, activeLine: L('create a ring'), pythonLine: 2, message: `Create a ring buffer with ${k} slots.` }]
  ops.forEach(([name, value], op) => {
    let returned
    let phase = 'query'
    if (name === 'enQueue') {
      phase = 'write'
      if (size === k) returned = false
      else { slots[(head + size) % k] = value; size++; returned = true }
    } else if (name === 'deQueue') {
      phase = 'read'
      if (size === 0) returned = false
      else { slots[head] = null; head = (head + 1) % k; size--; returned = true }
    } else if (name === 'Front') returned = size ? slots[head] : -1
    else if (name === 'Rear') returned = size ? slots[(head + size - 1) % k] : -1
    else if (name === 'isEmpty') returned = size === 0
    else returned = size === k
    results.push(returned === undefined ? null : returned)
    frames.push({ phase, op, name, value, slots: [...slots], head, size, k, returned, activeLine: phase === 'write' ? L('write value into slot') : phase === 'read' ? L('move head forward') : L('answer Front'),
      pythonLine: pythonLineFor(name, returned),
      message: `${name}${name === 'enQueue' ? `(${value})` : '()'} → ${String(returned)}.` })
  })
  frames.push({ phase: 'done', op: ops.length - 1, slots: [...slots], head, size, k, returned: undefined, activeLine: L('return the recorded answers'), pythonLine: 31, message: `${ops.length} operations complete.` })
  return { input: { k, ops }, result: results, frames }
}

export const code = `create a ring of k empty slots, with head at slot 0 and size 0
for each operation in ops:
  if the operation is enQueue(value):
    if size equals k, record false and skip the write
    write value into slot (head + size) mod k
    increase size by 1 and record true
  else if the operation is deQueue:
    if size is 0, record false and skip the move
    clear slot head, move head forward by 1 modulo k, decrease size by 1, record true
  else answer Front, Rear, isEmpty, or isFull from head and size, then record the answer
return the recorded answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Python line (1-based index into `python` below) executed by an operation frame.
function pythonLineFor(name, returned) {
  if (name === 'enQueue') return returned === false ? 10 : 12  // answers.append(False) / slots[...] = value
  if (name === 'deQueue') return returned === false ? 17 : 20  // answers.append(False) / head = (head + 1) % k
  if (name === 'Front') return 24                              // answers.append(slots[head] ...)
  if (name === 'Rear') return 26                               // answers.append(slots[(head + size - 1) % k] ...)
  if (name === 'isEmpty') return 28                            // answers.append(size == 0)
  return 30                                                    // answers.append(size == k)
}

export const python = `def circular_queue(k, ops):
    slots = [None] * k
    head = 0
    size = 0
    answers = []
    for operation in ops:
        name = operation[0]
        if name == 'enQueue':
            if size == k:
                answers.append(False)
            else:
                slots[(head + size) % k] = operation[1]
                size += 1
                answers.append(True)
        elif name == 'deQueue':
            if size == 0:
                answers.append(False)
            else:
                slots[head] = None
                head = (head + 1) % k
                size -= 1
                answers.append(True)
        elif name == 'Front':
            answers.append(slots[head] if size else -1)
        elif name == 'Rear':
            answers.append(slots[(head + size - 1) % k] if size else -1)
        elif name == 'isEmpty':
            answers.append(size == 0)
        else:
            answers.append(size == k)
    return answers`
