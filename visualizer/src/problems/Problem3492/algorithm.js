export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use an object with n, w and maxWeight.')
  const { n, w, maxWeight } = value
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('n is an integer from 1 to 10.')
  if (!Number.isInteger(w) || w < 1 || w > 10) throw new Error('w is an integer from 1 to 10.')
  if (!Number.isInteger(maxWeight) || maxWeight < 0 || maxWeight > 200) throw new Error('maxWeight is an integer from 0 to 200.')
  return { n, w, maxWeight }
}

export function buildTrace({ n, w, maxWeight }) {
  const capacity = n * n
  let load = 0
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set capacity to'), count: 0, load: 0, message: `The grid holds ${capacity} containers of weight ${w}. The ship limit is ${maxWeight}.` }]
  while (count < capacity && load + w <= maxWeight) {
    load += w
    count++
    frames.push({ phase: 'place', activeLine: L('add a container'), count, load, message: `Place container ${count}. Load is ${load} of ${maxWeight}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), count, load, message: `Maximum containers: ${count}.` })
  return { input: { n, w, maxWeight }, result: count, frames }
}

export const code = `maximum containers on a ship:
  set capacity to n times n
  set load to 0 and count to 0
  while count is below capacity and load plus w is at most maxWeight do
    add a container of weight w to load
    increase count by 1
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_containers(n, w, maxWeight):
    capacity = n * n
    load = 0
    count = 0
    while count < capacity and load + w <= maxWeight:
        load += w
        count += 1
    return count
`
