import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: 'Start with no capture recorded and no boundary seen.' },
    { id: 'scan', label: 'Scan', description: 'Visit each position from left to right.' },
    { id: 'check', label: 'Check', description: 'Compare the position with the previous boundary l.' },
    { id: 'update', label: 'Update', description: 'Record a capture or move the boundary l to here.' },
    { id: 'done', label: 'Result', description: 'Return the largest capture found.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Forts object (JSON, e.g. {"forts": [1, 0, 0, -1]})',
  url: 'https://leetcode.com/problems/maximum-enemy-forts-that-can-be-captured/',
  complexity: 'O(n) time and O(1) space for n forts. The visualization caps the array at 1000 positions.',
  examples: [
    { label: 'Capture three forts', input: '{"forts": [1,0,0,0,-1,0,1,0,-1]}' },
    { label: 'Same owner first', input: '{"forts": [1,0,0,1,0,-1]}' },
    { label: 'No capture possible', input: '{"forts": [0,0,0]}' },
    { label: 'Single fort', input: '{"forts":[1]}' },
    { label: 'Forts on both ends', input: '{"forts":[1,-1,1]}' },
    { label: 'All empty', input: '{"forts":[-1,-1,-1]}' },
    { label: 'Long run: 1000 positions', input: '{"forts":[-1,0,0,-1,-1,-1,1,-1,-1,-1,0,1,-1,0,-1,1,-1,1,1,-1,-1,1,0,0,1,0,0,0,0,-1,-1,-1,-1,-1,1,0,1,1,-1,0,0,1,1,1,0,0,-1,-1,-1,1,1,1,0,-1,0,0,0,-1,0,1,-1,0,0,-1,-1,1,0,-1,1,-1,-1,0,1,0,-1,1,0,0,0,-1,1,0,0,-1,0,0,-1,1,0,-1,-1,1,0,1,-1,-1,1,-1,1,0,1,-1,1,1,1,1,1,0,-1,0,-1,0,1,-1,1,0,-1,0,-1,1,0,0,1,-1,-1,0,1,1,-1,-1,1,0,0,0,0,1,1,1,-1,0,1,0,0,0,-1,-1,0,-1,1,-1,0,0,1,-1,-1,-1,-1,1,0,0,-1,-1,-1,1,1,-1,-1,1,0,1,-1,-1,-1,1,-1,-1,0,0,-1,1,0,1,-1,-1,-1,0,0,0,0,0,-1,0,-1,-1,1,0,1,1,-1,-1,1,0,1,1,0,1,0,1,-1,1,0,-1,0,1,0,-1,1,0,-1,-1,-1,-1,0,-1,-1,-1,-1,0,0,0,0,1,1,0,-1,0,-1,1,0,0,1,0,0,-1,0,-1,1,-1,0,1,1,1,0,-1,-1,1,-1,1,0,1,-1,0,-1,0,0,-1,0,0,0,1,-1,-1,-1,-1,0,1,1,-1,-1,1,1,0,0,-1,-1,1,-1,0,0,-1,0,-1,0,-1,-1,0,-1,1,1,0,-1,-1,-1,1,-1,-1,1,1,1,0,1,1,1,1,-1,0,1,1,0,-1,1,-1,-1,1,-1,0,0,0,1,1,0,-1,1,-1,1,-1,-1,0,0,0,0,-1,1,0,-1,0,1,-1,1,0,1,-1,-1,-1,1,0,0,-1,-1,1,-1,1,-1,0,0,0,-1,0,1,0,0,1,-1,0,0,-1,0,-1,0,0,-1,1,1,1,-1,1,1,0,-1,0,0,1,-1,1,-1,0,0,-1,1,1,-1,-1,-1,1,-1,1,-1,-1,1,-1,1,0,-1,-1,0,0,-1,0,1,1,1,0,1,-1,-1,-1,1,-1,0,0,-1,0,1,1,-1,1,0,-1,0,1,1,1,1,-1,-1,-1,1,-1,-1,1,-1,0,-1,1,0,0,1,1,0,-1,0,0,-1,1,0,1,0,-1,1,0,1,0,1,0,-1,0,1,-1,-1,-1,0,0,1,1,1,0,1,-1,-1,1,1,-1,0,1,-1,1,1,-1,0,-1,1,0,1,-1,-1,0,1,0,-1,-1,1,-1,0,-1,1,0,0,0,0,1,0,-1,-1,-1,-1,0,-1,-1,0,0,-1,1,-1,1,0,0,-1,0,-1,-1,-1,0,-1,-1,-1,0,0,1,-1,-1,-1,0,0,0,1,1,-1,0,-1,0,0,0,0,-1,1,1,-1,-1,0,-1,1,-1,0,-1,-1,0,1,-1,0,-1,0,0,0,1,-1,0,1,0,1,1,0,1,1,-1,1,1,0,0,0,-1,-1,-1,0,1,0,0,0,-1,1,1,0,-1,0,-1,-1,1,0,0,-1,-1,-1,-1,0,0,1,1,-1,0,-1,-1,1,0,0,0,0,0,1,-1,-1,0,1,0,1,-1,1,-1,1,1,1,1,-1,1,0,-1,0,0,0,-1,-1,1,1,1,0,-1,-1,0,1,0,-1,-1,1,1,1,0,1,1,1,0,1,0,-1,0,1,-1,0,-1,0,1,0,-1,0,1,-1,-1,-1,0,-1,1,-1,-1,1,-1,-1,-1,-1,1,1,-1,-1,-1,1,-1,0,1,0,1,-1,1,-1,-1,0,1,0,-1,-1,0,0,1,0,-1,1,1,0,-1,-1,0,1,0,1,-1,0,-1,-1,-1,1,0,1,1,0,0,-1,0,-1,-1,1,0,-1,0,0,1,-1,-1,1,1,1,-1,-1,1,1,1,1,-1,-1,1,0,1,-1,1,-1,-1,0,1,0,1,0,-1,1,0,1,-1,-1,0,1,0,-1,-1,-1,1,0,-1,-1,0,0,1,1,-1,1,1,-1,0,1,-1,1,-1,1,-1,0,1,0,0,0,-1,-1,1,-1,-1,0,1,-1,1,0,-1,1,0,1,1,0,0,1,0,1,1,-1,0,-1,-1,1,0,0,1,0,0,0,-1,0,0,1,1,-1,1,0,-1,1,1,-1,-1,0,0,-1,0,1,0,-1,0,1,-1,-1,1,0,0,0,-1,1,-1,0,1,-1,-1,0,0,1,0,-1,0,1,-1,-1,1,0,-1,1,1,1,0,0,-1,0,1,1,1,1,-1,0,-1,1,0,-1,-1,0,1,0,-1,-1,0,0,1,0,1,1,-1,-1,-1,0,-1,-1,-1,1,-1,0,-1,0,0,0,-1,-1,0,-1,0,-1,1,0,0,0,-1,1,1,-1,1,1,0,0,0,-1,1,0,0,0,0,1,1,0,1,-1,-1,1,0,-1,1,-1,1,0,0,1,-1,-1,-1,1,1,0,1,1,-1,1,0,1,0,-1,-1,-1,1]}' },
  ],
}

export default function MaximumEnemyForts() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Forts (1 yours, 0 enemy, -1 empty)"
            length={run.input.forts.length}
            active={step.index ?? -1}
            valueAt={(i) => run.input.forts[i]}
            roleAt={(i) => (i === step.last ? 'l' : i === step.index ? 'r' : '')}
          />
          <output aria-label="Best capture so far">Best: {step.best}</output>
          <p role="status">{step.message}</p>
        </>
      )}
      renderReasoning={({ step }) => <>
        <p>l is the last boundary (a fort of yours or an empty cell). r is the position being read. Enemy forts between l and r can be captured only when the two boundaries are of opposite types.</p>
        <p>{step.message}</p>
      </>}
    />
  )
}
