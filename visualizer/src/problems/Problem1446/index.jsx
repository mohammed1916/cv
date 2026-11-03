import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1446',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase string',
  url: 'https://leetcode.com/problems/consecutive-characters/',
  complexity: 'O(n) time and O(1) extra space: one pass with a running count.',
  examples: [
    { label: 'Triple o', input: 'mooo' },
    { label: 'Mixed runs', input: 'aabbbbcc' },
    { label: 'All different', input: 'abcd' },
  ],
}

export default function ConsecutiveCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { s, index, run, best } = step.snapshot
    return <>
      <div role="list" aria-label="Characters" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {[...s].map((ch, i) => <span key={i} role="listitem" data-index={i} style={{
          width: 34, height: 34, display: 'grid', placeItems: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: i <= index && i > index - run ? '#bae6fd' : 'transparent',
        }}>{ch}</span>)}
      </div>
      <p>Current run: {run} · Best run: {best}</p>
      <p>{step.message}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Run:</strong> a block of the same character. The highlighted cells are the current run.</p>
    <p>{step.snapshot.same === null ? 'The first character starts a run.' : step.snapshot.same ? 'This character matches its neighbour, so the run grows.' : 'This character differs, so a new run starts.'}</p>
  </>} />
}
