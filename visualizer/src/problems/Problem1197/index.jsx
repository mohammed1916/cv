import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import KnightWaveView from './KnightWaveView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1197',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with integer x and y (e.g. {"x":5,"y":5})',
  url: 'https://leetcode.com/problems/minimum-knight-moves/',
  complexity: 'O(W²) time and space for a search window of side W = 2·max(|x|,|y|) + 5. The visualization caps |x| and |y| at 12; the official bounds were not verified.',
  examples: [
    { label: 'One move', input: '{"x":-1,"y":2}' },
    { label: 'Four moves', input: '{"x":6,"y":-4}' },
  ],
}

export default function MinimumKnightMoves() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <KnightWaveView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Breadth-first search expands cells in rings of equal distance, so the first time the target is popped its distance is minimal.
          {run ? ` The answer is ${run.answer}.` : ''} {step.isNew === false ? 'Cells already reached keep their first, shortest distance.' : ''}
        </p>
      )}
    />
  )
}
