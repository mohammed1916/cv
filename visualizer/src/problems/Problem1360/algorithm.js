export const phases = [
  { id: 'start', label: 'Start', description: 'Two dates are given as YYYY-MM-DD. Turn each into a count of days since 1 January 1900.' },
  { id: 'first', label: 'First date', description: 'Add the full years, the full months and the days of the first date.' },
  { id: 'second', label: 'Second date', description: 'Do the same for the second date, using the same starting point.' },
  { id: 'done', label: 'Complete', description: 'The difference of the two day counts is the answer, taken as a positive number.' },
]

export const examples = [
  { label: 'Same year', input: '{"first":"2020-01-15","second":"2020-02-20"}' },
  { label: 'Across a leap day', input: '{"first":"2019-12-31","second":"2020-03-01"}' },
  { label: 'Order does not matter', input: '{"first":"2020-03-01","second":"2019-12-31"}' },
]

const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
const daysIn = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]

function parseDate(text, label) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text))
  if (!m) throw new Error(`${label} must use the YYYY-MM-DD format.`)
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  if (y < 1900 || y > 2100) throw new Error(`${label} must have a year from 1900 to 2100.`)
  if (mo < 1 || mo > 12 || d < 1 || d > daysIn(y, mo)) throw new Error(`${label} is not a real calendar date.`)
  return { y, mo, d, text: String(text) }
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object') throw new Error('Use an object with first and second dates, such as {"first":"2020-01-15","second":"2020-02-20"}.')
  return { first: parseDate(data.first, 'first'), second: parseDate(data.second, 'second') }
}

function dayNumber({ y, mo, d }) {
  let total = 0
  for (let year = 1900; year < y; year++) total += isLeap(year) ? 366 : 365
  for (let month = 1; month < mo; month++) total += daysIn(y, month)
  return total + d
}

export function buildTrace({ first, second }) {
  const a = dayNumber(first), b = dayNumber(second)
  const snap = (extra = {}) => ({ first: first.text, second: second.text, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const dayCount ='), pythonLine: P('def day_number'), snapshot: snap(),
    message: `Compare ${first.text} with ${second.text} by counting days from 1900-01-01.` }]
  frames.push({ phase: 'first', activeLine: L('const a ='), pythonLine: P('a = day_number'), snapshot: snap({ a }),
    message: `${first.text} is day ${a} counted from 1900-01-01.` })
  frames.push({ phase: 'second', activeLine: L('const b ='), pythonLine: P('b = day_number'), snapshot: snap({ a, b }),
    message: `${second.text} is day ${b} counted from the same start.` })
  const result = Math.abs(a - b)
  frames.push({ phase: 'done', activeLine: L('return Math.abs'), pythonLine: P('return abs'), snapshot: snap({ a, b, result }),
    message: `The dates are ${result} day(s) apart.`, result })
  return { input: { first, second }, result, frames }
}

export const code = `function daysBetweenDates(first, second) {
  const dayCount = (y, mo, d) => {
    let total = 0
    for (let year = 1900; year < y; year++) total += isLeap(year) ? 366 : 365
    for (let month = 1; month < mo; month++) total += daysIn(y, month)
    return total + d
  }
  const a = dayCount(...first)
  const b = dayCount(...second)
  return Math.abs(a - b)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def days_between_dates(first, second):
    def day_number(y, mo, d):
        total = 0
        for year in range(1900, y):
            total += 366 if is_leap(year) else 365
        for month in range(1, mo):
            total += days_in(y, month)
        return total + d

    a = day_number(*first)
    b = day_number(*second)
    return abs(a - b)
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
