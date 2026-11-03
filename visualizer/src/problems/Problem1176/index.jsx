import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with values, window, low and high (JSON)',
  url: 'https://leetcode.com/problems/diet-plan-performance/',
  complexity: 'O(n) time: each window total is one addition and one subtraction from the previous window. O(n) extra space for the list of window totals in this view.',
  examples: [
    { label: 'Short', input: '{"values":[1,2,3,4,5],"window":2,"low":4,"high":7}' },
    { label: 'Mixed', input: '{"values":[6,1,2,7,4,5,3],"window":3,"low":9,"high":12}' },
    { label: 'All low', input: '{"values":[0,0,0,0],"window":2,"low":1,"high":5}' },
  ],
}

export default function DietPlanPerformance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { values, window, start, total, score, sums } = step.snapshot
    return <>
      <div role="img" aria-label="Values" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {values.map((value, i) => {
          const inside = start !== null && i >= start && i < start + window
          return <div key={i} data-index={i} style={{
            width: 40, height: 40, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: 'monospace',
            border: inside ? '2px solid var(--text)' : '1px solid var(--border)',
            background: inside ? '#a5f3fc' : 'transparent',
          }}>{value}</div>
        })}
      </div>
      <output aria-label="Window totals">{`Totals so far: [${sums.join(', ')}] · current window: ${total ?? '-'} · score: ${score}`}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Slide, do not re-add:</strong> moving the window changes its total by the value entering on the right minus the value leaving on the left.</p>
    <p><strong>Score:</strong> a total above the upper limit adds 1, a total below the lower limit subtracts 1, and anything in between changes nothing.</p>
  </>} />
}
