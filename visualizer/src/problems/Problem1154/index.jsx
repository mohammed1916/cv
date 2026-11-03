import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function YearStrip({ snapshot }) {
  return <div>
    <p>{snapshot.leap ? 'Leap year' : 'Common year'} · running total <strong>{snapshot.total}</strong> of day {snapshot.day} in month {snapshot.month}</p>
    <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, padding: 0, listStyle: 'none' }}>
      {snapshot.lengths.map((length, index) => {
        const month = index + 1
        const counted = snapshot.counted.includes(month)
        const focused = snapshot.focus === month
        return <li key={month} style={{ border: '1px solid currentColor', borderRadius: 6, padding: 6, opacity: counted || focused || month === snapshot.month ? 1 : 0.45, fontWeight: focused ? 700 : 400 }}>
          {MONTHS[index]} · {length}{counted ? ' ✓' : ''}{month === snapshot.month ? ' (target)' : ''}
        </li>
      })}
    </ol>
  </div>
}

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Date as YYYY-MM-DD',
  complexity: 'O(1) time and space: at most eleven month lengths are added.',
  examples: [
    { label: 'Common year, mid-year', input: '2023-07-04' },
    { label: 'Leap March', input: '2024-03-01' },
    { label: 'Century, no leap day', input: '1900-12-31' },
  ],
}

export default function DayOfYearWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <YearStrip snapshot={step.snapshot} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
