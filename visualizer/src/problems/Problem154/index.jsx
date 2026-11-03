import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '154', phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Rotated sorted array with duplicates (JSON array)',
  url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array-ii/',
  complexity: 'O(log n) expected time, O(n) worst case when duplicates hide the break, and O(1) space.',
  examples: [
    { label: 'Rotated with duplicate', input: '[4,4,6,1,4]' },
    { label: 'Many duplicates', input: '[2,2,2,2,0,2]' },
    { label: 'Not rotated', input: '[1,1,2,3]' },
  ],
}

export default function RotatedMinimumWithDuplicates() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input
    const { lo, hi, mid, result } = step.snapshot
    return <>
      <div role="img" aria-label="Array window" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((value, i) => {
          const role = i === mid ? 'mid' : i === lo ? 'lo' : i === hi ? 'hi' : null
          const inWindow = lo !== undefined && i >= lo && i <= hi
          return <div key={i} data-index={i} style={{
            minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${role ? 2 : 1}px solid ${role ? 'var(--text)' : 'var(--border)'}`, color: 'var(--text)',
            background: role === 'mid' ? 'var(--surface2)' : 'transparent', opacity: inWindow ? 1 : 0.45,
          }}><div>{value}</div><small>{role ?? ''}</small></div>
        })}
      </div>
      <p>{result !== undefined && result !== null ? `Minimum: ${result}.` : `Window [${lo}, ${hi}], mid ${mid ?? '-'}.`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Compare with the right end:</strong> if the middle is larger, the break lies to its right. If it is smaller, the middle is in the sorted run that contains the minimum.</p>
    <p><strong>Equal values:</strong> when nums[mid] equals nums[hi], the right end might be the minimum, so only drop one index. This is why the worst case is linear.</p>
  </>} />
}
