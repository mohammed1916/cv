import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Count the cells and the arrangements that contain a given pair.' },
    { id: 'rows', label: 'Row gaps', description: 'Add the ordered distance sum for the row axis.' },
    { id: 'columns', label: 'Column gaps', description: 'Add the ordered distance sum for the column axis.' },
    { id: 'pairs', label: 'Pair total', description: 'Combine both axes into the sum over unordered cell pairs.' },
    { id: 'ways', label: 'Multiplier', description: 'Count the arrangements that contain each pair.' },
    { id: 'done', label: 'Result', description: 'Multiply and reduce modulo 1000000007.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Grid JSON with m, n and k',
  url: 'https://leetcode.com/problems/manhattan-distances-of-all-arrangements-of-pieces/',
  complexity: 'O(m + n + log) time with modular arithmetic for the real limits. The visualization caps m * n at 36 cells.',
  examples: [
    { label: 'Example 1', input: '{"m":2,"n":2,"k":2}' },
    { label: 'Example 2', input: '{"m":1,"n":4,"k":3}' },
  ],
}

export default function ManhattanDistancesOfArrangements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {step.axis
      ? <IndexedSequence label={`Gap terms 2·d·(L − d) on the ${step.axis} axis`} length={step.length}
          valueAt={index => 2 * index * (step.length - index)} active={step.d}
          roleAt={index => (index < step.d ? 'counted' : '')} />
      : <p>{step.message}</p>}
    <p>Pair total so far: {step.pairTotal === null ? 'not yet' : String(step.pairTotal)}</p>
    <p>Grid {run.input.m} × {run.input.n} with {run.input.k} pieces</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Two pieces at cells a and b are in the same arrangement exactly when the other k − 2 pieces fill the remaining cells, so each pair's distance is counted C(mn − 2, k − 2) times.</p>
  </>} />
}
