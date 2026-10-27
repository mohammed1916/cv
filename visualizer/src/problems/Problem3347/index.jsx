import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Candidates', description: 'List the target values within k of some number.' },
    { id: 'candidate', label: 'Target', description: 'Count equal and nearby numbers for this target.' },
    { id: 'done', label: 'Complete', description: 'Report the best frequency.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: nums (1-30 each), k (0-10) and numOperations',
  url: 'https://leetcode.com/problems/maximum-frequency-of-an-element-after-performing-operations-ii/',
  complexity: 'O(c * n) time for c candidate targets. The visualization caps input at 10 numbers; the same counting idea with sorted arrays and binary search scales further.',
  examples: [
    { label: 'Example', input: '{"nums":[1,4,5],"k":1,"numOperations":2}' },
    { label: 'Equal values', input: '{"nums":[2,2,9,9,9],"k":3,"numOperations":0}' },
  ],
}

export default function MaxFrequencyAfterOperationsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Candidate targets">
      <thead><tr><th>Target</th><th>Equal</th><th>Within k</th><th>Frequency</th></tr></thead>
      <tbody>{run.candidates.map(v => <tr key={v} data-role={step.value === v ? 'active' : undefined}>
        <td>{v}</td><td>{step.value === v ? step.eq : '-'}</td><td>{step.value === v ? step.near : '-'}</td><td>{step.value === v ? step.freq : '-'}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Best frequency">{`Best so far: ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>For a target v, numbers equal to v cost nothing, and up to numOperations of the other numbers within k can be moved onto v.</p>
  </>} />
}
