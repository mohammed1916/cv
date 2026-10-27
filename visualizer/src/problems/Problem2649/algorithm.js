export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with a single key arr holding the nested array.')
  const { arr } = data
  if (!Array.isArray(arr)) throw new Error('arr must be an array.')
  let leaves = 0
  let deepest = 0
  const check = (item, depth) => {
    if (depth > 5) throw new Error('Nesting may go at most 5 levels deep.')
    deepest = Math.max(deepest, depth)
    if (Array.isArray(item)) { item.forEach(child => check(child, depth + 1)); return }
    if (!Number.isInteger(item) || item < -1000 || item > 1000) throw new Error('Values are integers from -1000 to 1000, or arrays of them.')
    leaves++
  }
  check(arr, 0)
  if (leaves > 30) throw new Error('arr may hold at most 30 values.')
  return { arr }
}

export function buildTrace(input) {
  const { arr } = input
  const output = []
  const frames = []
  let depth = 0
  let path = 'arr'
  const frame = (phase, line, message) => frames.push({ phase, activeLine: line, depth, path, output: [...output], message })
  frame('start', L('set output to an empty list'), 'Start with the whole array. Values come out in depth-first order.')
  const emit = (item, label) => {
    if (Array.isArray(item)) {
      frame('enter', L('if item is a list then'), `Open the array at ${label}, which holds ${item.length} entries.`)
      item.forEach((child, index) => {
        depth++
        emit(child, `${label}[${index}]`)
        depth--
      })
      return
    }
    output.push(item)
    path = label
    frame('yield', L('add item to output'), `Yield ${item} from ${label}.`)
  }
  emit(arr, 'arr')
  frame('done', L('return output'), `The generator yields ${output.length} values in order.`)
  return { input, result: output, frames }
}

export const code = `flatten the nested array in depth-first order
  set output to an empty list
  call emit on the whole array
  return output

emit(item)
  if item is a list then
    for each entry of item, in order, do
      call emit on that entry
  otherwise
    add item to output`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def nested_array_values(arr):
    output = []

    def emit(item):
        if isinstance(item, list):
            for entry in item:
                emit(entry)
        else:
            output.append(item)

    emit(arr)
    return output
`
