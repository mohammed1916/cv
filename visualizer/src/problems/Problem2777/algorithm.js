const DAY = 86400000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.start !== 'string' || typeof input.end !== 'string' || !Number.isInteger(input.step)) {
    throw new Error('Use {"start":"YYYY-MM-DD","end":"YYYY-MM-DD","step":days}.')
  }
  const pattern = /^\d{4}-\d{2}-\d{2}$/
  if (!pattern.test(input.start) || !pattern.test(input.end) || Number.isNaN(Date.parse(input.start)) || Number.isNaN(Date.parse(input.end))) throw new Error('Dates use the form YYYY-MM-DD.')
  if (input.step < 1 || input.step > 31) throw new Error('step is a whole number of days from 1 to 31.')
  const span = (Date.parse(input.end) - Date.parse(input.start)) / DAY
  if (span > 370) throw new Error('Keep the range within about a year for this visualization.')
  return { start: input.start, end: input.end, step: input.step }
}

export const code = `function* dateRangeGenerator(start, end, step)
  current <- the date start, as UTC midnight
  last <- the date end, as UTC midnight
  while current is at most last
    yield current as YYYY-MM-DD
    current <- current plus step days`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `from datetime import date, timedelta

def date_range_generator(start, end, step):
    current = date.fromisoformat(start)
    last = date.fromisoformat(end)
    while current <= last:
        yield current.isoformat()
        current += timedelta(days=step)
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

const iso = ms => new Date(ms).toISOString().slice(0, 10)

// Each frame is one next() call: it yields the current date, then advances by step days.
export function buildTrace({ start, end, step }) {
  const frames = []
  const values = []
  let current = Date.parse(start)
  const last = Date.parse(end)
  frames.push({ phase: 'start', activeLine: CL('current <- the date start'), pythonLine: PL('current = date.fromisoformat(start)'), current: iso(current), last: iso(last), values: [], message: `Start at ${iso(current)} and stop after ${iso(last)}.` })
  while (current <= last) {
    values.push(iso(current))
    frames.push({ phase: 'yield', activeLine: CL('yield current'), pythonLine: PL('yield current.isoformat()'), current: iso(current), last: iso(last), values: [...values], message: `${iso(current)} is not after ${iso(last)}, so it is yielded.` })
    current += step * DAY
    frames.push({ phase: 'advance', activeLine: CL('current <- current plus'), pythonLine: PL('current += timedelta'), current: iso(current), last: iso(last), values: [...values], message: `Advance ${step} day${step === 1 ? '' : 's'} to ${iso(current)}.` })
  }
  frames.push({ phase: 'done', activeLine: CL('while current is at most'), pythonLine: PL('while current <= last'), current: iso(current), last: iso(last), values: [...values], result: [...values], message: `${iso(current)} is after ${iso(last)}, so the generator finishes.` })
  return { input: { start, end, step }, result: [...values], frames }
}
