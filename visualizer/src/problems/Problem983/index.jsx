import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases, MAX_DAY } from './algorithm'

const definition = {
  number: '983',
  title: 'Minimum Cost For Tickets',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: `Object with days (increasing whole days from 1 to ${MAX_DAY}) and costs: one-day, seven-day and thirty-day prices`,
  url: 'https://leetcode.com/problems/minimum-cost-for-tickets/',
  complexity: 'O(D) time for D days in the calendar, with O(D) space for the running costs.',
  examples: [
    { label: 'Scattered trips', input: JSON.stringify({ days: [2, 5, 9, 18, 19, 30], costs: [3, 10, 25] }) },
    { label: 'A short burst', input: JSON.stringify({ days: [1, 2, 3, 4, 5, 6, 7, 8], costs: [2, 7, 15] }) },
    { label: 'One long trip', input: JSON.stringify({ days: [4, 11, 25], costs: [4, 9, 20] }) },
    { label: 'Single travel day', input: '{"days":[1],"costs":[2,7,15]}' },
    { label: 'Equal pass prices', input: '{"days":[1,8],"costs":[7,7,7]}' },
    { label: 'Last day with high prices', input: '{"days":[60],"costs":[100,100,100]}' },
    { label: 'Long run: 20 travel days', input: '{"days":[4,5,7,9,12,13,15,16,19,23,27,29,31,33,34,48,55,56,57,58],"costs":[3,11,25]}' },
  ],
}

const OPTION_NAMES = ['one-day pass', 'seven-day pass', 'thirty-day pass']

export default function Problem983() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const travel = new Set(run.input.days)
    const last = run.input.days[run.input.days.length - 1]
    return <section aria-label="Calendar with the cheapest cost so far" style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {Array.from({ length: last }, (_, index) => index + 1).map(day => {
          const reached = day <= step.day
          const isCurrent = day === step.day
          return <div key={day} data-day={day} data-travel={travel.has(day)} style={{
            width: 46, minHeight: 56, borderRadius: 6, padding: 4, textAlign: 'center', color: 'var(--text)',
            border: `2px solid ${isCurrent ? 'var(--primary)' : 'var(--border)'}`,
            background: travel.has(day) ? 'var(--primary-glow)' : 'var(--surface)',
            opacity: reached ? 1 : 0.5,
          }}>
            <small style={{ display: 'block', color: 'var(--text-muted)' }}>day {day}</small>
            <strong>{reached ? step.best[day] : ''}</strong>
            <small style={{ display: 'block', color: 'var(--text-muted)' }}>{travel.has(day) ? 'travel' : ''}</small>
          </div>
        })}
      </div>
      {step.options && <p style={{ margin: 0, color: 'var(--text)' }}>
        Options on day {step.day}: {OPTION_NAMES.map((name, i) => `${name} ${step.options[i]}`).join(' · ')}.
      </p>}
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>Shaded days are travel days. The number in each day is the cheapest cost so far.</p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
