// LeetCode 2181: Merge Nodes in Between Zeros.
// The list starts and ends with 0. Every run of non-zero values between two zeros becomes one node holding their sum.
// Walk the list once: add values into a running sum, and emit it when the next zero closes the run.

const MAX_LEN = 14
const MAX_VALUE = 9

export function parseInput(text) {
  let nodes
  try { nodes = JSON.parse(text) } catch { throw new Error('Use a JSON array of list values, e.g. [0,3,1,0,4,5,2,0].') }
  if (!Array.isArray(nodes) || nodes.length < 3 || nodes.length > MAX_LEN) throw new Error(`Use 3 to ${MAX_LEN} values. The visualization caps the list there.`)
  if (nodes[0] !== 0 || nodes[nodes.length - 1] !== 0) throw new Error('The list must start and end with 0.')
  if (!nodes.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 0 to ${MAX_VALUE}.`)
  for (let i = 1; i < nodes.length; i++) if (nodes[i] === 0 && nodes[i - 1] === 0) throw new Error('Each run between zeros must be non-empty.')
  return { nodes }
}

export const code = `FUNCTION mergeNodes(head)
    result ← empty list
    running ← 0
    FOR each node in the list after the head
        IF node value is 0 THEN
            append running to result
            running ← 0
        ELSE
            running ← running + node value
    RETURN result`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def merge_nodes(values):
    result = []
    running = 0
    for value in values[1:]:
        if value == 0:
            result.append(running)
            running = 0
        else:
            running += value
    return result
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Head', description: 'The head is a zero that starts the first run.' },
  { id: 'walk', label: 'Walk', description: 'Add values until the next zero closes the run.' },
  { id: 'done', label: 'Result', description: 'The merged list of run sums.' },
]

export function buildTrace({ nodes }) {
  const result = []
  let running = 0
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index, activeLine, pythonLine, message, nodes, result: result.slice(), running, ...extra,
  })
  push('start', 0, L('result ← empty'), P('result = []'), `The head is 0. The list has ${nodes.length} nodes including the head.`)
  for (let i = 1; i < nodes.length; i++) {
    const value = nodes[i]
    if (value === 0) {
      result.push(running)
      push('walk', i, L('append running'), P('result.append(running)'), `Zero at node ${i} closes a run with sum ${running}. Result gets ${running}.`, { closed: true })
      running = 0
    } else {
      running += value
      push('walk', i, L('running ← running + node'), P('running += value'), `Node ${i} holds ${value}. The run so far sums to ${running}.`, { closed: false })
    }
  }
  push('done', nodes.length - 1, L('RETURN result'), P('return result'), `Merged list: ${result.join(' -> ')}.`)
  return { input: { nodes }, result, frames }
}
