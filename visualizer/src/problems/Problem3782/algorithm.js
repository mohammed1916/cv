export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n)) throw new Error('Use a JSON object with an integer n.')
  if (input.n < 1 || input.n > 200) throw new Error('n must be an integer from 1 to 200 (visualization cap).')
  return input
}

export function buildTrace(input) {
  const { n } = input
  let values = Array.from({ length: n }, (_, i) => i + 1)
  let op = 1
  const frames = [{ phase: 'start', activeLine: L('values = the integers'), op: 0, values, message: `Write the integers 1 through ${n}.` }]
  while (values.length > 1) {
    if (op === 1) values = values.filter((_, i) => i % 2 === 0)
    else values = values.filter((_, i, a) => (a.length - 1 - i) % 2 === 0)
    frames.push({
      phase: op === 1 ? 'left' : 'right',
      activeLine: op === 1 ? L('keep the values at even positions') : L('keep the values at even distances'),
      op, values,
      message: op === 1 ? `Operation 1 from the left leaves ${values.length} value(s).` : `Operation 2 from the right leaves ${values.length} value(s).`,
    })
    op = op === 1 ? 2 : 1
  }
  const result = values[0]
  frames.push({ phase: 'done', activeLine: L('return the only remaining value'), op: 0, values, message: `The last remaining integer is ${result}.` })
  return { input, result, frames }
}

export const code = `last remaining integer after alternating deletions (n):
  values = the integers 1 through n
  op = 1
  while more than one value remains
    if op is 1 then keep the values at even positions from the left
    otherwise keep the values at even distances from the right
    switch op between 1 and 2
  return the only remaining value`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def last_remaining_integer_after_alternating_deletion_operations(n):
    values = list(range(1, n + 1))
    op = 1
    while len(values) > 1:
        if op == 1:
            values = values[0::2]
        else:
            values = values[::-1][0::2][::-1]
        op = 2 if op == 1 else 1
    return values[0]
`
