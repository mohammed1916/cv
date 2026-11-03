import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const DAY = 86400000
const code = `dates from start to end moving by step days
  check step is a non zero whole number
  day = start as a day count
  while day has not passed end in the step direction
    yield the date for day
    day = day + step`
const python = `def date_range(start, end, step):
    if step == 0:
        raise ValueError("step must be non-zero")
    day, last = start, end
    while (step > 0 and day <= last) or (step < 0 and day >= last):
        yield day
        day += step`

function toDay(text) {
  const time = Date.parse(`${text}T00:00:00Z`)
  if (Number.isNaN(time)) throw new Error('Dates use the form YYYY-MM-DD.')
  return time / DAY
}
const toText = day => new Date(day * DAY).toISOString().slice(0, 10)

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.start !== 'string' || typeof input.end !== 'string' || !Number.isInteger(input.step)) {
    throw new Error('Use an object with start, end (YYYY-MM-DD) and an integer step.')
  }
  if (input.step === 0) throw new Error('step must be non-zero.')
  return input
}

function buildTrace({ start, end, step }) {
  const frames = [{ phase: 'start', activeLine: 1, message: `Walk from ${start} to ${end} by ${step} day(s).`, at: -1, out: [] }]
  const out = []
  const last = toDay(end)
  for (let day = toDay(start); step > 0 ? day <= last : day >= last; day += step) {
    out.push(toText(day))
    frames.push({ phase: 'step', activeLine: 5, message: `Yield ${toText(day)}.`, at: out.length - 1, out: [...out] })
  }
  frames.push({ phase: 'done', activeLine: 5, message: `${out.length} date(s) yielded.`, at: -1, out: [...out] })
  return { frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the bounds and the step.' },
    { id: 'step', label: 'Yield', description: 'Emit the current date, then move by step.' },
    { id: 'done', label: 'Finished', description: 'The walk has passed the end date.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with start, end and an integer step',
  url: 'https://leetcode.com/problems/date-range-generator/',
  complexity: 'O(number of dates) time. Each date costs constant work.',
  examples: [
    { label: 'Forward', input: '{"start":"2024-01-30","end":"2024-02-02","step":1}' },
    { label: 'Backward', input: '{"start":"2024-03-02","end":"2024-02-27","step":-2}' },
  ],
}

export default function DateRangeGenerator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Yielded dates" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
    <output aria-label="Range summary">{`Yielded so far: ${step.out.length}`}</output>
  </>} renderReasoning={() => <>
    <p>The generator never builds the whole list first. It keeps one day count, yields it as a date, and adds the step.</p>
    <p>Working with whole days avoids month-length bugs: adding one to a day count is the same as moving to the next calendar day.</p>
  </>} />
}
