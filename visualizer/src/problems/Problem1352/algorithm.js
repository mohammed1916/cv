export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.operations) || input.operations.length < 1 || input.operations.length > 12) throw new Error('Use an object with operations: an array of 1 to 12 entries.')
  let size = 0
  for (const op of input.operations) {
    if (!Array.isArray(op) || op.length !== 2) throw new Error('Each operation is ["add", value] or ["getProduct", k].')
    const [name, value] = op
    if (name === 'add') {
      if (!Number.isInteger(value) || value < 0 || value > 9) throw new Error('add takes an integer from 0 to 9.')
      size++
    } else if (name === 'getProduct') {
      if (!Number.isInteger(value) || value < 1 || value > size) throw new Error('getProduct takes k from 1 to the number of values added so far.')
    } else {
      throw new Error('Operation names are "add" and "getProduct".')
    }
  }
  return { operations: input.operations }
}

// The submitted solution, line for line. Every displayed line is also the Python that runs.
export const CODE_LINES = [
  'class ProductOfNumbers:',
  '    def __init__(self):',
  '        self.nums = []',
  '    def add(self, num: int):',
  '        self.nums.append(num)',
  '    def getProduct(self, k: int) -> int:',
  '        product = 1',
  '        for num in self.nums[-k:]:',
  '            product *= num',
  '        return product',
]
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = CODE_LINES.join('\n') + '\n'

export function buildTrace({ operations }) {
  const nums = []
  const outputs = []
  const frames = [{ phase: 'start', activeLine: 3, index: -1, stream: [], outputs: [], window: null, product: null, message: 'Start with an empty list of numbers.' }]
  for (const [name, value] of operations) {
    if (name === 'add') {
      nums.push(value)
      frames.push({ phase: 'add', activeLine: 5, index: nums.length - 1, stream: [...nums], outputs: [...outputs], window: null, product: null, message: `Append ${value} to the end of the list.` })
      continue
    }
    const k = value
    const window = nums.slice(-k)
    const start = nums.length - k
    frames.push({ phase: 'query', activeLine: 7, index: nums.length - 1, stream: [...nums], outputs: [...outputs], window: null, product: 1, k, message: `Query for the last ${k}: start the product at 1.` })
    frames.push({ phase: 'slice', activeLine: 8, index: nums.length - 1, stream: [...nums], outputs: [...outputs], window: [start, nums.length - 1], product: 1, k, message: `Take the last ${k} numbers: positions ${start} to ${nums.length - 1}.` })
    let product = 1
    for (let j = 0; j < window.length; j++) {
      product *= window[j]
      frames.push({ phase: 'multiply', activeLine: 9, index: start + j, stream: [...nums], outputs: [...outputs], window: [start, nums.length - 1], product, k, message: `Multiply by ${window[j]}: running product ${product}.` })
    }
    outputs.push(product)
    frames.push({ phase: 'return', activeLine: 10, index: nums.length - 1, stream: [...nums], outputs: [...outputs], window: [start, nums.length - 1], product, k, message: `Return ${product}.` })
  }
  frames.push({ phase: 'done', activeLine: 10, index: nums.length - 1, stream: [...nums], outputs: [...outputs], window: null, product: null, message: `Answers: ${outputs.join(', ') || '(none)'}.` })
  return { input: { operations }, result: outputs, frames }
}
