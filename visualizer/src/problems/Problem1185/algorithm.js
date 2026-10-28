const NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const isLeap = y => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)
const monthLength = (month, year) => (month === 2 ? (isLeap(year) ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with day, month and year.')
  const { day, month, year } = input
  if (!Number.isInteger(year) || year < 1971 || year > 2100) throw new Error('year must be an integer from 1971 to 2100.')
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error('month must be an integer from 1 to 12.')
  if (!Number.isInteger(day) || day < 1 || day > monthLength(month, year)) throw new Error('day must be a valid day of that month.')
  return { day, month, year }
}

export function buildTrace({ day, month, year }) {
  const frames = [{ phase: 'start', activeLine: L('set days to 0'), days: 0, index: -1, message: `Count the days from 1 January 1971 to ${day}/${month}/${year}.` }]
  let days = 0
  for (let y = 1971; y < year; y++) days += isLeap(y) ? 366 : 365
  frames.push({ phase: 'years', activeLine: L('for each year from 1971'), days, index: -1, message: `Whole years before ${year} add ${days} days.` })
  for (let m = 1; m < month; m++) days += monthLength(m, year)
  days += day - 1
  const index = (5 + days) % 7
  frames.push({ phase: 'done', activeLine: L('return the weekday name'), days, index, message: `${days} days after a Friday is ${NAMES[index]}.` })
  return { input: { day, month, year }, result: NAMES[index], index, frames }
}

export const code = `name of the weekday for a date from 1971 to 2100
read day, month and year from the input
set days to 0
for each year from 1971 to the year minus 1 do
  add 366 if the year is a leap year, otherwise add 365
for each month before the given month do
  add the number of days in that month, with February having 29 in leap years
add day minus 1
set index to (5 + days) modulo 7, since 1 January 1971 was a Friday
return the weekday name at index`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def day_of_week(day, month, year):
    names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    def leap(y):
        return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)

    days = 0
    for y in range(1971, year):
        days += 366 if leap(y) else 365
    lengths = [31, 29 if leap(year) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    for m in range(month - 1):
        days += lengths[m]
    days += day - 1
    return names[(5 + days) % 7]
`
