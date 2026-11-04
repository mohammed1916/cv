const MAX_SIDE = 8
const MAX_VALUE = 100000

export const code = `largest total rating after one-way transfers
  if every device has one unit, no transfer helps, so add those units
  sort the units of each device
  find the lowest unit anywhere
  choose as sink the device with the smallest second-lowest unit
  the sink collects unwanted units, so it rates the lowest unit
  for every other device
    it sends its lowest unit to the sink and rates its second-lowest
  return the total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_ratings(units):
    if len(units[0]) == 1:
        return sum(device[0] for device in units)
    rows = [sorted(device) for device in units]
    lowest = min(row[0] for row in rows)
    sink = min(range(len(rows)), key=lambda i: rows[i][1])
    total = lowest
    for i, row in enumerate(rows):
        if i != sink:
            total += row[1]
    return total
`

export const phases = [
  { id: 'start', label: 'Start', description: 'Read the devices.' },
  { id: 'single', label: 'One unit', description: 'Sending a lone unit empties the device, so nothing moves.' },
  { id: 'sort', label: 'Sort', description: 'Line up each device so its two smallest units are in front.' },
  { id: 'lowest', label: 'Lowest', description: 'The lowest unit overall has to live somewhere.' },
  { id: 'sink', label: 'Sink', description: 'Pick the device that loses the least by holding the unwanted units.' },
  { id: 'send', label: 'Send', description: 'A device sheds its lowest unit and now rates its second-lowest.' },
  { id: 'done', label: 'Result', description: 'Add up the ratings.' },
]

const lineOf = (lines, fragment) => {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}
const L = fragment => lineOf(code.map(c => c.text), fragment)
const PY = python.trim().split('\n')
const P = fragment => lineOf(PY, fragment)
const sum = values => values.reduce((a, b) => a + b, 0)

export function parseInput(text) {
  const input = JSON.parse(text)
  const units = input?.units
  if (!Array.isArray(units) || units.length < 1 || units.length > MAX_SIDE) throw new Error(`units has 1 to ${MAX_SIDE} devices in this view.`)
  const n = Array.isArray(units[0]) ? units[0].length : 0
  if (n < 1 || n > MAX_SIDE) throw new Error(`Each device has 1 to ${MAX_SIDE} units in this view.`)
  for (const device of units) {
    if (!Array.isArray(device) || device.length !== n) throw new Error('Every device has the same number of units.')
    for (const value of device) if (!Number.isInteger(value) || value < 1 || value > MAX_VALUE) throw new Error(`Each capacity is an integer from 1 to ${MAX_VALUE}.`)
  }
  return { units: units.map(device => [...device]) }
}

export function buildTrace({ units }) {
  const frames = []
  const m = units.length
  const rows = units.map(device => [...device])
  const sortedFlags = units.map(() => false)
  const ratings = units.map(() => null)
  const sent = units.map(() => false)
  let lowest = null, lowestAt = null, sink = null, total = null, candidates = []
  const emit = fields => frames.push({
    rows: rows.map(r => [...r]), sorted: [...sortedFlags], ratings: [...ratings], sent: [...sent],
    lowest, lowestAt, sink, total, candidates, at: -1, single: false, check: null, ...fields,
  })

  emit({ phase: 'start', activeLine: 1, pythonLine: P('def max_ratings'), message: `${m} device${m === 1 ? '' : 's'} with ${units[0].length} unit${units[0].length === 1 ? '' : 's'} each.` })

  if (units[0].length === 1) {
    total = 0
    emit({ phase: 'single', activeLine: L('if every device has one unit'), pythonLine: P('if len(units[0]) == 1'), single: true, message: 'Sending a lone unit would rate the sender 0 and can only pull the receiver down, so nothing moves.' })
    units.forEach((device, i) => {
      total += device[0]
      ratings[i] = device[0]
      emit({ phase: 'single', activeLine: L('if every device has one unit'), pythonLine: P('return sum('), at: i, single: true, message: `Device ${i} keeps its unit and rates ${device[0]}. Total ${total}.` })
    })
    emit({ phase: 'done', activeLine: L('return the total'), pythonLine: P('return sum('), single: true, message: `Return ${total}.` })
    return { input: { units }, result: total, frames }
  }

  rows.forEach((row, i) => {
    row.sort((a, b) => a - b)
    sortedFlags[i] = true
    emit({ phase: 'sort', activeLine: L('sort the units'), pythonLine: P('rows = [sorted'), at: i, message: `Device ${i} in order: lowest ${row[0]}, second-lowest ${row[1]}. Without its lowest unit it would rate ${row[1]}.` })
  })

  lowest = rows[0][0]
  lowestAt = 0
  rows.forEach((row, i) => { if (row[0] < lowest) { lowest = row[0]; lowestAt = i } })
  emit({ phase: 'lowest', activeLine: L('find the lowest unit'), pythonLine: P('lowest = min'), message: `The lowest unit is ${lowest} on device ${lowestAt}. Whichever device ends up holding it rates ${lowest}, so one device has to take that hit.` })

  sink = 0
  rows.forEach((row, i) => { if (row[1] < rows[sink][1]) sink = i })
  candidates = rows.map((row, i) => ({ device: i, 'rating if unit leaves': row[1], 'rating as sink': lowest, loss: row[1] - lowest }))
  emit({ phase: 'sink', activeLine: L('choose as sink'), pythonLine: P('sink = min'), message: `Device ${sink} has the smallest second-lowest (${rows[sink][1]}), so serving as sink costs only ${rows[sink][1] - lowest}.` })

  total = lowest
  ratings[sink] = lowest
  emit({ phase: 'sink', activeLine: L('the sink collects'), pythonLine: P('total = lowest'), at: sink, message: `Device ${sink} is the sink and will rate ${lowest}. Total starts at ${total}.` })

  rows.forEach((row, i) => {
    if (i === sink) return
    sent[i] = true
    ratings[i] = row[1]
    total += row[1]
    emit({ phase: 'send', activeLine: L('it sends its lowest'), pythonLine: P('total += row[1]'), at: i, message: `Device ${i} sends ${row[0]} to device ${sink} and now rates ${row[1]}. Total ${total}.` })
  })

  const secondSum = sum(rows.map(row => row[1]))
  const check = { secondSum, smallestSecond: rows[sink][1], lowest, total }
  emit({ phase: 'done', activeLine: L('return the total'), pythonLine: P('return total'), check, message: `Return ${total}, which is ${secondSum} − (${rows[sink][1]} − ${lowest}).` })
  return { input: { units }, result: total, frames }
}
