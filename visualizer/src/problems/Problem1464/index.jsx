import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1464',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Values as a JSON array',
  url: 'https://leetcode.com/problems/maximum-product-of-two-elements-in-an-array/',
  complexity: 'O(n) time and O(1) extra space: one pass keeps the two largest values.',
  examples: [
    { label: 'Sample', input: '[3,4,5,2]' },
    { label: 'Tie', input: '[1,5,4,5]' },
    { label: 'Pair', input: '[7,7]' },
  ],
}

export default function MaximumProductOfTwoElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const s = step.snapshot
    return <>
      <div role="img" aria-label="Input values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((v, i) => <div key={i} style={{
          minWidth: 44, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === s.index ? 2 : 1}px solid ${i === s.index ? 'var(--text)' : 'var(--border)'}`,
          background: i === s.largestAt ? '#bbf7d0' : i === s.runnerAt ? '#fde68a' : 'transparent', color: '#1c1917',
        }}><div>{v}</div><small>{i}</small></div>)}
      </div>
      <table aria-label="Two largest values" style={{ fontFamily: 'monospace', borderCollapse: 'collapse', marginTop: 12 }}>
        <tbody>
          <tr><th>largest</th><td>{s.largest}</td></tr>
          <tr><th>runner-up</th><td>{s.runner}</td></tr>
        </tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two values only:</strong> the best product uses the two largest values, so no sorting is needed.</p>
    <p><strong>Ties:</strong> equal values at different positions can both be the top two, which the runner-up slot handles.</p>
  </>} />
}
