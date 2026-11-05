import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2424',
  phases: [
    { id: 'upload', label: 'Upload', description: 'Mark the video as uploaded, then advance the prefix while the next video is present.' },
    { id: 'longest', label: 'Longest', description: 'Return the stored prefix length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": 4, "ops": [["upload", 3], ["longest"], ["upload", 1], ["longest"]]}',
  url: 'https://leetcode.com/problems/longest-uploaded-prefix/',
  complexity: 'O(1) amortized time per upload, because the prefix pointer only moves right. O(n) space.',
  examples: [
    { label: 'Gap closes', input: '{"n":4,"ops":[["upload",3],["longest"],["upload",1],["longest"],["upload",2],["longest"]]}' },
    { label: 'Early', input: '{"n":3,"ops":[["upload",2],["longest"],["upload",1],["longest"],["upload",3],["longest"]]}' },
  ],
}

export default function LUPrefixVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Uploaded videos">
      <thead><tr>{step.uploaded.map((_, i) => <th key={i} scope="col">{i + 1}</th>)}</tr></thead>
      <tbody><tr>{step.uploaded.map((u, i) => <td key={i} data-role={i + 1 <= step.prefix ? 'prefix' : u ? 'uploaded' : 'missing'}
        style={{ textAlign: 'center', background: i + 1 <= step.prefix ? 'var(--primary)' : u ? 'var(--surface2)' : 'transparent', color: i + 1 <= step.prefix ? 'var(--surface)' : 'var(--text)', border: '1px solid var(--text-muted)' }}>{u ? 'up' : '-'}</td>)}</tr></tbody>
    </table>
    <output aria-label="Longest prefix">{`longest prefix ${step.prefix}`}</output>
    <OperationLog title="Calls" ops={step.log} current={step.log.length - 1} />
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The prefix length only moves forward. When a video arrives, check whether it extends the prefix; if so, keep advancing while the next video is already uploaded.</p>
    <p>Each video is passed over by the pointer at most once, so the total work over all calls stays linear.</p>
  </>} />
}
