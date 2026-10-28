export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with capacity, rocks and additional_rocks.')
  const { capacity, rocks, additional_rocks } = input
  if (!Array.isArray(capacity) || capacity.length < 1 || capacity.length > 12) throw new Error('capacity needs 1 to 12 bags.')
  if (!Array.isArray(rocks) || rocks.length !== capacity.length) throw new Error('rocks must match capacity in length.')
  if (capacity.some(c => !Number.isInteger(c) || c < 1 || c > 100)) throw new Error('Capacities are integers from 1 to 100.')
  if (rocks.some((r, i) => !Number.isInteger(r) || r < 0 || r > capacity[i])) throw new Error('Each bag holds 0 to its capacity in rocks.')
  if (!Number.isInteger(additional_rocks) || additional_rocks < 0 || additional_rocks > 100) throw new Error('additional_rocks is an integer from 0 to 100.')
  return { capacity, rocks, additional_rocks }
}

export function buildTrace(input) {
  const { capacity, rocks, additional_rocks } = input
  const need = capacity.map((c, i) => c - rocks[i])
  const order = need.map((_, i) => i).sort((a, b) => need[a] - need[b] || a - b)
  let left = additional_rocks
  let full = 0
  const frames = [{ phase: 'start', activeLine: L('work out how many rocks'), bag: -1, left, full, message: `Each bag still needs some rocks; ${left} extra rocks are available.` }]
  for (const i of order) {
    if (need[i] > left) {
      frames.push({ phase: 'stop', activeLine: L('if the bag needs more rocks'), bag: i, left, full, message: `Bag ${i} needs ${need[i]} but only ${left} remain; no later bag fits either.` })
      break
    }
    left -= need[i]
    full += 1
    frames.push({ phase: 'fill', activeLine: L('subtract its need from left'), bag: i, left, full, message: `Fill bag ${i} with ${need[i]} rocks; ${left} left.` })
  }
  frames.push({ phase: 'done', activeLine: L('return full'), bag: -1, left, full, message: `${full} bags are full.` })
  return { input, result: full, frames }
}

export const code = `maximum number of bags that can be made full:
  work out how many rocks each bag still needs
  sort the bags by how many rocks they still need, fewest first
  set left to additional_rocks and full to 0
  for each bag in that order
    if the bag needs more rocks than left then stop the loop
    subtract its need from left and add one to full
  return full`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_bags_full(capacity, rocks, additional_rocks):
    need = sorted(c - r for c, r in zip(capacity, rocks))
    left = additional_rocks
    full = 0
    for amount in need:
        if amount > left:
            break
        left -= amount
        full += 1
    return full
`
