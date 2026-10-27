// Days per month for a year that is not a leap year, as in the problem.
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const DATE = /^(\d{2})-(\d{2})$/
const KEYS = ['arriveAlice', 'leaveAlice', 'arriveBob', 'leaveBob']

export function dayNumber(text) {
  const match = DATE.exec(text)
  if (!match) throw new Error(`Dates are MM-DD, got ${text}.`)
  const month = Number(match[1])
  const day = Number(match[2])
  if (month < 1 || month > 12 || day < 1 || day > MONTH_DAYS[month - 1]) throw new Error(`${text} is not a date in a non-leap year.`)
  return MONTH_DAYS.slice(0, month - 1).reduce((sum, d) => sum + d, 0) + day
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with arriveAlice, leaveAlice, arriveBob, and leaveBob.')
  for (const key of KEYS) {
    if (typeof data[key] !== 'string') throw new Error(`${key} is a date string like "08-15".`)
    dayNumber(data[key])
  }
  if (dayNumber(data.arriveAlice) > dayNumber(data.leaveAlice)) throw new Error('Alice must arrive no later than she leaves.')
  if (dayNumber(data.arriveBob) > dayNumber(data.leaveBob)) throw new Error('Bob must arrive no later than he leaves.')
  return Object.fromEntries(KEYS.map(key => [key, data[key]]))
}

export function buildTrace(input) {
  const { arriveAlice, leaveAlice, arriveBob, leaveBob } = input
  const aa = dayNumber(arriveAlice)
  const la = dayNumber(leaveAlice)
  const ab = dayNumber(arriveBob)
  const lb = dayNumber(leaveBob)
  const frames = [{ phase: 'start', activeLine: L('set alice arrival'), days: { aa, la, ab, lb }, latest: null, earliest: null, message: 'Convert each date to its day of the year.' }]
  const latest = Math.max(aa, ab)
  frames.push({ phase: 'arrival', activeLine: L('set latest arrival'), days: { aa, la, ab, lb }, latest, earliest: null, message: `The later arrival is day ${latest}.` })
  const earliest = Math.min(la, lb)
  frames.push({ phase: 'departure', activeLine: L('set earliest departure'), days: { aa, la, ab, lb }, latest, earliest, message: `The earlier departure is day ${earliest}.` })
  const result = Math.max(0, earliest - latest + 1)
  frames.push({ phase: 'done', activeLine: L('return the larger of 0'), days: { aa, la, ab, lb }, latest, earliest, message: `Days together: ${result}.` })
  return { input, result, frames }
}

export const code = `count the days both people are together
  set alice arrival and departure to the day numbers of her dates
  set bob arrival and departure to the day numbers of his dates
  set latest arrival to the larger of the two arrival days
  set earliest departure to the smaller of the two departure days
  return the larger of 0 and earliest departure minus latest arrival plus 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_days_together(arriveAlice, leaveAlice, arriveBob, leaveBob):
    month_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    def day_number(text):
        month, day = int(text[:2]), int(text[3:5])
        return sum(month_days[:month - 1]) + day

    latest_arrival = max(day_number(arriveAlice), day_number(arriveBob))
    earliest_departure = min(day_number(leaveAlice), day_number(leaveBob))
    return max(0, earliest_departure - latest_arrival + 1)
`
