export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with locations, start, finish, and fuel.')
  const { locations, start, finish, fuel } = data
  if (!Array.isArray(locations) || locations.length < 2 || locations.length > 8) throw new Error('locations must be an array of 2 to 8 integers.')
  if (locations.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Each location is an integer from 1 to 1000.')
  if (new Set(locations).size !== locations.length) throw new Error('Locations must be distinct.')
  if (!Number.isInteger(start) || start < 0 || start >= locations.length) throw new Error('start must be a valid index into locations.')
  if (!Number.isInteger(finish) || finish < 0 || finish >= locations.length) throw new Error('finish must be a valid index into locations.')
  if (!Number.isInteger(fuel) || fuel < 0 || fuel > 20) throw new Error('fuel is an integer from 0 to 20.')
  return { locations, start, finish, fuel }
}

const MOD = 1000000007

export function buildTrace(input) {
  const { locations, start, finish, fuel } = input
  const n = locations.length
  const memo = new Map()
  const entries = []
  const snapshot = () => entries.map(e => ({ ...e }))
  const frames = [{ phase: 'start', activeLine: L('call routes on start'), city: start, fuel, memo: [], message: `Start at city ${start} with ${fuel} fuel.` }]

  const routes = (city, left) => {
    const key = `${city}:${left}`
    if (memo.has(key)) {
      const value = memo.get(key)
      frames.push({ phase: 'reuse', activeLine: L('if the memo already holds'), city, fuel: left, memo: snapshot(), message: `(${city}, ${left}) is already known to be ${value}.` })
      return value
    }
    let total = city === finish ? 1 : 0
    frames.push({ phase: 'visit', activeLine: L('set total to 1'), city, fuel: left, memo: snapshot(), message: `Count routes from city ${city} with ${left} fuel. The route stopping here counts ${total ? 'once' : 'zero times'}.` })
    for (let next = 0; next < n; next++) {
      if (next === city) continue
      const cost = Math.abs(locations[city] - locations[next])
      if (cost > left) continue
      total = (total + routes(next, left - cost)) % MOD
    }
    memo.set(key, total)
    entries.push({ city, fuel: left, value: total })
    frames.push({ phase: 'store', activeLine: L('store total'), city, fuel: left, memo: snapshot(), message: `Store ${total} for (${city}, ${left}).` })
    return total
  }

  const result = routes(start, fuel)
  frames.push({ phase: 'done', activeLine: L('return the result'), city: null, fuel: null, memo: snapshot(), message: `Routes from ${start} to ${finish}: ${result}.` })
  return { input, result, frames }
}

export const code = `count the routes from start to finish with the fuel
  call routes on start with all of the fuel
  return the result

routes for a city and the fuel left
  if the memo already holds (city, left) then return that value
  set total to 1 if city is finish, otherwise 0
  for each other city next
    set cost to the distance between the two locations
    if cost is at most left then
      add routes for next with left minus cost to total, modulo 1000000007
  store total for (city, left) and return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_routes(locations, start, finish, fuel):
    MOD = 1000000007
    memo = {}

    def routes(city, left):
        key = (city, left)
        if key in memo:
            return memo[key]
        total = 1 if city == finish else 0
        for nxt in range(len(locations)):
            if nxt == city:
                continue
            cost = abs(locations[city] - locations[nxt])
            if cost <= left:
                total = (total + routes(nxt, left - cost)) % MOD
        memo[key] = total
        return total

    return routes(start, fuel)
`
