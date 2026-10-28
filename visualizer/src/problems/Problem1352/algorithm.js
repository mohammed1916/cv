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

export function buildTrace(input) {
  const { operations } = input
  const stream = []
  // prods holds prefix products of the values since the last zero; prods[0] is 1.
  let prods = [1]
  const outputs = []
  const frames = [{ phase: 'start', activeLine: L('set prods to [1]'), index: -1, stream: [], outputs: [], message: 'Start with an empty stream and prefix products [1].' }]
  operations.forEach(([name, value]) => {
    if (name === 'add') {
      stream.push(value)
      if (value === 0) prods = [1]
      else prods.push(prods[prods.length - 1] * value)
      frames.push({ phase: 'add', activeLine: L('if value is 0'), index: stream.length - 1, stream: [...stream], outputs: [...outputs], message: value === 0 ? `Add 0. Every product that reaches back past it is 0.` : `Add ${value}. Prefix product since the last zero is ${prods[prods.length - 1]}.` })
    } else {
      const since = prods.length - 1
      const answer = value > since ? 0 : prods[prods.length - 1] / prods[prods.length - 1 - value]
      outputs.push(answer)
      frames.push({ phase: 'query', activeLine: L('if k is more than'), index: stream.length - 1, stream: [...stream], outputs: [...outputs], k: value, answer, message: value > since ? `Last ${value} include a zero, so the product is 0.` : `Last ${value} numbers multiply to ${answer}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return outputs'), index: stream.length - 1, stream: [...stream], outputs: [...outputs], message: `Outputs: ${outputs.join(', ') || '(none)'}.` })
  return { input, result: outputs, frames }
}

export const code = `product of the last k numbers in a growing stream
  set prods to [1] and outputs to an empty list
  for each operation in order do
    if it is add with value then
      if value is 0 then set prods to [1]
      otherwise append prods[last] times value to prods
    if it is getProduct with k then
      if k is more than the count of values since the last zero then add 0 to outputs
      otherwise add prods[last] divided by prods[last minus k] to outputs
  return outputs`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def product_of_last_k(operations):
    prods = [1]
    outputs = []
    for name, value in operations:
        if name == 'add':
            if value == 0:
                prods = [1]
            else:
                prods.append(prods[-1] * value)
        else:
            if value > len(prods) - 1:
                outputs.append(0)
            else:
                outputs.append(prods[-1] // prods[-1 - value])
    return outputs
`
