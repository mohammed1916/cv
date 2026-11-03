import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Tally how often each value appears.' },
    { id: 'size', label: 'Groups', description: 'Work out how many groups of k there are.' },
    { id: 'check', label: 'Check', description: 'Each value must fit once per group.' },
    { id: 'fail', label: 'Fail', description: 'One value is too frequent.' },
    { id: 'done', label: 'Result', description: 'Report whether a partition exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k',
  url: 'https://leetcode.com/problems/partition-array-into-k-distinct-groups/',
  complexity: 'O(n) time and O(n) space for the counts.',
  examples: [
    { label: 'Example', input: '{"nums":[4,1,4,3],"k":2}' },
    { label: 'Too many copies', input: '{"nums":[2,2,2,1],"k":2}' },
  ],
}

export default function PartitionKDistinct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ul aria-label="Value counts" style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
      {[...new Set(run.input.nums)].map(v => {
        const count = run.input.nums.filter(x => x === v).length
        const current = step.value === v
        return <li key={v} data-current={current || undefined} style={{ padding: '0.4rem 0.7rem', borderRadius: 6, border: `2px solid ${current ? '#7c3aed' : 'transparent'}` }}>
          {`${v} x${count}`}
        </li>
      })}
    </ul>
    <output aria-label="Group size check">{`groups of ${run.input.k}: ${step.count || 'not computed'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every group must hold k different values, so a value can appear at most once per group.</p>
    <p>With n / k groups, a value that appears more often than that cannot be spread out. Checking counts is enough.</p>
  </>} />
}
