const DATE = /^(\d{4})-(\d{2})-(\d{2})$/

function daysIn(year, month) {
  if (month === 2) return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data.date !== 'string') throw new Error('Use an object with a date string in yyyy-mm-dd form.')
  const match = DATE.exec(data.date)
  if (!match) throw new Error('The date must look like 2080-02-29.')
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3])
  if (year < 1900 || year > 2100) throw new Error('The year must be from 1900 to 2100.')
  if (month < 1 || month > 12) throw new Error('The month must be from 01 to 12.')
  if (day < 1 || day > daysIn(year, month)) throw new Error(`That month has no day ${day}.`)
  return { date: data.date }
}

// Repeated division shows each binary digit in turn; the visualization lists the steps.
function binaryDigits(n) {
  if (n === 0) return '0'
  const digits = []
  for (let x = n; x > 0; x = Math.floor(x / 2)) digits.unshift(String(x % 2))
  return digits.join('')
}

export function buildTrace(input) {
  const [year, month, day] = input.date.split('-').map(Number)
  const parts = []
  const frames = []
  const frame = (phase, line, message) => frames.push({ phase, activeLine: line, parts: parts.map(p => ({ ...p })), message })
  frame('start', L('split the date'), `The date is ${input.date}. Convert the year, month and day separately.`)
  const yearBits = binaryDigits(year)
  parts.push({ label: 'year', decimal: year, binary: yearBits })
  frame('year', L('set year bits'), `${year} is ${yearBits} in binary.`)
  const monthBits = binaryDigits(month)
  parts.push({ label: 'month', decimal: month, binary: monthBits })
  frame('month', L('set month bits'), `${month} is ${monthBits} in binary, without a leading zero.`)
  const dayBits = binaryDigits(day)
  parts.push({ label: 'day', decimal: day, binary: dayBits })
  frame('day', L('set day bits'), `${day} is ${dayBits} in binary.`)
  const result = parts.map(p => p.binary).join('-')
  frame('done', L('return the three'), `The binary date is ${result}.`)
  return { input, result, frames }
}

export const code = `convert a date to binary parts
  split the date into year, month and day
  set year bits to the binary form of year
  set month bits to the binary form of month
  set day bits to the binary form of day
  return the three binary parts joined by dashes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def convert_date_to_binary(date):
    year, month, day = (int(part) for part in date.split('-'))
    return '-'.join(bin(part)[2:] for part in (year, month, day))
`
