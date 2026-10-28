export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.points) || data.points.length < 1 || data.points.length > 30) throw new Error('Use points as an array of 1 to 30 [x, y] pairs.')
  if (data.points.some(p => !Array.isArray(p) || p.length !== 2 || p.some(v => !Number.isInteger(v) || v < 0 || v > 100))) throw new Error('Each point is [x, y] with integers from 0 to 100.')
  if (!Number.isInteger(data.k) || data.k < 0 || data.k > 100) throw new Error('Use an integer k from 0 to 100.')
  return { points: data.points, k: data.k }
}

export function buildTrace({ points, k }) {
  const seen = new Map()
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set seen to'), index: -1, key: null, added: 0, total: 0, seen: [], message: `Look for pairs whose XOR distance is ${k}.` }]
  points.forEach(([x, y], index) => {
    let added = 0
    for (let a = 0; a <= k; a++) {
      const b = k - a
      added += seen.get(`${x ^ a},${y ^ b}`) || 0
    }
    total += added
    frames.push({ phase: 'scan', activeLine: L('add the seen count'), index, key: `${x},${y}`, added, total, seen: [...seen], message: `Point (${x}, ${y}) pairs with ${added} earlier point(s).` })
    const key = `${x},${y}`
    seen.set(key, (seen.get(key) || 0) + 1)
    frames.push({ phase: 'record', activeLine: L('record this point'), index, key, added, total, seen: [...seen], message: `Record (${x}, ${y}) so later points can pair with it.` })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, key: null, added: 0, total, seen: [...seen], result: total, message: `Total pairs: ${total}.` })
  return { input: { points, k }, result: total, frames }
}

export const code = `count pairs of points at xor distance k
  set seen to an empty count of points
  set total to zero
  for each point x y in order
    for each split a from 0 to k, with b equal to k minus a
      add the seen count at x xor a and y xor b to total
    record this point in seen
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_pairs_with_distance(points, k):
    seen = {}
    total = 0
    for x, y in points:
        for a in range(k + 1):
            b = k - a
            total += seen.get((x ^ a, y ^ b), 0)
        seen[(x, y)] = seen.get((x, y), 0) + 1
    return total
`
