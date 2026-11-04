const MAX_LENGTH = 16

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s1 and s2.')
  const { s1, s2 } = input
  if (typeof s1 !== 'string' || typeof s2 !== 'string') throw new Error('s1 and s2 must be strings.')
  if (s1.length !== s2.length) throw new Error('s1 and s2 must have the same length.')
  if (s1.length < 1 || s1.length > MAX_LENGTH) throw new Error(`The visualization handles lengths from 1 to ${MAX_LENGTH}.`)
  if (!/^[01]+$/.test(s1) || !/^[01]+$/.test(s2)) throw new Error('Both strings may contain only 0 and 1.')
  return { s1, s2 }
}

export const python = `def min_operations(s1, s2):
    INF = float("inf")
    n = len(s1)
    best = [0, INF]
    for i in range(n):
        start, goal = s1[i], s2[i]
        next_best = [INF, INF]
        for left in (0, 1):
            if best[left] == INF:
                continue
            for right in (0, 1):
                if right == 1 and i == n - 1:
                    continue
                touches = left + right
                if touches == 0:
                    if start == "1" and goal == "0":
                        continue
                    sets = 1 if start != goal else 0
                else:
                    sets = touches - 1 + (start == "0") + (goal == "1")
                next_best[right] = min(next_best[right], best[left] + sets + right)
        best = next_best
    return -1 if best[0] == INF else best[0]
`

export const code = `fewest operations from s1 to s2, deciding the clearing pairs left to right
  start with no pair crossing into index 0, at cost 0
  for each index i
    for each state: does a pair from the left touch i?
      for each choice: start a pair from i to i + 1?
        the last index has no right neighbour, so that choice is out
        if nothing touches i but it must go from 1 to 0, this choice is out
        count the sets i needs, plus 1 if a new pair starts here
        keep the cheaper total for the chosen state
  answer is the state with no pair past the end, or -1 if unreachable
  replay the chosen pairs to show the operations
  return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = text => {
  const hit = code.find(line => line.text.includes(text))
  if (!hit) throw new Error(`Missing pseudocode line: ${text}`)
  return hit.line
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Before index 0 no pair exists and nothing has been spent.' },
  { id: 'index', label: 'Index', description: 'Move to the next pair of characters.' },
  { id: 'edge', label: 'Choice', description: 'Price one way to treat this index.' },
  { id: 'blocked', label: 'Ruled out', description: 'This way of treating the index is impossible.' },
  { id: 'answer', label: 'Answer', description: 'Read the best total at the last boundary.' },
  { id: 'replay', label: 'Replay', description: 'Carry out one operation from the best plan.' },
  { id: 'done', label: 'Result', description: 'The minimum number of operations.' },
]

// Sets at one index, given how many clearing pairs touch it. Infinity marks an impossible treatment.
export function setsNeeded(start, goal, touches) {
  if (touches === 0) {
    if (start === '1' && goal === '0') return Infinity
    return start === goal ? 0 : 1
  }
  return touches - 1 + (start === '0' ? 1 : 0) + (goal === '1' ? 1 : 0)
}

export function buildTrace({ s1, s2 }) {
  const n = s1.length
  const table = Array.from({ length: n + 1 }, () => [null, null])
  const from = Array.from({ length: n + 1 }, () => [null, null])
  table[0] = [0, Infinity]
  const edges = []
  const frames = []
  const emit = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message,
    i: -1, left: null, right: null, price: null, pathEdges: [],
    table: table.map(row => [...row]), edges: edges.map(edge => ({ ...edge })),
    current: s1, op: null, ops: 0,
    ...extra,
  })
  emit('start', L('start with no pair'), P('best = [0, INF]'), 'Nothing has been decided. Boundary 0 costs 0, and no pair can reach it from the left.')
  for (let i = 0; i < n; i++) {
    const start = s1[i]
    const goal = s2[i]
    table[i + 1] = [Infinity, Infinity]
    emit('index', L('for each index'), P('for i in range(n)'), `Index ${i}: ${start} must become ${goal}.`, { i })
    for (const left of [0, 1]) {
      if (table[i][left] === Infinity) continue
      for (const right of [0, 1]) {
        const base = { i, left, right }
        if (right === 1 && i === n - 1) {
          edges.push({ i, left, right, status: 'blocked', cost: null })
          emit('blocked', L('the last index'), P('if right == 1 and'), `Index ${i} is the last one, so no pair can start here.`, base)
          continue
        }
        const touches = left + right
        const sets = setsNeeded(start, goal, touches)
        if (sets === Infinity) {
          edges.push({ i, left, right, status: 'blocked', cost: null })
          emit('blocked', L('if nothing touches'), P('if start == "1" and goal'), `Index ${i} must fall from 1 to 0, and only a pair can do that, yet this choice uses none.`, base)
          continue
        }
        const cost = sets + right
        const total = table[i][left] + cost
        const improved = total < table[i + 1][right]
        if (improved) {
          table[i + 1][right] = total
          from[i + 1][right] = left
        }
        edges.push({ i, left, right, status: improved ? 'kept' : 'worse', cost })
        if (improved) {
          for (const edge of edges) if (edge.i === i && edge.right === right && edge.status === 'kept' && edge.left !== left) edge.status = 'worse'
        }
        emit('edge', L('keep the cheaper'), P('next_best[right] = min'), `${touches} pair${touches === 1 ? '' : 's'} touch index ${i}: ${sets} set${sets === 1 ? '' : 's'}${right ? ' + 1 new pair' : ''} = ${cost}. Total ${table[i][left]} + ${cost} = ${total}${improved ? ', the best here so far.' : `, no better than ${table[i + 1][right]}.`}`,
          { ...base, price: { touches, sets, pair: right, cost, before: table[i][left], total, improved } })
      }
    }
  }
  const result = table[n][0] === Infinity ? -1 : table[n][0]
  const pathEdges = []
  const pairs = []
  if (result !== -1) {
    let state = 0
    for (let boundary = n; boundary > 0; boundary--) {
      const left = from[boundary][state]
      pathEdges.push({ i: boundary - 1, left, right: state })
      if (state === 1) pairs.push(boundary - 1)
      state = left
    }
    pathEdges.reverse()
    pairs.reverse()
  }
  emit('answer', L('answer is the state'), P('return -1 if'), result === -1 ? 'The last boundary with no pair past the end was never reached, so the answer is -1.' : `The last boundary holds ${result}. Following its choices backwards gives ${pairs.length ? `pair${pairs.length === 1 ? '' : 's'} starting at index ${pairs.join(', ')}` : 'no clearing pairs'}.`, { pathEdges })
  const current = s1.split('')
  const plan = []
  for (const at of result === -1 ? [] : pairs) {
    if (current[at] === '0') { current[at] = '1'; plan.push({ kind: 'set', at, text: current.join('') }) }
    if (current[at + 1] === '0') { current[at + 1] = '1'; plan.push({ kind: 'set', at: at + 1, text: current.join('') }) }
    current[at] = '0'
    current[at + 1] = '0'
    plan.push({ kind: 'clear', at, text: current.join('') })
  }
  for (let j = 0; result !== -1 && j < n; j++) {
    if (current[j] !== s2[j]) { current[j] = '1'; plan.push({ kind: 'set', at: j, text: current.join('') }) }
  }
  plan.forEach((op, index) => emit('replay', L('replay the chosen'), P('return -1 if'),
    op.kind === 'set' ? `Operation ${index + 1}: set index ${op.at} to 1.` : `Operation ${index + 1}: clear the 1s at indices ${op.at} and ${op.at + 1}.`,
    { pathEdges, current: op.text, op, ops: index + 1 }))
  emit('done', L('return the answer'), P('return -1 if'), result === -1 ? 'Return -1.' : `Return ${result}.`, { pathEdges, current: result === -1 ? s1 : s2, ops: plan.length })
  return { input: { s1, s2 }, result, plan, frames }
}

export const inputLabel = 'Object with s1 and s2 (binary strings of equal length)'
export const complexity = 'O(n) time and O(1) space with two states per boundary. The official length reaches 100000; the visualization caps it at 16 so each choice can be drawn.'
export const examples = [
  { label: 'Clears and sets', input: '{"s1":"1101001","s2":"0011010"}' },
  { label: 'Clearing a lone 1', input: '{"s1":"100","s2":"000"}' },
  { label: 'Already equal', input: '{"s1":"0110","s2":"0110"}' },
  { label: 'Single bit rises', input: '{"s1":"0","s2":"1"}' },
]
