export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with n and restrictions.')
  const { n, restrictions } = input
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n is an integer from 2 to 8.')
  if (!Array.isArray(restrictions) || restrictions.length > n - 1) throw new Error('restrictions holds at most n minus 1 pairs.')
  const ids = new Set()
  for (const pair of restrictions) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger)) throw new Error('Each restriction is [building, maxHeight] with integers.')
    const [id, cap] = pair
    if (id < 2 || id > n) throw new Error('A restricted building is numbered from 2 to n; building 1 is fixed at height 0.')
    if (ids.has(id)) throw new Error('Each building appears in at most one restriction.')
    if (cap < 0 || cap > 10) throw new Error('A height cap is an integer from 0 to 10.')
    ids.add(id)
  }
  return { n, restrictions }
}

export function buildTrace(input) {
  const { n, restrictions } = input
  const limit = Array(n + 1).fill(Infinity)
  limit[1] = 0
  for (const [id, cap] of restrictions) limit[id] = cap
  const frames = [{ phase: 'start', activeLine: L('set the limit of building 1'), building: -1, limit: limit.slice(), best: 0, message: 'Building 1 has height 0; each restricted building has a cap.' }]
  for (let i = 2; i <= n; i++) {
    const v = Math.min(limit[i], limit[i - 1] + 1)
    if (v !== limit[i]) {
      limit[i] = v
      frames.push({ phase: 'forward', activeLine: L('lower limit i to the limit of building i minus 1'), building: i, limit: limit.slice(), best: 0, message: `Building ${i} can be at most ${v}, one more than building ${i - 1}.` })
    }
  }
  for (let i = n - 1; i >= 1; i--) {
    const v = Math.min(limit[i], limit[i + 1] + 1)
    if (v !== limit[i]) {
      limit[i] = v
      frames.push({ phase: 'backward', activeLine: L('lower limit i to the limit of building i+1'), building: i, limit: limit.slice(), best: 0, message: `Building ${i} can be at most ${v}, because building ${i + 1} caps it.` })
    }
  }
  const restricted = [1, ...restrictions.map(([id]) => id).sort((a, b) => a - b)]
  let best = Math.max(...restricted.map(i => limit[i]))
  frames.push({ phase: 'peak', activeLine: L('set best to the tallest'), building: -1, limit: limit.slice(), best, message: `The tallest capped building is ${best}.` })
  for (let p = 0; p + 1 < restricted.length; p++) {
    const a = restricted[p]
    const b = restricted[p + 1]
    const peak = Math.floor((limit[a] + limit[b] + b - a) / 2)
    best = Math.max(best, peak)
    frames.push({ phase: 'peak', activeLine: L('divided by 2'), building: a, limit: limit.slice(), best, message: `Between ${a} and ${b} the tallest possible building is ${peak}; best ${best}.` })
  }
  const last = restricted[restricted.length - 1]
  best = Math.max(best, limit[last] + n - last)
  frames.push({ phase: 'peak', activeLine: L('set best to the larger of best and the limit of the last'), building: last, limit: limit.slice(), best, message: `Growing by one per building after ${last} gives ${limit[last] + n - last}; best ${best}.` })
  frames.push({ phase: 'done', activeLine: L('return best'), building: -1, limit: limit.slice(), best, message: `Maximum building height: ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum height of the tallest building:
  set the limit of building 1 to 0 and each restricted building to its cap
  for i from 2 to n
    lower limit i to the limit of building i minus 1 plus 1 if that is smaller
  for i from n minus 1 down to 1
    lower limit i to the limit of building i+1 plus 1 if that is smaller
  set best to the tallest limit among the restricted buildings
  for each pair of consecutive restricted buildings a and b
    set best to the larger of best and (limit a plus limit b plus b minus a) divided by 2
  set best to the larger of best and the limit of the last restricted building plus n minus that building
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_building_height(n, restrictions):
    limit = [float('inf')] * (n + 1)
    limit[1] = 0
    for building, cap in restrictions:
        limit[building] = cap
    for i in range(2, n + 1):
        limit[i] = min(limit[i], limit[i - 1] + 1)
    for i in range(n - 1, 0, -1):
        limit[i] = min(limit[i], limit[i + 1] + 1)
    restricted = [1] + sorted(building for building, _ in restrictions)
    best = max(limit[i] for i in restricted)
    for a, b in zip(restricted, restricted[1:]):
        best = max(best, (limit[a] + limit[b] + b - a) // 2)
    last = restricted[-1]
    best = max(best, limit[last] + n - last)
    return best
`
