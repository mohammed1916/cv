export const phases = [
  { id: 'start', label: 'Start', description: 'Read the values in their original order. The output will alternate between the front and the back.' },
  { id: 'split', label: 'Find middle', description: 'A fast pointer moves two places for every one place of a slow pointer; the slow pointer marks where the first half ends.' },
  { id: 'reverse', label: 'Reverse second half', description: 'Reverse the second half so its last value is the first to be woven in.' },
  { id: 'weave', label: 'Weave halves', description: 'Take one value from the front half, then one from the reversed back half, until both are used.' },
  { id: 'done', label: 'Complete', description: 'The woven sequence is the reordered list.' },
]

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 20 || !values.every(v => Number.isInteger(v) && Math.abs(v) <= 99)) throw new Error('Use a JSON list of 1 to 20 integers from -99 to 99.')
  return values
}

export function buildTrace(values) {
  const n = values.length
  let slow = 0
  let fast = 0
  const snap = (extra = {}) => ({ n, slow, fast, ...extra })
  const frames = [{ phase: 'start', activeLine: L('split = '), pythonLine: P('split = '), snapshot: snap(), message: `The list has ${n} value${n === 1 ? '' : 's'}.` }]
  while (fast + 2 < n) {
    slow += 1
    fast += 2
  }
  const split = slow + 1
  frames.push({ phase: 'split', activeLine: L('fast and slow'), pythonLine: P('split = '), snapshot: snap({ split }), message: `The pointers stop with the first half holding ${split} value${split === 1 ? '' : 's'}; the rest form the second half.` })
  const second = values.slice(split).reverse()
  frames.push({ phase: 'reverse', activeLine: L('second = reverse'), pythonLine: P('second = values[split:]'), snapshot: snap({ split, second: [...second] }), message: `Reverse the second half to get ${second.join(', ') || 'nothing'}.` })
  const result = []
  for (let i = 0; i < split; i++) {
    result.push(values[i])
    if (i < second.length) result.push(second[i])
    frames.push({ phase: 'weave', activeLine: L('append values[i]'), pythonLine: P('result.append(values[i])'), snapshot: snap({ split, second: [...second], step: i, result: [...result] }), message: `Take ${values[i]} from the front${i < second.length ? ` and ${second[i]} from the back` : ''}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), snapshot: snap({ split, second: [...second], result: [...result] }), message: `Reordered list: ${result.join(', ')}.` })
  return { input: values, result, frames }
}

export const code = `reorder list (values):
  n = number of values
  split = (n + 1) / 2 found with fast and slow pointers
  second = reverse of values from split to the end
  result = empty list
  for i from 0 to split-1:
    append values[i] to result
    if i < length of second: append second[i] to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def reorder_list(values):
    n = len(values)
    split = (n + 1) // 2
    second = values[split:][::-1]
    result = []
    for i in range(split):
        result.append(values[i])
        if i < len(second):
            result.append(second[i])
    return result
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
