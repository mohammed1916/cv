export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use an object with apple and capacity.')
  const { apple, capacity } = value
  if (!Array.isArray(apple) || apple.length < 1 || apple.length > 6) throw new Error('apple must list 1 to 6 integers.')
  if (!Array.isArray(capacity) || capacity.length < 1 || capacity.length > 6) throw new Error('capacity must list 1 to 6 integers.')
  if ([...apple, ...capacity].some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Values are integers from 1 to 10.')
  const need = apple.reduce((sum, v) => sum + v, 0)
  if (capacity.reduce((sum, v) => sum + v, 0) < need) throw new Error('The boxes cannot hold all the apples.')
  return { apple, capacity }
}

export function buildTrace({ apple, capacity }) {
  const need = apple.reduce((sum, v) => sum + v, 0)
  const ranked = [...capacity].sort((a, b) => b - a)
  const frames = [{ phase: 'start', activeLine: L('set need to the total'), count: 0, held: 0, need, used: [], message: `The apples total ${need}. Boxes are taken largest first.` }]
  let held = 0
  let count = 0
  while (held < need) {
    held += ranked[count]
    count++
    frames.push({ phase: 'take', activeLine: L('add the next box'), count, held, need, used: ranked.slice(0, count), message: `Take a box of capacity ${ranked[count - 1]}. Held ${held} of ${need}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), count, held, need, used: ranked.slice(0, count), message: `Minimum boxes: ${count}.` })
  return { input: { apple, capacity }, result: count, frames }
}

export const code = `minimum number of boxes for all apples:
  set need to the total number of apples
  sort the box capacities from largest to smallest
  set held to 0 and count to 0
  while held is less than need do
    add the next box capacity to held
    increase count by 1
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_boxes(apple, capacity):
    need = sum(apple)
    ranked = sorted(capacity, reverse=True)
    held = 0
    count = 0
    while held < need:
        held += ranked[count]
        count += 1
    return count
`
