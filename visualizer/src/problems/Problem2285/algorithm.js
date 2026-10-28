export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with n and roads.')
  const { n, roads } = data
  if (!Number.isInteger(n) || n < 2 || n > 7) throw new Error('n is an integer from 2 to 7.')
  if (!Array.isArray(roads) || roads.length < 1 || roads.length > 12) throw new Error('roads must have 1 to 12 entries.')
  const seen = new Set()
  for (const r of roads) {
    if (!Array.isArray(r) || r.length !== 2 || !r.every(Number.isInteger)) throw new Error('Each road is a pair of city numbers.')
    const [a, b] = r
    if (a < 0 || b < 0 || a >= n || b >= n || a === b) throw new Error('Cities are numbered 0 to n minus 1, with no self-loops.')
    const key = a < b ? `${a},${b}` : `${b},${a}`
    if (seen.has(key)) throw new Error('Each pair of cities is joined by at most one road.')
    seen.add(key)
  }
  return { n, roads }
}

export function buildTrace(input) {
  const { n, roads } = input
  const degree = new Array(n).fill(0)
  for (const [a, b] of roads) { degree[a] += 1; degree[b] += 1 }
  const order = degree.map((_, i) => i).sort((a, b) => degree[b] - degree[a] || a - b)
  const value = new Array(n).fill(0)
  const frames = [{ phase: 'start', activeLine: L('sort the cities by road count'), degree: [...degree], value: [...value], index: -1, total: 0, message: 'Count the roads at each city. Busier cities should get larger values.' }]
  order.forEach((city, rank) => {
    value[city] = n - rank
    frames.push({ phase: 'assign', activeLine: L('give it the value'), degree: [...degree], value: [...value], index: city, total: 0, message: `City ${city} has ${degree[city]} roads and gets value ${value[city]}.` })
  })
  let total = 0
  for (const [a, b] of roads) {
    total += value[a] + value[b]
    frames.push({ phase: 'road', activeLine: L('add the values of both ends'), degree: [...degree], value: [...value], index: a, total, message: `Road ${a}-${b} adds ${value[a]} + ${value[b]}. Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the total'), degree: [...degree], value: [...value], index: -1, total, message: `Maximum total importance: ${total}.` })
  return { input, result: total, frames }
}

export const code = `maximum total importance of all roads:
  count the roads touching each city
  sort the cities by road count, most roads first
  for each city in that order, give it the value n minus its position
  set total to zero
  for each road
    add the values of both ends to total
  return the total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_total_importance(n, roads):
    degree = [0] * n
    for a, b in roads:
        degree[a] += 1
        degree[b] += 1
    order = sorted(range(n), key=lambda city: -degree[city])
    value = [0] * n
    for rank, city in enumerate(order):
        value[city] = n - rank
    return sum(value[a] + value[b] for a, b in roads)
`
