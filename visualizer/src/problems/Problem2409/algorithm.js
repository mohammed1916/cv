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

const CODE = [
  'function countDaysTogether(arriveAlice, leaveAlice, arriveBob, leaveBob) {',
  '  const aliceArrive = dayNumber(arriveAlice)',
  '  const aliceLeave = dayNumber(leaveAlice)',
  '  const bobArrive = dayNumber(arriveBob)',
  '  const bobLeave = dayNumber(leaveBob)',
  '  const latestArrival = Math.max(aliceArrive, bobArrive)',
  '  const earliestDeparture = Math.min(aliceLeave, bobLeave)',
  '  return Math.max(0, earliestDeparture - latestArrival + 1)',
  '}',
]

const PY = [
  'def count_days_together(arriveAlice, leaveAlice, arriveBob, leaveBob):',
  '    month_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]',
  '',
  '    def day_number(text):',
  '        month, day = int(text[:2]), int(text[3:5])',
  '        return sum(month_days[:month - 1]) + day',
  '',
  '    alice_arrive = day_number(arriveAlice)',
  '    alice_leave = day_number(leaveAlice)',
  '    bob_arrive = day_number(arriveBob)',
  '    bob_leave = day_number(leaveBob)',
  '    latest_arrival = max(alice_arrive, bob_arrive)',
  '    earliest_departure = min(alice_leave, bob_leave)',
  '    return max(0, earliest_departure - latest_arrival + 1)',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text.trim()))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export function buildTrace(input) {
  const { arriveAlice, leaveAlice, arriveBob, leaveBob } = input
  const aa = dayNumber(arriveAlice)
  const la = dayNumber(leaveAlice)
  const ab = dayNumber(arriveBob)
  const lb = dayNumber(leaveBob)
  const frames = [{ phase: 'start', pythonLine: pyLine('alice_arrive = day_number(arriveAlice)'), activeLine: codeLine('const aliceArrive = dayNumber(arriveAlice)'), days: { aa, la, ab, lb }, latest: null, earliest: null, message: 'Convert each date to its day of the year.' }]
  const latest = Math.max(aa, ab)
  frames.push({ phase: 'arrival', pythonLine: pyLine('latest_arrival = max'), activeLine: codeLine('const latestArrival = Math.max(aliceArrive, bobArrive)'), days: { aa, la, ab, lb }, latest, earliest: null, message: `The later arrival is day ${latest}.` })
  const earliest = Math.min(la, lb)
  frames.push({ phase: 'departure', pythonLine: pyLine('earliest_departure = min'), activeLine: codeLine('const earliestDeparture = Math.min(aliceLeave, bobLeave)'), days: { aa, la, ab, lb }, latest, earliest, message: `The earlier departure is day ${earliest}.` })
  const result = Math.max(0, earliest - latest + 1)
  frames.push({ phase: 'done', pythonLine: pyLine('return max(0'), activeLine: codeLine('return Math.max(0, earliestDeparture - latestArrival + 1)'), days: { aa, la, ab, lb }, latest, earliest, message: `Days together: ${result}.` })
  return { input, result, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
