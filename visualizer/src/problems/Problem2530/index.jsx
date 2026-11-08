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
    { label: 'Six values, k four', input: '{"nums":[8,24,3,17,5,12],"k":4}' },
    { label: 'Three values, k one', input: '{"nums":[30,30,9],"k":1}' },
    { label: 'Single number', input: '{"nums":[7],"k":1}' },
    { label: 'Equal values use the first one', input: '{"nums":[4,4,4],"k":2}' },
    { label: 'Largest values for 12 rounds', input: '{"nums":[50,50,50,50,50,50,50,50,50,50],"k":12}' },
    { label: 'Long run: 10 numbers, 12 rounds', input: '{"nums":[6,43,25,39,34,46,5,38,14,6],"k":12}' },
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
