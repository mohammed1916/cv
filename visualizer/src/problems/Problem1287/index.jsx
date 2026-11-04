import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1287',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sorted array (JSON)',
  url: 'https://leetcode.com/problems/element-appearing-more-than-25-in-sorted-array/',
  complexity: 'O(n) time and O(1) extra space: one left-to-right pass over the sorted runs.',
  examples: [
    { label: 'Clear majority run', input: '[1,1,2,3,3,3,4,5]' },
    { label: 'Early run', input: '[7,7,7,7,9]' },
    { label: 'No long run', input: '[1,2,4,4,5,6,7,8]' },
  ],
}

export default function QuarterValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { start, end, found, n } = step.snapshot
    return <>
      <div role="img" aria-label="Sorted array with the current run" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {run.input.map((v, i) => {
          const inRun = start !== null && i >= start && i < end
          return <div key={i} data-index={i} style={{
            minWidth: 40, padding: '6px 4px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${inRun ? 2 : 1}px solid ${inRun ? 'var(--text)' : 'var(--border)'}`,
            background: found !== null && i >= start && i < end ? '#bbf7d0' : inRun ? 'var(--surface2)' : 'transparent', color: '#1c1917',
          }}><div>{v}</div><small>{i}</small><div style={{ fontSize: 11, color: 'var(--text)' }}>{start === i ? 'i' : ''}{start !== null && end - 1 === i ? ' j-1' : ''}</div></div>
        })}
      </div>
      {start !== null && <p>Window for the current run: i = {start}, j = {end} (the run is arr[i] to arr[j-1]).</p>}
      <p>{start === null ? 'No run is being measured.' : `Run of ${end - start} equal values (threshold: more than ${n / 4}).`}</p>
      {found !== null && <p><strong>Answer:</strong> {found}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Sorted means runs:</strong> equal values sit next to each other, so each value is a single block that can be measured.</p>
    <p><strong>Strict quarter:</strong> a run qualifies only when 4 times its length exceeds the array length, so exactly 25% does not count.</p>
  </>} />
}
