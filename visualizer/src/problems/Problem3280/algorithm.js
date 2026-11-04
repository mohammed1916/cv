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
  const frame = (phase, line, message, pythonLine) => frames.push({ phase, pythonLine: PY(pythonLine), activeLine: line, parts: parts.map(p => ({ ...p })), message })
  frame('start', L("const [year, month, day]"), `The date is ${input.date}. Convert the year, month and day separately.`, 'year, month, day')
  const yearBits = binaryDigits(year)
  parts.push({ label: 'year', decimal: year, binary: yearBits })
  frame('year', L('const yearBits'), `${year} is ${yearBits} in binary.`, 'year, month, day')
  const monthBits = binaryDigits(month)
  parts.push({ label: 'month', decimal: month, binary: monthBits })
  frame('month', L('const monthBits'), `${month} is ${monthBits} in binary, without a leading zero.`, 'year, month, day')
  const dayBits = binaryDigits(day)
  parts.push({ label: 'day', decimal: day, binary: dayBits })
  frame('day', L('const dayBits'), `${day} is ${dayBits} in binary.`, 'year, month, day')
  const result = parts.map(p => p.binary).join('-')
  frame('done', L('return [yearBits'), `The binary date is ${result}.`, 'return')
  return { input, result, frames }
}

// Code panel: real JavaScript. Python below mirrors it line for line.
export const code = [
  "function convertDateToBinary(date) {",
  "  const [year, month, day] = date.split('-').map(Number);",
  "  const yearBits = year.toString(2);",
  "  const monthBits = month.toString(2);",
  "  const dayBits = day.toString(2);",
  "  return [yearBits, monthBits, dayBits].join('-');",
  "}",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export const python = `def convert_date_to_binary(date):
    year, month, day = (int(part) for part in date.split('-'))
    return '-'.join(bin(part)[2:] for part in (year, month, day))
`
