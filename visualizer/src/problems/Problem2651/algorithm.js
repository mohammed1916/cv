export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with arrivalTime and delayedTime.')
  const { arrivalTime, delayedTime } = input
  if (!Number.isInteger(arrivalTime) || arrivalTime < 1 || arrivalTime > 23) throw new Error('arrivalTime is an integer from 1 to 23.')
  if (!Number.isInteger(delayedTime) || delayedTime < 1 || delayedTime > 24) throw new Error('delayedTime is an integer from 1 to 24.')
  return { arrivalTime, delayedTime }
}

export function buildTrace({ arrivalTime, delayedTime }) {
  const frames = []
  frames.push({ pythonLine: 1, phase: 'start', activeLine: L('add the delay'), total: null, message: `Arrival at hour ${arrivalTime}, delayed by ${delayedTime} hours.` })
  const total = arrivalTime + delayedTime
  frames.push({ pythonLine: 2, phase: 'sum', activeLine: L('add the delay'), total, message: `${arrivalTime} + ${delayedTime} = ${total} before wrapping.` })
  const result = total % 24
  frames.push({ pythonLine: 3, phase: 'wrap', activeLine: L('wrap past midnight'), total: result, message: result === total ? `${total} is still within the day.` : `${total} wraps past midnight to ${result}.` })
  frames.push({ pythonLine: 3, phase: 'done', activeLine: L('wrap past midnight'), total: result, message: `The train reaches the station at hour ${result}.` })
  return { input: { arrivalTime, delayedTime }, result, frames }
}

export const code = `delayed arrival time for a train
  add the delay to the arrival hour
  wrap past midnight back into the 24-hour clock
  return the wrapped hour`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def calculate_delayed_arrival_time(arrival_time, delayed_time):
    total = arrival_time + delayed_time
    return total % 24
`
