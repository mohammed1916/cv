export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object') throw new Error('Use an object with z and operation.')
  const { z, operation } = obj
  if (!Number.isInteger(z) || z < 1 || z > 100) throw new Error('z is an integer from 1 to 100.')
  if (operation !== 'sum' && operation !== 'product') throw new Error('operation is "sum" (x + y) or "product" (x * y); the hidden function is one of these here.')
  return { z, operation }
}

export function buildTrace(input) {
  const { z, operation } = input
  const apply = (x, y) => (operation === 'sum' ? x + y : x * y)
  const pairs = []
  const frames = []
  let x = 1
  let y = z
  frames.push({ phase: 'start', activeLine: L('set x to 1'), x, y, value: null, pairs: [], message: `Start with x = 1 and y = ${z}.` })
  while (x <= z && y >= 1) {
    const value = apply(x, y)
    if (value === z) {
      pairs.push([x, y])
      frames.push({ phase: 'found', activeLine: L('add the pair'), x, y, value, pairs: pairs.map(p => [...p]), message: `f(${x}, ${y}) = ${value} equals z, so (${x}, ${y}) is a solution.` })
      x++
      y--
    } else if (value < z) {
      frames.push({ phase: 'low', activeLine: L('increase x'), x, y, value, pairs: pairs.map(p => [...p]), message: `f(${x}, ${y}) = ${value} is below z, so x moves up.` })
      x++
    } else {
      frames.push({ phase: 'high', activeLine: L('decrease y'), x, y, value, pairs: pairs.map(p => [...p]), message: `f(${x}, ${y}) = ${value} is above z, so y moves down.` })
      y--
    }
  }
  frames.push({ phase: 'done', activeLine: L('return pairs'), x, y, value: null, pairs: pairs.map(p => [...p]), message: `Found ${pairs.length} solution pair(s).` })
  return { input, result: pairs, frames }
}

export const code = `find all positive pairs (x, y) with f(x, y) equal to z
  set pairs to an empty list
  set x to 1 and y to z
  while x is at most z and y is at least 1 do
    compute value as f(x, y)
    if value equals z then
      add the pair (x, y) to pairs and move x up and y down
    else if value is less than z then
      increase x by one
    otherwise decrease y by one
  return pairs`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_solutions(z, operation):
    pairs = []
    x = 1
    y = z
    while x <= z and y >= 1:
        if operation == "sum":
            value = x + y
        else:
            value = x * y
        if value == z:
            pairs.append([x, y])
            x += 1
            y -= 1
        elif value < z:
            x += 1
        else:
            y -= 1
    return pairs
`
