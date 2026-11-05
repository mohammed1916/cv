export const phases = [
  { id: 'start', label: 'Start', description: 'Read the clock time as hours and minutes.' },
  { id: 'hour', label: 'Hour hand', description: 'The hour hand moves 30 degrees per hour and also 0.5 degrees per minute.' },
  { id: 'minute', label: 'Minute hand', description: 'The minute hand moves 6 degrees per minute.' },
  { id: 'gap', label: 'Gap', description: 'The gap is the difference between the two hands, measured the short way round the dial.' },
  { id: 'done', label: 'Complete', description: 'Return the smaller angle between the hands.' },
]

export const examples = [
  { label: 'Three o clock', input: '3:00' },
  { label: 'Afternoon', input: '4:50' },
  { label: 'Twelve thirty', input: '12:30' },
]

export function parseInput(text) {
  const m = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(String(text))
  if (!m) throw new Error('Enter a time as h:mm, such as 3:15.')
  const hour = Number(m[1]), minute = Number(m[2])
  if (hour < 1 || hour > 12) throw new Error('The hour must be from 1 to 12.')
  if (minute < 0 || minute > 59) throw new Error('The minutes must be from 00 to 59.')
  return { hour, minute }
}

export function buildTrace({ hour, minute }) {
  const hourHand = (hour % 12) * 30 + minute * 0.5
  const minuteHand = minute * 6
  const direct = Math.abs(hourHand - minuteHand)
  const angle = Math.min(direct, 360 - direct)
  const snap = (extra = {}) => ({ hour, minute, hourHand, minuteHand, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const hourHand'), pythonLine: P('hour_hand ='), snapshot: snap(),
    message: `The time is ${hour}:${String(minute).padStart(2, '0')}.` }]
  frames.push({ phase: 'hour', activeLine: L('const hourHand'), pythonLine: P('hour_hand ='), snapshot: snap(),
    message: `The hour hand sits at ${hourHand} degrees from twelve.` })
  frames.push({ phase: 'minute', activeLine: L('const minuteHand'), pythonLine: P('minute_hand ='), snapshot: snap(),
    message: `The minute hand sits at ${minuteHand} degrees.` })
  frames.push({ phase: 'gap', activeLine: L('const direct'), pythonLine: P('direct ='), snapshot: snap({ direct }),
    message: `The direct gap is ${direct} degrees; the other way round is ${360 - direct}.` })
  frames.push({ phase: 'done', activeLine: L('return Math.min'), pythonLine: P('return angle'), snapshot: snap({ angle, result: angle }),
    message: `Return the smaller angle, ${angle} degrees.`, result: angle })
  return { input: { hour, minute }, result: angle, frames }
}

export const code = `function angleClock(hour, minutes) {
  const hourHand = (hour % 12) * 30 + minutes * 0.5
  const minuteHand = minutes * 6
  const direct = Math.abs(hourHand - minuteHand)
  return Math.min(direct, 360 - direct)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def angle_clock(hour, minutes):
    hour_hand = (hour % 12) * 30 + minutes * 0.5
    minute_hand = minutes * 6
    direct = abs(hour_hand - minute_hand)
    return min(direct, 360 - direct)
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
