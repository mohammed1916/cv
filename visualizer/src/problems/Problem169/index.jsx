import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '169',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/majority-element/',
  complexity: 'O(n) time and O(1) extra space. A second pass would confirm the candidate, but the input promises a majority.',
  examples: [
    { label: 'Clear majority', input: '[5,1,5,5,2,5,5]' },
    { label: 'Narrow majority', input: '[7,7,3,3,7]' },
    { label: 'Negative values', input: '[-4,-4,9,-4]' },
  ],
}

export default function MajorityElement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, index, candidate, count } = step.snapshot
    return <>
      <div role="img" aria-label="Array values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((v, i) => <div key={i} style={{
          minWidth: 44, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: i < index ? 'transparent' : 'var(--surface2)', color: '#1c1917',
        }}><div>{v}</div><small>{i}</small></div>)}
      </div>
      <p>Candidate: {candidate ?? 'none'} · Count: {count}{step.phase === 'done' ? ` · majority is ${run.result}` : ''}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> pair each value of the majority with a different value. The majority cannot be fully cancelled because it outnumbers all others.</p>
    <p><strong>Why one pass:</strong> the candidate changes only when the count drops to 0, so one scan with two variables is enough.</p>
  </>} />
}
