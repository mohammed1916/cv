export const phases = [
  { id: 'start', label: 'Start', description: 'Read the clock time as an hour on a 12-hour face and a count of minutes past the hour.' },
  { id: 'hour', label: 'Hour hand', description: 'The hour hand moves 30 degrees per hour and also creeps 0.5 degrees per minute.' },
  { id: 'minute', label: 'Minute hand', description: 'The minute hand moves 6 degrees per minute, starting from twelve.' },
  { id: 'gap', label: 'Gap', description: 'Take the absolute difference. The other way round the dial is 360 minus that difference.' },
  { id: 'done', label: 'Complete', description: 'Return the smaller of the two gaps.' },
]

export function parseInput(text) {
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(text)
  if (!match) throw new Error('Enter a time such as 3:15 (hour then minutes).')
  const hour = Number(match[1])
  const minutes = Number(match[2])
  if (hour < 1 || hour > 12) throw new Error('The hour must be from 1 to 12.')
  if (minutes > 59) throw new Error('The minutes must be from 00 to 59.')
  return { hour, minutes }
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (codeSub, pySub = codeSub) => ({ activeLine: L(codeSub), pythonLine: P(pySub) })

const fmt = v => Number.isInteger(v) ? String(v) : v.toFixed(1)

export function buildTrace({ hour, minutes }) {
  const frames = []
  frames.push({ phase: 'start', ...at('hour_angle ='), message: `Time ${hour}:${String(minutes).padStart(2, '0')}. Measure both hands clockwise from twelve.`, snapshot: { hour, minutes } })

  const hourAngle = (hour % 12) * 30 + minutes * 0.5
  frames.push({ phase: 'hour', ...at('hour_angle =', 'hour_angle ='), message: `Hour hand: ${hour % 12} × 30 + ${minutes} × 0.5 = ${fmt(hourAngle)}°.`, snapshot: { hour, minutes, hourAngle } })

  const minuteAngle = minutes * 6
  frames.push({ phase: 'minute', ...at('minute_angle ='), message: `Minute hand: ${minutes} × 6 = ${fmt(minuteAngle)}°.`, snapshot: { hour, minutes, hourAngle, minuteAngle } })

  const gap = Math.abs(hourAngle - minuteAngle)
  const other = 360 - gap
  frames.push({ phase: 'gap', ...at('gap ='), message: `Difference ${fmt(gap)}°. The other way round the dial is ${fmt(other)}°.`, snapshot: { hour, minutes, hourAngle, minuteAngle, gap, other } })

  const result = Math.min(gap, other)
  frames.push({ phase: 'done', ...at('return min'), message: `The smaller angle between the hands is ${fmt(result)}°.`, snapshot: { hour, minutes, hourAngle, minuteAngle, gap, other, result } })
  return { input: { hour, minutes }, result, frames }
}

export const code = `clock angle (hour, minutes):
  hour_angle = (hour mod 12) * 30 + minutes * 0.5
  minute_angle = minutes * 6
  gap = |hour_angle - minute_angle|
  return min(gap, 360 - gap)`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def clock_angle(hour, minutes):
    hour_angle = (hour % 12) * 30 + minutes * 0.5
    minute_angle = minutes * 6
    gap = abs(hour_angle - minute_angle)
    return min(gap, 360 - gap)
`
