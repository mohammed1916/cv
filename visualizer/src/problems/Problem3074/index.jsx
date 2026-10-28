import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Find the total number of apples.' },
    { id: 'take', label: 'Take box', description: 'Add the next largest box.' },
    { id: 'done', label: 'Complete', description: 'Report the number of boxes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with apple and capacity arrays of 1 to 6 integers (JSON)',
  url: 'https://leetcode.com/problems/apple-redistribution-into-boxes/',
  complexity: 'O(m log m) for the sort, where m is the number of boxes.',
  examples: [
    { label: 'Example 1', input: '{"apple":[1,3,2],"capacity":[4,3,1,5,2]}' },
    { label: 'Example 2', input: '{"apple":[5,5,5],"capacity":[2,4,2,7]}' },
  ],
}

export default function AppleBoxes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const ranked = [...run.input.capacity].sort((a, b) => b - a)
    return <>
      <IndexedSequence label="Boxes, largest first" length={ranked.length} valueAt={i => ranked[i]}
        roleAt={i => (i < step.count ? 'taken' : '')} />
      <output aria-label="Apples held">{`Held ${step.held} of ${step.need} apples`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The number of boxes is what matters, so the largest boxes are always the best to use.</p>
    <p>Taking boxes in decreasing capacity order reaches the apple total with the fewest boxes.</p>
  </>} />
}
