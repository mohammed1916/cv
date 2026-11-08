import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1491',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a salary list (JSON)',
  url: 'https://leetcode.com/problems/average-salary-excluding-the-minimum-and-maximum-salary/',
  complexity: 'O(n) time and O(1) extra space: one pass tracks the total, lowest and highest values.',
  examples: [
    { label: 'Four salaries', input: '{"salary":[4000,3000,1000,2000]}' },
    { label: 'All equal', input: '{"salary":[5000,5000,5000]}' },
    { label: 'Five salaries', input: '{"salary":[8000,1000,9000,4000,6000]}' },
    { label: 'Minimum count', input: '{"salary":[1000,2000,3000]}' },
    { label: 'Repeated salaries', input: '{"salary":[2000,2000,1000,2000]}' },
    { label: 'Salary limits', input: '{"salary":[1000000,1000,1000000,1000]}' },
    { label: 'Long run: 40 salaries', input: '{"salary":[34481,783599,617118,393022,222729,827623,829125,431076,993100,577488,516209,541842,105369,64816,551359,963453,62086,671390,781914,218324,979579,242542,151905,621480,188433,646220,587396,259863,106142,393595,939264,235831,909078,705617,586182,569168,510310,511236,280031,602597]}' },
  ],
}

export default function AverageSalary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { salary } = run.input
    const { index, lowest, highest, total, count } = step.snapshot
    const top = Math.max(...salary)
    return <>
      <div role="img" aria-label="Salary bars" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
        {salary.map((value, i) => <div key={i} data-index={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{
            width: '100%', height: `${(value / top) * 120}px`, boxSizing: 'border-box',
            background: value === lowest && i <= (index ?? -1) ? '#fca5a5' : value === highest && i <= (index ?? -1) ? '#fde68a' : '#7dd3fc',
            border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          }} />
          <small style={{ fontFamily: 'monospace' }}>{value}</small>
        </div>)}
      </div>
      <p>Lowest {lowest}, highest {highest}, running total {total} across {count} salaries.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Track extremes as you go:</strong> the minimum and maximum can be updated in the same pass that builds the total, so no sorting is needed.</p>
    <p><strong>Remove exactly one of each:</strong> subtract one minimum and one maximum from the total, then divide by the count that remains.</p>
  </>} />
}
