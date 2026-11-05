export const examples = [
  { label: 'Vegan only', input: '{"restaurants":[[1,4,1,40,10],[2,8,0,50,5],[3,8,1,30,4],[4,10,0,10,3],[5,1,1,15,1]],"veganFriendly":1,"maxPrice":50,"maxDistance":10}' },
  { label: 'Any', input: '{"restaurants":[[1,4,1,40,10],[2,8,0,50,5],[3,8,1,30,4],[4,10,0,10,3],[5,1,1,15,1]],"veganFriendly":0,"maxPrice":50,"maxDistance":10}' },
  { label: 'Tight limits', input: '{"restaurants":[[1,4,1,40,10],[2,8,0,50,5],[3,8,1,30,4],[4,10,0,10,3],[5,1,1,15,1]],"veganFriendly":0,"maxPrice":30,"maxDistance":3}' },
]

export function parseInput(text) {
  let data
  try {
    data = typeof text === 'string' ? JSON.parse(text) : text
  } catch {
    throw new Error('Input must be a JSON object, e.g. {"restaurants":[[1,4,1,40,10]],"veganFriendly":1,"maxPrice":50,"maxDistance":10}')
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object')
  const { restaurants, veganFriendly, maxPrice, maxDistance } = data
  if (!Array.isArray(restaurants) || restaurants.length < 1) throw new Error('restaurants must be a non-empty array')
  if (restaurants.length > 50) throw new Error(`restaurants has ${restaurants.length} rows; the visualization caps it at 50`)
  restaurants.forEach((r, i) => {
    if (!Array.isArray(r) || r.length !== 5 || !r.every(Number.isInteger)) throw new Error(`restaurants[${i}] must be [id, rating, veganFriendly, price, distance] of integers`)
    if (r[2] !== 0 && r[2] !== 1) throw new Error(`restaurants[${i}] vegan flag must be 0 or 1`)
  })
  if (veganFriendly !== 0 && veganFriendly !== 1) throw new Error('veganFriendly must be 0 or 1')
  if (!Number.isInteger(maxPrice) || !Number.isInteger(maxDistance)) throw new Error('maxPrice and maxDistance must be integers')
  return { restaurants: restaurants.map(r => [...r]), veganFriendly, maxPrice, maxDistance }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function filterRestaurants(restaurants, veganFriendly, maxPrice, maxDistance) {', 'def filter_restaurants(restaurants, vegan_friendly, max_price, max_distance):'],
  ['  const kept = []', '    kept = []'],
  ['  for (const [id, rating, vegan, price, distance] of restaurants) {', '    for id_, rating, vegan, price, distance in restaurants:'],
  ['    if (veganFriendly === 1 && vegan !== 1) continue', '        if vegan_friendly == 1 and vegan != 1: continue'],
  ['    if (price > maxPrice || distance > maxDistance) continue', '        if price > max_price or distance > max_distance: continue'],
  ['    kept.push([rating, id])', '        kept.append((rating, id_))'],
  ['  }', ''],
  ['  kept.sort((a, b) => (b[0] - a[0]) || (b[1] - a[1]))', '    kept.sort(reverse=True)'],
  ['  return kept.map(([, id]) => id)', '    return [id_ for rating, id_ in kept]'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))

export function buildTrace(input) {
  const { restaurants, veganFriendly, maxPrice, maxDistance } = input
  const frames = []
  const kept = []
  const statuses = []
  frames.push({ phase: 'filter', activeLine: L('const kept = []'), pythonLine: P('kept = []'), message: 'Start with no kept restaurants.', i: -1, statuses: [], kept: [], order: [] })
  restaurants.forEach(([id, rating, vegan, price, distance], i) => {
    frames.push({ phase: 'filter', activeLine: L('for (const [id'), pythonLine: P('for id_, rating'), message: `Check restaurant ${id}.`, i, statuses: [...statuses], kept: kept.map(k => k.id), order: [] })
    if (veganFriendly === 1 && vegan !== 1) {
      statuses.push('vegan')
      frames.push({ phase: 'filter', activeLine: L('if (veganFriendly === 1'), pythonLine: P('if vegan_friendly == 1'), message: `Restaurant ${id} is not vegan-friendly; skip.`, i, statuses: [...statuses], kept: kept.map(k => k.id), order: [] })
    } else if (price > maxPrice || distance > maxDistance) {
      statuses.push('limits')
      frames.push({ phase: 'filter', activeLine: L('if (price > maxPrice'), pythonLine: P('if price > max_price'), message: `Restaurant ${id} is over the price or distance limit; skip.`, i, statuses: [...statuses], kept: kept.map(k => k.id), order: [] })
    } else {
      statuses.push('kept')
      kept.push({ id, rating })
      frames.push({ phase: 'filter', activeLine: L('kept.push'), pythonLine: P('kept.append'), message: `Keep restaurant ${id} with rating ${rating}.`, i, statuses: [...statuses], kept: kept.map(k => k.id), order: [] })
    }
  })
  const sorted = [...kept].sort((a, b) => (b.rating - a.rating) || (b.id - a.id))
  frames.push({ phase: 'sort', activeLine: L('kept.sort'), pythonLine: P('kept.sort(reverse=True)'), message: 'Sort by rating descending, then id descending.', i: -1, statuses: [...statuses], kept: kept.map(k => k.id), order: sorted.map(k => k.id) })
  const result = sorted.map(k => k.id)
  frames.push({ phase: 'done', activeLine: L('return kept'), pythonLine: P('return [id_'), message: `Return ${JSON.stringify(result)}.`, i: -1, statuses: [...statuses], kept: kept.map(k => k.id), order: result })
  return { input, result, frames }
}
