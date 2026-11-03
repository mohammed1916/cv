import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with an integer n from 0 to 37 (JSON)',
  url: 'https://leetcode.com/problems/n-th-tribonacci-number/',
  complexity: 'O(n) time and O(1) extra space with a three-term window. The visualization caps n at 37.',
  examples: [
    { label: 'Term 4', input: '{"n":4}' },
    { label: 'Term 10', input: '{"n":10}' },
    { label: 'Start', input: '{"n":0}' },
  ],
}

export default function NthTribonacci() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { window, index } = step.snapshot
    const labels = ['T(i-3)', 'T(i-2)', 'T(i-1)']
    return <>
      <div role="img" aria-label="Sliding window of three terms" style={{ display: 'flex', gap: 10 }}>
        {window.map((value, i) => <div key={i} data-term={i} style={{
          width: 90, padding: 8, textAlign: 'center', fontFamily: 'monospace',
          border: `${i === 2 ? 2 : 1}px solid ${i === 2 ? 'var(--text)' : 'var(--border)'}`,
        }}>
          <div style={{ fontSize: '.75rem', color: 'var(--text-dim)' }}>{labels[i]}</div>
          <div style={{ fontSize: '1.2rem' }}>{value}</div>
        </div>)}
      </div>
      <output aria-label="Current index">{`Index ${index} of ${step.snapshot.n}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Three terms are enough:</strong> each new term depends only on the previous three, so a window of three is all the state needed.</p>
    <p><strong>Slide, do not store:</strong> each step drops the oldest term and appends the new sum.</p>
  </>} />
}
