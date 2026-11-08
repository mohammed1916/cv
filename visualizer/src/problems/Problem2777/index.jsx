import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the first date, the last date and the step.' },
    { id: 'yield', label: 'Yield', description: 'The current date is not after the end, so it is yielded.' },
    { id: 'advance', label: 'Advance', description: 'Move forward by step days.' },
    { id: 'done', label: 'Finished', description: 'The next date is after the end; the generator stops.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"start": "2024-02-27", "end": "2024-03-02", "step": 2}',
  url: 'https://leetcode.com/problems/date-range-generator/',
  complexity: 'O(days / step) yields. Each next() call does constant work.',
  examples: [
    { label: 'Summer days', input: '{"start":"2023-07-28","end":"2023-08-06","step":4}' },
    { label: 'Leap day', input: '{"start":"2024-02-27","end":"2024-03-02","step":2}' },
    { label: 'Single day range', input: '{"start":"2025-01-01","end":"2025-01-01","step":1}' },
    { label: 'Step of 31 days across a month end', input: '{"start":"2026-02-28","end":"2026-03-01","step":31}' },
    { label: 'Long run: one year, step 31', input: '{"start":"2025-12-25","end":"2026-12-25","step":31}' },
  ],
}

// A calendar strip of every day from start to end: yielded days are filled, the current day is outlined.
function Strip({ run, step }) {
  const days = []
  const startMs = Date.parse(run.input.start), endMs = Date.parse(run.input.end)
  for (let t = startMs; t <= endMs; t += 86400000) days.push(new Date(t).toISOString().slice(0, 10))
  const yielded = new Set(step.values)
  return <section aria-label="Calendar days in the range" style={{ marginBottom: 12 }}>
    <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0 }}>
      {days.map(d => <li key={d} style={{
        padding: '6px 8px', borderRadius: 6, minWidth: 92, textAlign: 'center', color: 'var(--text)',
        background: yielded.has(d) ? 'var(--primary)' : 'var(--surface2)',
        outline: d === step.current ? '2px solid var(--text)' : 'none',
      }}>{d}</li>)}
    </ol>
    <p style={{ color: 'var(--text)' }}>{`Current ${step.current}; last allowed ${step.last}. Filled days are yielded.`}</p>
  </section>
}

export default function DateRangeGenerator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Strip run={run} step={step} />
    <output aria-label="Yielded dates">{`Yielded: [${step.values.join(', ')}]`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The generator keeps one current date. Each yield prints it, then the date moves forward by the step. The range is inclusive, so a date equal to the end is still yielded.</p>
  </>} />
}
