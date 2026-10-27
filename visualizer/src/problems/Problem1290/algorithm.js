export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.head)) throw new Error('Use an object with a head array of bits.')
  const { head } = obj
  if (head.length < 1 || head.length > 20) throw new Error('head needs 1 to 20 bits in this visualization.')
  if (head.some(b => b !== 0 && b !== 1)) throw new Error('Each node holds 0 or 1.')
  return { head }
}

export function buildTrace(input) {
  const head = input.head
  let value = 0
  const frames = [{ phase: 'start', activeLine: L('set value to 0'), k: -1, value, message: 'Start with value 0 at the head.' }]
  head.forEach((bit, k) => {
    value = value * 2 + bit
    frames.push({ phase: 'bit', activeLine: L('set value to 2 times'), k, value, message: `Bit ${bit} at node ${k}: value becomes ${value}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return value'), k: head.length, value, message: `The binary number is ${value}.` })
  return { input, result: value, frames }
}

export const code = `convert a binary linked list to an integer
  set value to 0
  set node to the head
  while node is not empty do
    set value to 2 times value plus the bit of node
    move node to the next node
  return value`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def binary_to_integer(head):
    value = 0
    for bit in head:
        value = value * 2 + bit
    return value
`
