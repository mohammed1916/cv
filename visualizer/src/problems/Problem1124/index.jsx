import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Daily hours (JSON array)',
  url: 'https://leetcode.com/problems/longest-well-performing-interval/',
  complexity: 'O(n) time and O(n) space. The visualization caps the input at 40 days.',
  examples: [
    { label: 'Mixed', input: '[9,9,6,1]' },
    { label: 'Long run', input: '[6,9,9,6,6,9,9,9]' },
    { label: 'No tiring days', input: '[8,8,8]' },
    { label: 'Single day', input: '[9]' },
    { label: 'Maximum hours every day', input: '[16,16,16,16]' },
    { label: 'Long run: 40 days', input: '[12,14,13,7,10,2,8,2,12,3,6,2,13,3,4,7,8,13,11,14,2,11,15,6,10,14,16,2,10,7,7,3,13,10,1,13,4,14,1,14]' },
  ],
}

export default function LongestWellPerformingInterval() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const s = step.snapshot
      return <div style={{ display: 'grid', gap: 12 }}>
        <IndexedSequence label="Hours" length={run.input.length} valueAt={i => run.input[i]} active={s.index}
          roleAt={i => (i < s.index ? (run.input[i] > 8 ? 'tiring' : 'rest') : '')} />
        <p>Running score: <strong>{s.score}</strong> · Best length so far: <strong>{s.best}</strong></p>
        <div aria-label="Earliest positions"><strong>Earliest position of each score:</strong> {s.first.map(f => `${f.score}→${f.index}`).join(', ')}</div>
      </div>
    }}
    renderReasoning={({ step }) => <p>{step.snapshot.note || 'A tiring day adds 1 and any other day subtracts 1. Equal prefix scores cancel, so the earliest occurrence gives the longest interval.'}</p>} />
}
