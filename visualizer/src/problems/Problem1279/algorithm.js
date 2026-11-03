export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.arrivals) || input.arrivals.length < 1 || input.arrivals.length > 20) throw new Error('arrivals is a list of 1 to 20 [car, road] pairs.')
  for (const a of input.arrivals) {
    if (!Array.isArray(a) || a.length !== 2 || !Number.isInteger(a[0]) || !Number.isInteger(a[1]) || a[1] < 1 || a[1] > 4) throw new Error('Each arrival is [car id, road from 1 to 4].')
  }
  return input
}

export function buildTrace({ arrivals }) {
  let green = 1
  const log = []
  const frames = [{ phase: 'start', pythonLine: PL('green = 1'), activeLine: L('start with road 1 green'), state: [`road ${green} is green`], message: 'Road 1 starts with the green light.' }]
  for (const [car, road] of arrivals) {
    if (road !== green) {
      green = road
      log.push(`light switches to road ${road}`)
      frames.push({ phase: 'switch', pythonLine: PL('green = road'), activeLine: L('if its road is not green'), state: [...log], message: `Car ${car} waits, so the light moves to road ${road}.` })
    }
    log.push(`car ${car} crosses on road ${road}`)
    frames.push({ phase: 'cross', pythonLine: PL('log.append(f"car'), activeLine: L('let the car cross'), state: [...log], message: `Car ${car} crosses on road ${road}.` })
  }
  frames.push({ phase: 'done', pythonLine: PL('return log'), activeLine: L('return the log'), state: [...log], message: 'Every car has crossed.' })
  return { input: { arrivals }, result: log, frames }
}

export const code = `traffic light for four roads
  start with road 1 green
  for each car in arrival order
    if its road is not green then switch the light to that road
    let the car cross
  return the log`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def intersection(arrivals):
    green = 1
    log = []
    for car, road in arrivals:
        if road != green:
            green = road
            log.append(f"light switches to road {road}")
        log.append(f"car {car} crosses on road {road}")
    return log
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
