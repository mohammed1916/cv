const pad = (value, width) => String(value).padStart(width, '0')
const format = (year, month, day) => `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`

export const isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
export const monthLengths = year => [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with date.')
  const { date } = input
  const match = typeof date === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(date) : null
  if (!match) throw new Error('date must look like YYYY-MM-DD.')
  const [year, month, day] = match.slice(1).map(Number)
  if (year < 1 || year > 9998) throw new Error('The year must be between 0001 and 9998.')
  if (month < 1 || month > 12) throw new Error('The month must be between 01 and 12.')
  if (day < 1 || day > monthLengths(year)[month - 1]) throw new Error(`${date} is not a real calendar date.`)
  return { date }
}

export const code = `next day of a YYYY-MM-DD date
  split the date into year, month and day
  decide if the year is a leap year
  look up how many days each month has
  add 1 to the day
  if the day is now past the end of the month
    set the day back to 1
    add 1 to the month
    if the month is now past December
      set the month back to January
      add 1 to the year
  write the fields back as YYYY-MM-DD`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Pseudocode line missing: ${key}`)
  return index + 1
}

export const python = `def next_day(date):
    year, month, day = map(int, date.split("-"))
    leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
    lengths = [31, 29 if leap else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    day += 1
    if day > lengths[month - 1]:
        day = 1
        month += 1
        if month > 12:
            month = 1
            year += 1
    return f"{year:04d}-{month:02d}-{day:02d}"
`
const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

// The form the task actually asks for. It is shown on the page and run by the tests.
export const javascript = `Date.prototype.nextDay = function () {
  const copy = new Date(this.getTime())
  copy.setUTCDate(copy.getUTCDate() + 1)
  return copy.toISOString().slice(0, 10)
}`

export const phases = [
  { id: 'split', label: 'Split', description: 'Read the year, month and day fields.' },
  { id: 'leap', label: 'Leap year', description: 'Test divisibility by 4, 100 and 400.' },
  { id: 'length', label: 'Month length', description: 'Find the last day of this month.' },
  { id: 'add', label: 'Add a day', description: 'Move the day field forward by one.' },
  { id: 'month', label: 'Month carry', description: 'A day past the end carries into the month.' },
  { id: 'year', label: 'Year carry', description: 'A month past December carries into the year.' },
  { id: 'done', label: 'Result', description: 'Write the fields back as text.' },
]

export const inputLabel = 'Object with date as YYYY-MM-DD'
export const complexity = 'O(1) time and space: at most two carries, whatever the date. The input box takes real calendar dates from 0001 to 9998 written as YYYY-MM-DD.'
export const examples = [
  { label: 'Same month', input: '{"date":"2023-09-14"}' },
  { label: 'Leap February', input: '{"date":"2028-02-28"}' },
  { label: 'Century, not leap', input: '{"date":"2100-02-28"}' },
  { label: 'New year', input: '{"date":"2023-12-31"}' },
    { label: 'Earliest year in range', input: '{"date":"0001-01-01"}' },
    { label: 'Leap day in a leap year', input: '{"date":"2028-02-29"}' },
    { label: 'Century divisible by 400 is a leap year', input: '{"date":"2400-02-29"}' },
    { label: 'Largest year: last day of 9998', input: '{"date":"9998-12-31"}' },
  ]

export function buildTrace({ date }) {
  const start = date.split('-').map(Number)
  const [startYear, startMonth, startDay] = start
  let [year, month, day] = start
  const frames = []
  const push = (phase, key, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(key), pythonLine: P(pyKey), message, year, month, day, carried: null, ...extra,
  })
  push('split', 'split the date', 'map(int', `Read year ${year}, month ${month} and day ${day}.`)

  const tests = [
    { divisor: 4, passes: startYear % 4 === 0 },
    { divisor: 100, passes: startYear % 100 === 0 },
    { divisor: 400, passes: startYear % 400 === 0 },
  ]
  const leap = isLeapYear(startYear)
  const why = !tests[0].passes ? 'it is not divisible by 4'
    : !tests[1].passes ? 'it is divisible by 4 and is not a century year'
      : tests[2].passes ? 'it is a century year divisible by 400' : 'it is a century year not divisible by 400'
  const context = { tests, leap }
  push('leap', 'leap year', 'leap =', `${startYear} is ${leap ? '' : 'not '}a leap year, because ${why}.`, context)

  const lengths = monthLengths(startYear)
  const last = lengths[startMonth - 1]
  const known = { ...context, last }
  push('length', 'how many days', 'lengths =', `Month ${startMonth} of ${startYear} ends on day ${last}.`, known)

  day += 1
  push('add', 'add 1 to the day', 'day += 1', `The day field becomes ${day}.`, known)

  const overflow = day > last
  push('add', 'past the end of the month', 'day > lengths', overflow
    ? `Day ${day} does not exist: the month ends on day ${last}, so carry into the month.`
    : `Day ${day} fits, because the month has ${last} days. No carry.`, { ...known, overflow })

  if (overflow) {
    const overflowed = day
    day = 1
    push('month', 'set the day back', 'day = 1', `Day ${overflowed} wraps round to day 1.`, { ...known, overflow, carried: 'day' })
    month += 1
    push('month', 'add 1 to the month', 'month += 1', `The month field becomes ${month}.`, { ...known, overflow, carried: 'month' })
    const pastDecember = month > 12
    push('month', 'past December', 'month > 12', pastDecember
      ? `There is no month ${month}, so carry into the year.`
      : `Month ${month} exists. The year stays ${year}.`, { ...known, overflow, carried: 'month' })
    if (pastDecember) {
      month = 1
      push('year', 'set the month back', 'month = 1', 'Month 13 wraps round to January.', { ...known, overflow, carried: 'month' })
      year += 1
      push('year', 'add 1 to the year', 'year += 1', `The year field becomes ${year}.`, { ...known, overflow, carried: 'year' })
    }
  }

  const result = format(year, month, day)
  push('done', 'write the fields', 'return f', `The next day is ${result}. The original ${format(startYear, startMonth, startDay)} is untouched.`, { ...known, overflow, result })
  return { input: { date }, result, frames }
}
