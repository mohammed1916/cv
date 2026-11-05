// Model of the official carArrived(carId, roadId, direction, turnGreen, crossCar) contract:
// road A is roadId 1 (directions 1 and 2), road B is roadId 2 (directions 3 and 4).
// Road A starts green. A car on the red road first turns its road green, then crosses.

export const code = `function trafficLightControlledIntersection(arrivals) {
  let green = 1
  const log = []
  for (const [car, road, direction] of arrivals) {
    if (road !== green) {
      green = road
      log.push(\`light turns green on road \${road}\`)
    }
    log.push(\`car \${car} crosses on road \${road} in direction \${direction}\`)
  }
  return log
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def traffic_light_controlled_intersection(arrivals):
    green = 1
    log = []
    for car, road, direction in arrivals:
        if road != green:
            green = road
            log.append(f"light turns green on road {road}")
        log.append(f"car {car} crosses on road {road} in direction {direction}")
    return log
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const phases = [
  { id: 'start', label: 'Start', description: 'Road A (roadId 1) has the green light; road B is red.' },
  { id: 'switch', label: 'Turn green', description: 'The car is on the red road, so its road turns green first.' },
  { id: 'cross', label: 'Cross', description: 'The car crosses while its road is green.' },
  { id: 'done', label: 'Result', description: 'Every car has crossed, and the log records each event in order.' },
]

const DIRECTIONS = { 1: [1, 2], 2: [3, 4] }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.arrivals) || input.arrivals.length < 1 || input.arrivals.length > 20) {
    throw new Error('arrivals is a list of 1 to 20 [carId, roadId, direction] triples.')
  }
  for (const a of input.arrivals) {
    if (!Array.isArray(a) || a.length !== 3 || !Number.isInteger(a[0]) || ![1, 2].includes(a[1]) || !DIRECTIONS[a[1]].includes(a[2])) {
      throw new Error('Each arrival is [carId, roadId, direction]: roadId 1 uses directions 1 or 2, roadId 2 uses directions 3 or 4.')
    }
  }
  return input
}

export function buildTrace({ arrivals }) {
  let green = 1
  const log = []
  const frames = [{ phase: 'start', pythonLine: PL('green = 1'), activeLine: L('let green = 1'), state: { green, log: [], car: null }, message: 'Road A (roadId 1) starts with the green light.' }]
  for (const [car, road, direction] of arrivals) {
    if (road !== green) {
      green = road
      log.push(`light turns green on road ${road}`)
      frames.push({ phase: 'switch', pythonLine: PL('green = road'), activeLine: L('green = road'), state: { green, log: [...log], car: { id: car, road, direction } }, message: `Car ${car} waits on red, so road ${road} turns green first.` })
    }
    log.push(`car ${car} crosses on road ${road} in direction ${direction}`)
    frames.push({ phase: 'cross', pythonLine: PL('log.append(f"car'), activeLine: L('log.push(`car'), state: { green, log: [...log], car: { id: car, road, direction } }, message: `Car ${car} crosses in direction ${direction} while road ${road} is green.` })
  }
  frames.push({ phase: 'done', pythonLine: PL('return log'), activeLine: L('return log'), state: { green, log: [...log], car: null }, message: 'Every car has crossed.' })
  return { input: { arrivals }, result: log, frames }
}
