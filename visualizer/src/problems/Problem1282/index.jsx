import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1282',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of group sizes (JSON)',
  url: 'https://leetcode.com/problems/group-the-people-given-the-group-size-they-belong-to/',
  complexity: 'O(n) time and O(n) space: each person is placed once into a bucket keyed by size.',
  examples: [
    { label: 'Mixed sizes', input: '[1,3,2,2,3,3,1]' },
    { label: 'Two full blocks', input: '[4,4,4,4,2,2]' },
    { label: 'Single person', input: '[1]' },
    { label: 'Equal sizes', input: '[3,3,3]' },
    { label: 'One block of thirty', input: '[30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]' },
    { label: 'Long run: 30 people', input: '[1,1,2,2,2,2,3,3,3,3,3,3,3,3,3,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6]' },
  ],
}

export default function GroupThePeople() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { person, size, buckets, groups, emitted } = step.snapshot
    return <>
      <div role="img" aria-label="People with required group sizes" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.map((s, i) => <div key={i} data-index={i} style={{
          minWidth: 56, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === person ? 2 : 1}px solid ${i === person ? 'var(--text)' : 'var(--border)'}`,
          background: 'var(--surface2)', color: 'var(--text)', borderBottom: groups.some(g => g.includes(i)) ? '3px solid var(--success)' : undefined,
        }}><div>person {i}{i === person ? ' (pointer)' : ''}</div><small>size {s}</small></div>)}
      </div>
      <p>{size === null ? 'No person is being placed.' : `Placing person ${person} into size ${size}${emitted ? ' (group emitted)' : ''}.`}</p>
      <table aria-label="Open buckets" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>size</th><th>members so far</th></tr></thead>
        <tbody>{buckets.length === 0 ? <tr><td colSpan={2}>no open buckets</td></tr> : buckets.map(b => <tr key={b.size}><td>{b.size}</td><td>[{b.members.join(', ')}]</td></tr>)}</tbody>
      </table>
      <p>Finished groups: {groups.length === 0 ? 'none yet' : groups.map(g => `[${g.join(', ')}]`).join(' ')}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Bucket by size:</strong> the first person of a size opens a bucket; each later person of that size joins it.</p>
    <p><strong>Emit when full:</strong> a bucket with exactly its size members is a complete group, so it is recorded and cleared for the next group of that size.</p>
  </>} />
}
