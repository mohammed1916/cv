const NAME = /^[A-Za-z]{1,10}$/
const MAX_TIME = 1000000
const route = (from, to) => `${from} to ${to}`

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.operations)) throw new Error('Use {"operations": [...]} with 1 to 40 operations.')
  const { operations } = data
  if (operations.length < 1 || operations.length > 40) throw new Error('Use 1 to 40 operations.')
  const open = new Map(), finished = new Set()
  let last = 0
  operations.forEach((op, i) => {
    const at = `Operation ${i + 1}`
    if (!Array.isArray(op)) throw new Error(`${at} must be an array such as ["checkIn", id, station, time].`)
    const [name, ...args] = op
    if (name === 'checkIn' || name === 'checkOut') {
      if (args.length !== 3) throw new Error(`${at}: ${name} takes a customer id, a station and a time.`)
      const [id, station, time] = args
      if (!Number.isInteger(id) || id < 1 || id > MAX_TIME) throw new Error(`${at}: customer ids are integers from 1 to 1000000.`)
      if (typeof station !== 'string' || !NAME.test(station)) throw new Error(`${at}: station names are 1 to 10 letters.`)
      if (!Number.isInteger(time) || time < last || time > MAX_TIME) throw new Error(`${at}: times are whole numbers, never decreasing, up to 1000000.`)
      last = time
      if (name === 'checkIn') {
        if (open.has(id)) throw new Error(`${at}: customer ${id} is already checked in.`)
        open.set(id, station)
      } else {
        if (!open.has(id)) throw new Error(`${at}: customer ${id} has no open check-in.`)
        finished.add(route(open.get(id), station))
        open.delete(id)
      }
    } else if (name === 'getAverageTime') {
      if (args.length !== 2 || !args.every(s => typeof s === 'string' && NAME.test(s))) throw new Error(`${at}: getAverageTime takes a start and an end station.`)
      if (!finished.has(route(args[0], args[1]))) throw new Error(`${at}: no finished trip from ${args[0]} to ${args[1]} yet.`)
    } else {
      throw new Error(`${at}: unknown operation "${name}".`)
    }
  })
  return data
}

export function buildTrace(data) {
  const open = new Map(), totals = new Map()
  const results = []
  const frames = []
  const maps = () => [
    { name: 'open', keyLabel: 'customer', valueLabel: 'check-in', isSet: false, entries: [...open].map(([id, info]) => [id, `${info.station} at ${info.time}`]) },
    { name: 'routes', keyLabel: 'route', valueLabel: 'total / trips', isSet: false, entries: [...totals].map(([key, t]) => [key, `${t.sum} / ${t.count}`]) },
  ]
  frames.push({ phase: 'start', activeLine: L('underground system keeps'), maps: maps(), ops: [], result: null, message: 'Both tables start empty. Check-ins wait in the open table; finished trips feed the route totals.' })
  data.operations.forEach(op => {
    const [name, ...args] = op
    if (name === 'checkIn') {
      const [id, station, time] = args
      open.set(id, { station, time })
      results.push(null)
      frames.push({ phase: 'checkin', activeLine: L('record the station'), maps: maps(),
        ops: [{ map: 'open', type: 'insert', key: id, value: `${station} at ${time}` }], result: null,
        message: `Customer ${id} checks in at ${station} at time ${time}. The open table holds ${open.size} trip(s).` })
    } else if (name === 'checkOut') {
      const [id, station, time] = args
      const start = open.get(id)
      open.delete(id)
      const key = route(start.station, station)
      const before = totals.has(key) ? `${totals.get(key).sum} / ${totals.get(key).count}` : undefined
      const t = totals.get(key) ?? { sum: 0, count: 0 }
      t.sum += time - start.time
      t.count += 1
      totals.set(key, t)
      results.push(null)
      frames.push({ phase: 'checkout', activeLine: L('add t minus'), maps: maps(),
        ops: [
          { map: 'open', type: 'delete', key: id, existed: true, before: `${start.station} at ${start.time}` },
          { map: 'routes', type: before === undefined ? 'insert' : 'update', key, value: `${t.sum} / ${t.count}`, before },
        ], result: null,
        message: `Customer ${id} checks out at ${station} at time ${time}. The trip took ${time - start.time}, added to ${key}.` })
    } else {
      const [start, end] = args
      const t = totals.get(route(start, end))
      const average = t.sum / t.count
      results.push(average)
      frames.push({ phase: 'query', activeLine: L('divide the total'), maps: maps(),
        ops: [{ map: 'routes', type: 'lookup', key: route(start, end), hit: true, via: 'get', value: `${t.sum} / ${t.count}`,
          hitNote: 'the route total and trip count are already stored, so the average is one division', missNote: 'no trip finished on this route' }],
        result: average, message: `Average from ${start} to ${end}: ${t.sum} / ${t.count} = ${average}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return the quotient'), maps: maps(), ops: [], result: results.at(-1) ?? null, message: 'All operations are answered in order.' })
  return { input: data, result: results, frames }
}

export const code = `underground system keeps two tables
  open trips: customer id -> (station, time)
  route totals: (start, end) -> (total time, trip count)
check in customer id at station at time t
  record the station and time as the open trip for id
check out customer id at station at time t
  take the open trip for id out of the table
  add t minus the check-in time to the total of its route
  add one to the trip count of that route
get average time from start to end
  divide the total of the route by its trip count
  return the quotient`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def underground_system(operations):
    open_trips = {}
    totals = {}
    counts = {}
    results = []
    for op in operations:
        name = op[0]
        if name == 'checkIn':
            _, customer, station, time = op
            open_trips[customer] = (station, time)
            results.append(None)
        elif name == 'checkOut':
            _, customer, station, time = op
            start_station, start_time = open_trips.pop(customer)
            route = (start_station, station)
            totals[route] = totals.get(route, 0) + (time - start_time)
            counts[route] = counts.get(route, 0) + 1
            results.append(None)
        else:
            _, start, end = op
            route = (start, end)
            results.append(totals[route] / counts[route])
    return results
`
