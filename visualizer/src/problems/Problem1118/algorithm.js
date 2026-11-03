export const phases = [
  { id: 'start', label: 'Read input', description: 'Read the year and the month number.' },
  { id: 'inspect', label: 'Check month', description: 'Most months have a fixed length. February depends on the year.' },
  { id: 'leap', label: 'Leap rule', description: 'Test divisibility by 4, then the century exception and the 400 exception.' },
  { id: 'done', label: 'Answer', description: 'Return the number of days in the month.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.year) || !Number.isInteger(data.month)) throw new Error('Use an object with integer year and month, for example {"year":2000,"month":2}.')
  if (data.year < 1 || data.year > 9999) throw new Error('year must be from 1 to 9999.')
  if (data.month < 1 || data.month > 12) throw new Error('month must be from 1 to 12.')
  return { year: data.year, month: data.month }
}

export const code = [
  'days in month(year, month):',
  '  if month is 4, 6, 9 or 11:',
  '    return 30',
  '  if month is 2:',
  '    leap = divisible by 4, and not a century year unless divisible by 400',
  '    return 29 if leap else 28',
  '  return 31',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def days_in_month(year, month):
    if month in (4, 6, 9, 11):
        return 30
    if month == 2:
        leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
        return 29 if leap else 28
    return 31`

export function buildTrace(input) {
  const { year, month } = input
  const frames = []
  // Pseudocode and Python share line numbers for this problem.
  const frame = (phase, line, message, snapshot) => frames.push({ phase, activeLine: line, pythonLine: line, message, snapshot })
  const base = { year, month, days: null, leapChecks: null }

  frame('start', 1, `Read year ${year} and month ${month}. Only February depends on the year.`, base)

  if ([4, 6, 9, 11].includes(month)) {
    frame('inspect', 2, `Month ${month} is one of the 30-day months.`, base)
    frame('done', 3, `Return 30 days for month ${month}.`, { ...base, days: 30 })
    return { input, result: 30, frames }
  }

  if (month === 2) {
    frame('inspect', 4, 'February needs the leap rule, so the year matters.', base)
    const div4 = year % 4 === 0
    const div100 = year % 100 === 0
    const div400 = year % 400 === 0
    const leap = div4 && (!div100 || div400)
    const note = !div4
      ? `${year} is not divisible by 4, so there is no leap day.`
      : !div100
        ? `${year} is divisible by 4 and is not a century year, so it is a leap year.`
        : div400
          ? `${year} is a century year divisible by 400, so it is a leap year.`
          : `${year} is a century year not divisible by 400, so it is not a leap year.`
    const checks = { div4, div100, div400, leap }
    frame('leap', 5, note, { ...base, leapChecks: checks })
    const days = leap ? 29 : 28
    frame('done', 6, `February of ${year} has ${days} days.`, { ...base, leapChecks: checks, days })
    return { input, result: days, frames }
  }

  frame('inspect', 2, `Month ${month} is not in the 30-day list, so it has a fixed length.`, base)
  frame('done', 7, `Return 31 days for month ${month}.`, { ...base, days: 31 })
  return { input, result: 31, frames }
}
