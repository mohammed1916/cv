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
      else throw new Error('Leaves must be integers.')
    }
  }
  check(arr, 0)
  if (leaves > 24) throw new Error('Use at most 24 integers so every step stays visible.')
  return { arr, n }
}

export const code = `function flatten(arr, n) {
  const result = []
  function walk(items, depth) {
    for (const item of items) {
      if (Array.isArray(item) && depth < n) walk(item, depth + 1)
      else result.push(item)
    }
  }
  walk(arr, 0)
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def flatten(arr, n):
    result = []
    def walk(items, depth):
        for item in items:
            if isinstance(item, list) and depth < n:
                walk(item, depth + 1)
            else:
                result.append(item)
    walk(arr, 0)
    return result
`

const at = text => code.findIndex(line => line.text.includes(text)) + 1
const pyAt = text => python.split('\n').findIndex(line => line.includes(text)) + 1

export function buildTrace(input) {
  const { arr, n } = input
  const result = []
  const frames = [{ phase: 'start', activeLine: at('const result'), pythonLine: pyAt('result = []'), depth: null, item: null, result: [], message: `Start with an empty output and a depth limit of ${n}.` }]
  const walk = (items, depth, path) => {
    items.forEach((item, index) => {
      const where = [...path, index].join('.')
      if (Array.isArray(item) && depth < n) {
        frames.push({ phase: 'enter', activeLine: at('walk(item'), pythonLine: pyAt('walk(item'), depth, item, result: [...result], path: where, message: `Item ${where} is a list at depth ${depth}, and ${depth} < ${n}, so descend into it.` })
        walk(item, depth + 1, [...path, index])
      } else {
        result.push(item)
        const reason = Array.isArray(item) ? `it is a list at depth ${depth}, and ${depth} is not less than ${n}, so keep it nested` : `it is the integer ${item}`
        frames.push({ phase: 'emit', activeLine: at('result.push'), pythonLine: pyAt('result.append'), depth, item, result: [...result], path: where, message: `Item ${where}: ${reason}. Append it.` })
      }
    })
  }
  walk(arr, 0, [])
  frames.push({ phase: 'done', activeLine: at('return result'), pythonLine: pyAt('return result'), depth: null, item: null, result: [...result], path: null, message: `Flattened to ${result.length} entries.` })
  return { input, result, frames }
}
