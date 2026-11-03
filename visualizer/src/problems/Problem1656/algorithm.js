export const phases = [
  { id: 'start', label: 'Empty slots', description: 'All n slots are empty, and the pointer waits at slot 1.' },
  { id: 'store', label: 'Store value', description: 'Put the value into the slot named by its id; ids can arrive in any order.' },
  { id: 'release', label: 'Release run', description: 'Advance the pointer while consecutive filled slots exist, and release that chunk.' },
  { id: 'done', label: 'All chunks', description: 'Return one chunk per insertion, in arrival order.' },
]

export const code = `ordered stream (n, inserts):
  slots = n empty positions, ids 1 to n
  pointer = 1
  outputs = empty list
  for each (key, value) in inserts:
    store value at slots[key]
    chunk = empty list
    while pointer <= n and slots[pointer] is filled:
      append slots[pointer] to chunk
      pointer = pointer + 1
    add chunk to outputs
  return outputs`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def ordered_stream(n, inserts):
    slots = [None] * (n + 1)
    pointer = 1
    output = []
    for key, value in inserts:
        slots[key] = value
        chunk = []
        while pointer <= n and slots[pointer] is not None:
            chunk.append(slots[pointer])
            pointer += 1
        output.append(chunk)
    return output
`

const pc = needle => code.findIndex(line => line.text.includes(needle)) + 1
const py = needle => python.split('\n').findIndex(line => line.includes(needle)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 5, "inserts": [[3, "cc"], [1, "a"]]}.')
  const { n, inserts } = input
  if (!Number.isInteger(n) || n < 1 || n > 50) throw new Error('n is an integer from 1 to 50.')
  if (!Array.isArray(inserts) || inserts.length > n) throw new Error('inserts is a list of at most n [id, value] pairs.')
  const seen = new Set()
  for (const pair of inserts) {
    if (!Array.isArray(pair) || pair.length !== 2) throw new Error('Each insert is [id, value].')
    const [id, value] = pair
    if (!Number.isInteger(id) || id < 1 || id > n) throw new Error(`Each id is an integer from 1 to ${n}.`)
    if (seen.has(id)) throw new Error(`Id ${id} appears more than once.`)
    if (typeof value !== 'string' || !/^[a-z]{1,5}$/.test(value)) throw new Error('Each value is 1 to 5 lowercase letters.')
    seen.add(id)
  }
  return { n, inserts }
}

export function buildTrace({ n, inserts }) {
  const slots = Array(n + 1).fill(null)
  let pointer = 1
  const output = []
  const frames = []
  const snap = (key, value, chunk) => ({ n, slots: slots.slice(1), pointer, key, value, chunk, output: output.map(c => [...c]) })
  const push = (phase, pcNeedle, pyNeedle, message, snapshot) =>
    frames.push({ phase, activeLine: pc(pcNeedle), pythonLine: py(pyNeedle), message, snapshot })

  push('start', 'slots = n empty', 'slots = [None]', `Slots 1 to ${n} are empty; the pointer waits at slot 1.`, snap(null, null, []))
  for (const [key, value] of inserts) {
    slots[key] = value
    push('store', 'store value at', 'slots[key] = value', `Value ${value} arrives for id ${key}.`, snap(key, value, []))
    const chunk = []
    while (pointer <= n && slots[pointer] !== null) {
      chunk.push(slots[pointer])
      pointer += 1
    }
    output.push(chunk)
    push('release', 'while pointer', 'while pointer', chunk.length === 0
      ? `Slot ${pointer} is still empty, so nothing is released.`
      : `Slots up to ${pointer - 1} are filled; release ${chunk.join(', ')}.`, snap(key, value, chunk))
  }
  push('done', 'return outputs', 'return output', 'Every insertion has produced its chunk.', snap(null, null, []))
  return { input: { n, inserts }, result: output, frames }
}
