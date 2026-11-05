import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python, inputLabel, complexity, examples } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const yesNo = value => (value === undefined || value === null ? '-' : value ? 'yes' : 'no')

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel,
  url: 'https://leetcode.com/problems/number-of-days-in-a-month/',
  complexity,
  examples,
}

export default function DaysInMonth() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const s = step.snapshot
      const checks = s.leapChecks
      return <div style={{ display: 'grid', gap: 12 }}>
        <Sequence label="Month names (pointer on the chosen month)" values={MONTHS} pointers={{ month: s.month - 1 }} />
        <Vars vars={{ year: s.year, month: s.month, 'days in month': s.days }} />
        {checks && <dl className="seq-vars">
          <div><dt>divisible by 4</dt><dd>{yesNo(checks.div4)}</dd></div>
          <div><dt>divisible by 100</dt><dd>{yesNo(checks.div100)}</dd></div>
          <div><dt>divisible by 400</dt><dd>{yesNo(checks.div400)}</dd></div>
          <div><dt>leap year</dt><dd>{yesNo(checks.leap)}</dd></div>
        </dl>}
        <output aria-label="Result">{step.message}</output>
      </div>
    }}
    renderReasoning={() => <p>Most months have a fixed length. Only February changes, and the leap rule decides between 28 and 29 days.</p>} />
}
