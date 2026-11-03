import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '143',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of integers (JSON)',
  url: 'https://leetcode.com/problems/reorder-list/',
  complexity: 'O(n) time and O(1) extra pointers: find the middle, reverse the back half in place, then weave.',
  examples: [
    { label: 'Even count', input: '[1,2,3,4]' },
    { label: 'Odd count', input: '[10,20,30,40,50]' },
    { label: 'Single value', input: '[7]' },
  ],
}

export default function ReorderList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const values = run.input
    const { split, second = [], result = [], step: current } = step.snapshot
    return <>
      <div role="img" aria-label="Front half and reversed back half" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {values.map((v, i) => {
          const front = split !== undefined && i < split
          const isCurrent = current !== undefined && i === current
          return <div key={i} data-index={i} style={{
            minWidth: 48, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? 'var(--text)' : 'var(--border)'}`,
            background: front ? '#e0e7ff' : '#fce7f3', color: '#1c1917',
          }}>{v}<div><small>{i}</small></div></div>
        })}
      </div>
      {split !== undefined && <p>Front half: {values.slice(0, split).join(', ')} | Reversed back half: {second.join(', ') || 'none'}</p>}
      <p>Woven so far: <code>{result.join(', ') || '(nothing yet)'}</code></p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Three steps:</strong> find the middle, reverse the second half, then alternate between the two halves.</p>
    <p><strong>Why reverse:</strong> the last original value must be the first one taken from the back half.</p>
  </>} />
}
