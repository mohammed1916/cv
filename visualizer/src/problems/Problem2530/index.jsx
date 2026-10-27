import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Heap', description: 'Every number starts in the max heap.' },
    { id: 'take', label: 'Take', description: 'Take the largest number into the score and put back its third, rounded up.' },
    { id: 'done', label: 'Complete', description: 'Report the score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [...], "k": operations}',
  url: 'https://leetcode.com/problems/maximal-score-after-applying-k-operations/',
  complexity: 'O((n + k) log n) time with a max heap. The visualization caps input at 10 numbers and 12 operations.',
  examples: [
    { label: 'Example 1', input: '{"nums":[10,10,10,10,10],"k":5}' },
    { label: 'Example 2', input: '{"nums":[1,10,3,3,3],"k":3}' },
  ],
}

export default function MaximalScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Numbers in the heap" length={step.values.length} valueAt={i => step.values[i]} active={step.picked} />
    <output aria-label="Score">{`Score so far: ${step.score}`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation must take the largest number, so the score is always built from the current maximum.</p>
    <p>Replacing a number by its ceiling of one third keeps it in the heap, so the same heap serves every operation.</p>
  </>} />
}
