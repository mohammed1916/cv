const MAX_LENGTH = 12
const MAX_VALUE = 1000

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.head)) throw new Error('Use an object like {"head":[18,6,10,3]}.')
  if (data.head.length < 1 || data.head.length > MAX_LENGTH) throw new Error(`Use a list of 1 to ${MAX_LENGTH} values.`)
  if (data.head.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return { head: data.head }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace({ head }) {
  const originals = head.map((value, index) => ({ id: `o${index}`, value }))
  const frames = [{ phase: 'start', activeLine: L('set current to the head'), nodes: originals, active: [], message: 'Start at the head of the list.' }]
  const list = [originals[0]]
  for (let i = 1; i < originals.length; i++) {
    const current = originals[i - 1]
    const next = originals[i]
    const g = gcd(current.value, next.value)
    frames.push({ phase: 'pair', activeLine: L('compute the gcd'), nodes: [...list, next], active: [current.id, next.id], message: `gcd(${current.value}, ${next.value}) = ${g}.` })
    list.push({ id: `g${i}`, value: g }, next)
    frames.push({ phase: 'insert', activeLine: L('insert a new node'), nodes: [...list], active: [`g${i}`], message: `Insert ${g} between ${current.value} and ${next.value}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the head'), nodes: [...list], active: [], message: `List now has ${list.length} nodes.` })
  return { input: { head }, result: list.map(node => node.value), frames }
}

export const code = `insert gcd values between neighbouring nodes
  set current to the head node
  repeat while current has a next node
    set next to the node after current
    compute the gcd of the values in current and next
    insert a new node holding that gcd between current and next
    set current to next
  return the head`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def insert_greatest_common_divisors(head):
    from math import gcd
    result = []
    for index, value in enumerate(head):
        if index > 0:
            result.append(gcd(head[index - 1], value))
        result.append(value)
    return result
`
