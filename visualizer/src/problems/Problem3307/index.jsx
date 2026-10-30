import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no accumulated shift.' },
    { id: 'step', label: 'Halve', description: 'Find the half that the position falls in.' },
    { id: 'move', label: 'Map back', description: 'Move a second-half position to the first half.' },
    { id: 'shift', label: 'Shift', description: 'Record a type-1 shift.' },
    { id: 'done', label: 'Result', description: 'Return the letter.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'k and operations (JSON object)',
  url: 'https://leetcode.com/problems/find-the-k-th-character-in-string-game-ii/',
  complexity: 'O(m) time and O(1) extra space for m operations (m at most 100). The visualization shows the full operation list.',
  examples: [
    { label: 'Example 1', input: '{"k": 5, "operations": [0, 0, 0]}' },
    { label: 'Example 2', input: '{"k": 10, "operations": [0, 1, 0, 1]}' },
  ],
}

export default function KthCharacterGameTwoVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <IndexedSequence label="Operations (1-based t)" length={step.operations.length}
            active={step.t === null || step.t === undefined ? -1 : step.t - 1}
            valueAt={i => step.operations[i]} />
          <table>
            <caption>Current state</caption>
            <tbody>
              <tr><th scope="row">k (position in the current half)</th><td>{step.k}</td></tr>
              <tr><th scope="row">Accumulated shift</th><td>{step.shift}</td></tr>
            </tbody>
          </table>
          <output aria-label="Answer">{step.phase === 'done' ? `Answer: ${step.result}` : 'Working backward'}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  )
}
