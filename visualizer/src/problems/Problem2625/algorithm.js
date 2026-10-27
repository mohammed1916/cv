export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with arr and n, such as {"arr":[1,[2,[3]]],"n":1}.')
  const { arr, n } = input
  if (!Number.isInteger(n) || n < 0 || n > 5) throw new Error('n must be an integer from 0 to 5.')
  if (!Array.isArray(arr)) throw new Error('arr must be an array.')
  let leaves = 0
  const check = (items, depth) => {
    if (depth > 4) throw new Error('Nesting is limited to 4 levels.')
    for (const item of items) {
      if (Array.isArray(item)) check(item, depth + 1)
      else if (Number.isInteger(item)) leaves++
      else throw new Error('Leaves are integers.')
    }
  }
  check(arr, 1)
  if (leaves > 30) throw new Error('arr may hold at most 30 integers.')
  return { arr, n }
}

export const code = `flatten an array to a given depth
  set output to an empty list
  define walk(items, depth) that goes through the items in order
    for each item in items
      if item is a list and depth is above zero then
        walk the item with depth minus one
      otherwise append item to output
  call walk on arr with depth n
  return output`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ arr, n }) {
  const output = []
  const frames = [{ phase: 'start', activeLine: L('set output to an empty list'), output: [], depth: n, message: `Flatten to depth ${n}.` }]
  const walk = (items, depth) => {
    for (const item of items) {
      if (Array.isArray(item) && depth > 0) {
        frames.push({ phase: 'enter', activeLine: L('walk the item with depth'), output: [...output], depth, message: `Open a nested list; ${depth} level(s) of flattening remain.` })
        walk(item, depth - 1)
      } else {
        output.push(item)
        frames.push({ phase: 'emit', activeLine: L('otherwise append item'), output: [...output], depth, message: `Append ${item} to the output.` })
      }
    }
  }
  walk(arr, n)
  frames.push({ phase: 'done', activeLine: L('return output'), output: [...output], depth: n, message: `Flattened: [${output.join(', ')}].` })
  return { input: { arr, n }, result: output, frames }
}

export const python = `def flatten_deep(arr, n):
    output = []

    def walk(items, depth):
        for item in items:
            if isinstance(item, list) and depth > 0:
                walk(item, depth - 1)
            else:
                output.append(item)

    walk(arr, n)
    return output
`
