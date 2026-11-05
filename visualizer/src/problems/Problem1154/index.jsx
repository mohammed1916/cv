import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
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
    renderVisual={({ step }) => {
      const s = step.snapshot
      const pointers = { target: s.month - 1 }
      if (s.focus) pointers.month = s.focus - 1
      const marks = Object.fromEntries(s.counted.map(m => [m - 1, 'written']))
      return <div>
        <Sequence label={`Month lengths in a ${s.leap ? 'leap' : 'common'} year (${MONTHS.join(' ')})`} values={s.lengths} pointers={pointers} marks={marks} />
        <Vars vars={{ 'target month': MONTHS[s.month - 1], 'target day': s.day, 'running total': s.total, leap: s.leap ? 'yes' : 'no' }} />
        <output aria-label="Result">{step.message}</output>
      </div>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
