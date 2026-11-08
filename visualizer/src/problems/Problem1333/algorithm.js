export const examples = [
  { label: 'Vegan only', input: '{"restaurants":[[1,4,1,40,10],[2,8,0,50,5],[3,8,1,30,4],[4,10,0,10,3],[5,1,1,15,1]],"veganFriendly":1,"maxPrice":50,"maxDistance":10}' },
  { label: 'Any', input: '{"restaurants":[[1,4,1,40,10],[2,8,0,50,5],[3,8,1,30,4],[4,10,0,10,3],[5,1,1,15,1]],"veganFriendly":0,"maxPrice":50,"maxDistance":10}' },
  { label: 'Tight limits', input: '{"restaurants":[[1,4,1,40,10],[2,8,0,50,5],[3,8,1,30,4],[4,10,0,10,3],[5,1,1,15,1]],"veganFriendly":0,"maxPrice":30,"maxDistance":3}' },
    { label: "Single restaurant that fits", input: "{\"restaurants\":[[1,4,1,40,10]],\"veganFriendly\":1,\"maxPrice\":50,\"maxDistance\":10}" },
    { label: "Equal ratings", input: "{\"restaurants\":[[1,4,1,30,5],[2,4,1,20,5]],\"veganFriendly\":1,\"maxPrice\":50,\"maxDistance\":10}" },
    { label: "Nothing fits the price cap", input: "{\"restaurants\":[[3,5,1,100,4]],\"veganFriendly\":1,\"maxPrice\":50,\"maxDistance\":10}" },
    { label: "Extreme values", input: "{\"restaurants\":[[1,1,0,1,1],[2,100000,1,100000,100000]],\"veganFriendly\":0,\"maxPrice\":100000,\"maxDistance\":100000}" },
    { label: "Long run: fifty restaurants", input: "{\"restaurants\":[[1,5,0,32,23],[2,13,0,22,8],[3,9,1,33,7],[4,17,0,48,27],[5,35,0,37,16],[6,33,0,16,23],[7,13,1,22,24],[8,26,0,27,3],[9,24,1,17,15],[10,7,0,59,18],[11,8,0,55,16],[12,15,1,12,16],[13,1,0,1,4],[14,24,0,21,22],[15,1,1,21,10],[16,40,1,17,12],[17,6,1,38,13],[18,6,0,51,18],[19,2,1,49,27],[20,48,0,15,26],[21,36,0,57,27],[22,11,0,15,17],[23,8,1,48,1],[24,17,1,49,29],[25,31,1,5,16],[26,7,0,43,8],[27,1,1,59,27],[28,15,0,27,5],[29,14,0,9,24],[30,35,0,50,4],[31,32,0,36,24],[32,2,0,58,18],[33,50,1,25,21],[34,38,0,57,20],[35,45,0,36,24],[36,47,1,12,1],[37,38,1,56,22],[38,12,1,47,19],[39,39,1,26,29],[40,4,1,29,14],[41,47,1,14,18],[42,10,1,6,7],[43,41,0,8,6],[44,37,1,47,13],[45,3,0,40,28],[46,17,0,51,22],[47,31,1,3,28],[48,21,0,22,29],[49,37,0,42,1],[50,27,1,27,22]],\"veganFriendly\":1,\"maxPrice\":40,\"maxDistance\":25}" },
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
