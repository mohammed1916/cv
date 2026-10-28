const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with login_time and logout_time.')
  for (const name of ['login_time', 'logout_time']) {
    if (typeof input[name] !== 'string' || !HHMM.test(input[name])) throw new Error(`${name} must be a 24-hour time such as "09:31".`)
  }
  return { login_time: input.login_time, logout_time: input.logout_time }
}

const toMinutes = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
const clock = m => {
  const x = ((m % 1440) + 1440) % 1440
  return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`
}

export function buildTrace({ login_time, logout_time }) {
  const start = toMinutes(login_time)
  let end = toMinutes(logout_time)
  if (end < start) end += 1440
  const frames = [{ phase: 'start', activeLine: L('convert both times'), slot: null, slots: [], message: `Play from ${login_time} to ${logout_time}.` }]
  const slots = []
  let round = Math.ceil(start / 15) * 15
  while (round + 15 <= end) {
    const slot = (round % 1440) / 15
    slots.push(slot)
    frames.push({ phase: 'round', activeLine: L('add one round'), slot, slots: slots.slice(), message: `The round from ${clock(round)} to ${clock(round + 15)} is complete.` })
    round += 15
  }
  const result = slots.length
  frames.push({ phase: 'done', activeLine: L('return the count'), slot: null, slots: slots.slice(), message: `${result} full rounds were completed.` })
  return { input: { login_time, logout_time }, result, slots, frames }
}

export const code = `count the full 15-minute rounds played between login and logout
convert both times to minutes from midnight
if logout is earlier than login then add one day to logout
set round to the first multiple of 15 at or after login
while round plus 15 is at most logout do
  add one round
  move round forward by 15 minutes
return the count of rounds`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_full_rounds(login_time, logout_time):
    start = int(login_time[:2]) * 60 + int(login_time[3:])
    end = int(logout_time[:2]) * 60 + int(logout_time[3:])
    if end < start:
        end += 24 * 60
    count = 0
    round_start = -(-start // 15) * 15
    while round_start + 15 <= end:
        count += 1
        round_start += 15
    return count
`
