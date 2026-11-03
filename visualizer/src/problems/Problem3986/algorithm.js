export const code = `the number of seconds from a start clock time to a later end time on the same day
  set start seconds to hours times 3600 plus minutes times 60 plus seconds
  set end seconds to hours times 3600 plus minutes times 60 plus seconds
  set elapsed to end seconds minus start seconds
  return elapsed`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def elapsed_seconds(start, end):
    def to_seconds(clock):
        hours, minutes, seconds = (int(part) for part in clock.split(":"))
        return hours * 3600 + minutes * 60 + seconds
    start_seconds = to_seconds(start)
    end_seconds = to_seconds(end)
    elapsed = end_seconds - start_seconds
    return elapsed
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

const CLOCK = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/

function clockParts(clock) {
  const match = CLOCK.exec(clock)
  if (!match) throw new Error('Times use the HH:MM:SS 24-hour format.')
  const [hours, minutes, seconds] = match.slice(1).map(Number)
  return { hours, minutes, seconds, total: hours * 3600 + minutes * 60 + seconds }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.start !== 'string' || typeof input.end !== 'string') throw new Error('Use an object with start and end strings.')
  const a = clockParts(input.start)
  const b = clockParts(input.end)
  if (b.total < a.total) throw new Error('End must not be earlier than start on the same day.')
  return { start: input.start, end: input.end }
}

export function buildTrace({ start, end }) {
  const a = clockParts(start)
  const b = clockParts(end)
  const frames = []
  frames.push({ pythonLine: P('start_seconds = to_seconds'), phase: 'start', activeLine: L('set start seconds'), a, b: null, elapsed: null, at: 'start', message: `Start ${start} is ${a.total} seconds after midnight.` })
  frames.push({ pythonLine: P('end_seconds = to_seconds'), phase: 'end', activeLine: L('set end seconds'), a, b, elapsed: null, at: 'end', message: `End ${end} is ${b.total} seconds after midnight.` })
  const elapsed = b.total - a.total
  frames.push({ pythonLine: P('elapsed = end_seconds'), phase: 'difference', activeLine: L('set elapsed to end seconds'), a, b, elapsed, at: 'diff', message: `${b.total} minus ${a.total} leaves ${elapsed} seconds.` })
  frames.push({ pythonLine: P('return elapsed'), phase: 'done', activeLine: L('return elapsed'), a, b, elapsed, at: 'done', message: `${elapsed} seconds elapsed.` })
  return { input: { start, end }, result: elapsed, frames }
}
