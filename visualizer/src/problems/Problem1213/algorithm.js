// Own wording and sample data. Three pointers follow the Python solution in `python`.
export const phases = [
  { id: 'start', label: 'Start', description: 'Place one pointer at the first value of each array.' },
  { id: 'compare', label: 'Compare heads', description: 'Read the three values under the pointers.' },
  { id: 'match', label: 'Common value', description: 'All three heads are equal, so the value is recorded and every pointer moves on.' },
  { id: 'advance', label: 'Advance smallest', description: 'Move only the pointers holding the smallest head. No later value in the other arrays can match it.' },
  { id: 'done', label: 'Result', description: 'Return the recorded common values.' },
]

export const inputLabel = 'Object with three strictly increasing arrays a, b and c (JSON)'
export const complexity = 'O(a + b + c) time and O(min length) extra space for the output. Each pointer only moves forward. The visualizer caps each array at 10 values.'
export const examples = [
  { label: 'Three shared values', input: '{"a":[2,5,8,12,20],"b":[1,5,8,9,20,30],"c":[5,8,20,40]}' },
  { label: 'Disjoint arrays', input: '{"a":[1,3,5],"b":[2,4,6],"c":[7,8]}' },
  { label: 'Only the last value', input: '{"a":[1,2,9],"b":[3,4,9],"c":[5,9]}' },
]

function strictlyIncreasingArray(value, name) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) throw new Error(`${name} must be an array of 1 to 10 integers.`)
  value.forEach((x, i) => {
    if (!Number.isInteger(x) || x < 0 || x > 99) throw new Error(`${name}[${i}] must be an integer from 0 to 99.`)
    if (i > 0 && x <= value[i - 1]) throw new Error(`${name} must be strictly increasing.`)
  })
  return value
}

export function parseInput(text) {
  const data = JSON.parse(text)
  return { a: strictlyIncreasingArray(data.a, 'a'), b: strictlyIncreasingArray(data.b, 'b'), c: strictlyIncreasingArray(data.c, 'c') }
}

const codeText = `common_values(a, b, c):
  set three pointers i, j, k to the first positions
  output = empty list
  while every pointer is still inside its array:
    read heads x, y, z
    if x, y and z are equal:
      append x to output
      move all three pointers forward
    else:
      m = the smallest of x, y, z
      move each pointer whose head equals m forward
  return output`
const pythonText = `def common_values(a, b, c):
    i = j = k = 0                                   # one pointer per array
    out = []
    while i < len(a) and j < len(b) and k < len(c):
        x, y, z = a[i], b[j], c[k]
        if x == y == z:                             # common to all three
            out.append(x)
            i += 1; j += 1; k += 1
        else:
            m = min(x, y, z)
            if x == m: i += 1                       # advance only the smallest heads
            if y == m: j += 1
            if z == m: k += 1
    return out`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = pythonText
const L = key => codeText.split('\n').findIndex(line => line.includes(key)) + 1
const P = key => pythonText.split('\n').findIndex(line => line.includes(key)) + 1

export function buildTrace({ a, b, c }) {
  const arrays = [['a', a], ['b', b], ['c', c]]
  const pos = [0, 0, 0]
  const out = []
  const frames = []
  const heads = () => arrays.map(([, arr], i) => (pos[i] < arr.length ? arr[pos[i]] : null))
  const snap = (extra = {}) => ({ pos: [...pos], heads: heads(), common: [...out], ...extra })
  frames.push({
    phase: 'start', activeLine: L('set three pointers'), pythonLine: P('i = j = k = 0'),
    message: 'Each pointer starts at the first value of its array. Nothing is common yet.', snapshot: snap(),
  })
  while (pos.every((p, i) => p < arrays[i][1].length)) {
    const current = heads()
    frames.push({
      phase: 'compare', activeLine: L('read heads'), pythonLine: P('x, y, z = a[i]'),
      message: `Heads are a=${current[0]}, b=${current[1]}, c=${current[2]}.`, snapshot: snap(),
    })
    if (current[0] === current[1] && current[1] === current[2]) {
      out.push(current[0])
      pos[0] += 1; pos[1] += 1; pos[2] += 1
      frames.push({
        phase: 'match', activeLine: L('append x to output'), pythonLine: P('out.append(x)'),
        message: `All three heads are ${current[0]}, so it is common. Record it and move all three pointers on.`, snapshot: snap({ found: current[0] }),
      })
    } else {
      const low = Math.min(...current)
      const moved = []
      current.forEach((value, i) => { if (value === low) { pos[i] += 1; moved.push(arrays[i][0]) } })
      frames.push({
        phase: 'advance', activeLine: L('move each pointer whose head'), pythonLine: P('m = min(x, y, z)'),
        message: `The smallest head is ${low}. The other arrays are already past it, so it cannot appear later there. Advance ${moved.join(' and ')}.`,
        snapshot: snap({ low, moved }),
      })
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return output'), pythonLine: P('return out'),
    message: out.length ? `Common values: [${out.join(', ')}].` : 'One array ran out before any value was shared, so the output is empty.',
    snapshot: snap({ end: true }),
  })
  return { input: { a, b, c }, result: out, frames }
}
