import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const yesNo = value => (value ? 'yes' : 'no')

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Year and month (JSON object)',
  url: 'https://leetcode.com/problems/number-of-days-in-a-month/',
  complexity: 'O(1) time and O(1) space.',
  examples: [
    { label: 'Ordinary February', input: '{"year":2023,"month":2}' },
    { label: 'Leap year', input: '{"year":2024,"month":2}' },
    { label: 'Century exception', input: '{"year":1900,"month":2}' },
    { label: 'Divisible by 400', input: '{"year":2000,"month":2}' },
    { label: 'Thirty days', input: '{"year":2026,"month":4}' },
  ],
}

export default function DaysInMonth() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const s = step.snapshot
      return <div style={{ display: 'grid', gap: 12 }}>
        <div aria-label="Months" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {MONTHS.map((name, i) => <span key={name} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid currentColor', opacity: i + 1 === s.month ? 1 : 0.45, fontWeight: i + 1 === s.month ? 700 : 400 }}>{name}</span>)}
        </div>
        <p><strong style={{ fontSize: 28 }}>{s.days ?? '?'}</strong> days in {MONTHS[s.month - 1]} {s.year}</p>
        {s.leapChecks && <ul>
          <li>Divisible by 4: {yesNo(s.leapChecks.div4)}</li>
          <li>Century year: {yesNo(s.leapChecks.div100)}</li>
          <li>Divisible by 400: {yesNo(s.leapChecks.div400)}</li>
          <li>Leap year: {yesNo(s.leapChecks.leap)}</li>
        </ul>}
      </div>
    }}
    renderReasoning={({ step }) => <p>{step.snapshot.leapChecks
      ? 'February is the only month whose length depends on the year. A century year counts as a leap year only when it is divisible by 400.'
      : 'Months other than February have fixed lengths, so only the month number is needed.'}</p>} />
}
