// Teaching model written for this visualizer. The sample dates and wording are original.
export const phases = [
  { id: 'read', label: 'Read', description: 'Read the year, month and day of both dates.' },
  { id: 'first', label: 'Day number of first', description: 'Turn the first date into a running day count.' },
  { id: 'second', label: 'Day number of second', description: 'Turn the second date into a running day count on the same scale.' },
  { id: 'done', label: 'Difference', description: 'The gap is the absolute difference of the two counts.' },
]

const CODE = [
  'days between(first, second):',
  '  a = day number of first',
  '  b = day number of second',
  '  return |a - b|',
  'day number(y, m, d):',
  '  if m <= 2: y -= 1',
  '  era = y div 400, yoe = y - era * 400',
  '  mp = m - 3 if m > 2 else m + 9',
  '  doy = (153 * mp + 2) div 5 + d - 1',
  '  doe = yoe * 365 + yoe div 4 - yoe div 100 + doy',
  '  return era * 146097 + doe',
]
const PYTHON = `def days_between(first, second):
    return abs(day_number(*first) - day_number(*second))

def day_number(y, m, d):
    if m <= 2:
        y -= 1
    era = y // 400
    yoe = y - era * 400
    mp = m - 3 if m > 2 else m + 9
    doy = (153 * mp + 2) // 5 + d - 1
    doe = yoe * 365 + yoe // 4 - yoe // 100 + doy
    return era * 146097 + doe`
const PY = PYTHON.split('\n')
const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing solver line: ${text}`)
  return index + 1
}
const L = text => at(CODE, text)
const P = text => at(PY, text)

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON

// Days since a fixed origin. Only differences matter, so the origin does not affect the answer.
export function dayNumber(y, m, d) {
  const shifted = m <= 2 ? y - 1 : y
  const era = Math.floor(shifted / 400)
  const yoe = shifted - era * 400
  const mp = m > 2 ? m - 3 : m + 9
  const doy = Math.floor((153 * mp + 2) / 5) + d - 1
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy
  return era * 146097 + doe
}

const PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function readDate(text, label) {
  const match = PATTERN.exec(text)
  if (!match) throw new Error(`${label} must look like YYYY-MM-DD.`)
  const [y, m, d] = match.slice(1).map(Number)
  const check = new Date(Date.UTC(y, m - 1, d))
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) throw new Error(`${label} is not a real calendar date.`)
  if (y < 1900 || y > 2100) throw new Error('Use years from 1900 to 2100.')
  return { text, y, m, d }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.first !== 'string' || typeof input.second !== 'string') throw new Error('Enter a JSON object with string fields first and second.')
  return { first: readDate(input.first, 'first'), second: readDate(input.second, 'second') }
}

export function buildTrace(input) {
  const { first, second } = input
  const frames = []
  const snap = (extra = {}) => ({ first, second, ...extra })

  frames.push({
    phase: 'read', activeLine: L('days between'), pythonLine: P('def days_between'),
    message: `Read ${first.text} and ${second.text}. Each date becomes one number, so the gap between the numbers is the gap in days.`,
    snapshot: snap(),
  })
  const a = dayNumber(first.y, first.m, first.d)
  frames.push({
    phase: 'first', activeLine: L('a = day number'), pythonLine: P('day_number(*first)'),
    message: `${first.text} maps to day number ${a}. January and February count as the end of the previous year, so the leap day falls at the right place.`,
    snapshot: snap({ a }),
  })
  const b = dayNumber(second.y, second.m, second.d)
  frames.push({
    phase: 'second', activeLine: L('b = day number'), pythonLine: P('day_number(*second)'),
    message: `${second.text} maps to day number ${b}, on the same scale as ${a}.`,
    snapshot: snap({ a, b }),
  })
  const gap = Math.abs(a - b)
  frames.push({
    phase: 'done', activeLine: L('return |a - b|'), pythonLine: P('return abs'),
    message: `The absolute difference is ${gap} day${gap === 1 ? '' : 's'}, whichever date comes first.`,
    snapshot: snap({ a, b, gap }),
  })
  return { input: { first: first.text, second: second.text }, result: gap, frames }
}
