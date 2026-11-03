export const phases = [
  { id: 'start', label: 'Start', description: 'Leap status is set and the running total starts at the day of the month.' },
  { id: 'inspect', label: 'Inspect month', description: 'Look at one complete month that comes before the chosen month.' },
  { id: 'update', label: 'Add month', description: 'Add that month length to the running total.' },
  { id: 'done', label: 'Result', description: 'The running total is the one-based day number.' },
]

const SOURCE = [
  ['head', 'function day_of_year(year, month, day):', 'def day_of_year(year, month, day):'],
  ['leap', '  leap = (year % 4 == 0 and year % 100 != 0) or year % 400 == 0', '    leap = (year % 4 == 0 and year % 100 != 0) or year % 400 == 0'],
  ['total', '  total = day', '    total = day'],
  ['loop', '  for m from 1 to month - 1:', '    for m in range(1, month):'],
  ['add', '    total = total + days_in(m, leap)', '        total += days_in(m, leap)'],
  ['ret', '  return total', '    return total'],
]
export const code = SOURCE.map(row => row[1]).join('\n')
export const python = SOURCE.map(row => row[2]).join('\n')
export const pythonLineMap = Object.fromEntries(SOURCE.map((_, index) => [index + 1, index + 1]))
const L = Object.fromEntries(SOURCE.map((row, index) => [row[0], index + 1]))

const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
function isLeap(year) { return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 }
function monthLength(month, year) { return month === 2 && isLeap(year) ? 29 : DAYS[month - 1] }

export function parseInput(text) {
  const match = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(text)
  if (!match) throw new Error('Enter a date as YYYY-MM-DD.')
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3])
  if (year < 1900 || year > 2100) throw new Error('The year must be from 1900 to 2100.')
  if (month < 1 || month > 12) throw new Error('The month must be from 1 to 12.')
  const limit = monthLength(month, year)
  if (day < 1 || day > limit) throw new Error(`The day must be from 1 to ${limit} for that month.`)
  return { year, month, day }
}

export function buildTrace({ year, month, day }) {
  const leap = isLeap(year)
  const frames = []
  let total = day
  const counted = []
  const snapshot = (extra = {}) => ({
    year, month, day, leap, lengths: Array.from({ length: 12 }, (_, i) => monthLength(i + 1, year)),
    counted: [...counted], total, ...extra,
  })
  frames.push({
    phase: 'start', activeLine: L.leap,
    message: `${year} is ${leap ? 'a leap' : 'not a leap'} year, so February has ${leap ? 29 : 28} days.`,
    snapshot: snapshot(),
  })
  frames.push({
    phase: 'start', activeLine: L.total,
    message: `Start the total at day ${day} of month ${month}.`,
    snapshot: snapshot(),
  })
  for (let m = 1; m < month; m++) {
    const length = monthLength(m, year)
    frames.push({
      phase: 'inspect', activeLine: L.loop,
      message: `Month ${m} is complete and has ${length} days.`,
      snapshot: snapshot({ focus: m }),
    })
    total += length
    counted.push(m)
    frames.push({
      phase: 'update', activeLine: L.add,
      message: `Add ${length}. The total is now ${total}.`,
      snapshot: snapshot({ focus: m }),
    })
  }
  frames.push({
    phase: 'done', activeLine: L.ret,
    message: `Day ${day} of month ${month} is day ${total} of the year.`,
    snapshot: snapshot(),
  })
  return { input: { year, month, day }, result: total, frames }
}
