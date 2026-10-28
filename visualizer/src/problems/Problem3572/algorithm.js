export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.x) || !Array.isArray(input.y)) throw new Error('Use {"x": [...], "y": [...]} with two arrays.')
  const n = input.x.length
  if (n < 3 || n > 30 || input.y.length !== n) throw new Error('The arrays need the same length, from 3 to 30.')
  if (input.x.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each x is an integer from 1 to 10.')
  if (input.y.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each y is an integer from 1 to 50.')
  if (new Set(input.x).size < 3) throw new Error('Pick needs at least three distinct x values.')
  return { x: input.x, y: input.y }
}

export function buildTrace(input) {
  const { x, y } = input
  const bestIndex = new Map()
  const frames = [{ phase: 'start', activeLine: L('set best to an empty'), index: -1, picked: [], total: 0, message: 'For each x value, only the largest y matters, because each x can be used once.' }]
  x.forEach((value, i) => {
    const current = bestIndex.get(value)
    if (current === undefined || y[i] > y[current]) bestIndex.set(value, i)
    frames.push({ phase: 'scan', activeLine: L('keep the largest y'), index: i, picked: [...bestIndex.values()], total: 0, message: `Index ${i} has x ${value} and y ${y[i]}. Best y for x ${value} is ${y[bestIndex.get(value)]}.` })
  })
  const ranked = [...bestIndex.values()].sort((a, b) => y[b] - y[a] || a - b)
  const picked = ranked.slice(0, 3)
  frames.push({ phase: 'rank', activeLine: L('sort the best'), index: -1, picked, total: 0, message: 'Rank the best entry for each x from largest y to smallest.' })
  let total = 0
  for (let p = 0; p < 3; p++) {
    total += y[picked[p]]
    frames.push({ phase: 'pick', activeLine: L('add the y values'), index: picked[p], picked: picked.slice(0, p + 1), total, message: `Take index ${picked[p]} with y ${y[picked[p]]}. Sum so far: ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the sum'), index: -1, picked, total, message: `Maximum y-sum: ${total}.` })
  return { input, result: total, frames }
}

export const code = `maximum y sum with three distinct x values
  set best to an empty map from each x to an index
  for each index from left to right
    keep the largest y seen for its x value
  sort the best indices by y, from largest to smallest
  add the y values of the first three indices
  return the sum`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_y_sum(x, y):
    best = {}
    for i, value in enumerate(x):
        if value not in best or y[i] > y[best[value]]:
            best[value] = i
    ranked = sorted(best.values(), key=lambda i: (-y[i], i))
    return sum(y[i] for i in ranked[:3])
`
