import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'read', label: 'Read', description: 'Read the two square coordinates.' },
    { id: 'column', label: 'Column', description: 'Convert the letter to a column number.' },
    { id: 'row', label: 'Row', description: 'Read the row digit.' },
    { id: 'parity', label: 'Parity', description: 'Take column plus row modulo 2.' },
    { id: 'compare', label: 'Compare', description: 'Compare the two parities.' },
    { id: 'done', label: 'Result', description: 'Return whether the colors match.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'coordinate1 and coordinate2 (JSON object)',
  url: 'https://leetcode.com/problems/check-if-two-chessboard-squares-have-the-same-color/',
  complexity: 'O(1) time and O(1) space.',
  examples: [
    { label: 'Example 1', input: '{"coordinate1": "a1", "coordinate2": "c3"}' },
    { label: 'Example 2', input: '{"coordinate1": "a1", "coordinate2": "h3"}' },
  ],
}

export default function SameColorVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <IndexedSequence label="Squares" length={2} active={step.square} valueAt={i => step.squares[i]} />
          <p>Column: {step.column ?? '-'} · Row: {step.row ?? '-'} · Parity: {step.parity ?? '-'}</p>
          <output aria-label="Same color result">{step.result === null ? 'Pending' : step.result ? 'Same color' : 'Different colors'}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  )
}
