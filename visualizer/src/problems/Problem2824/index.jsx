import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the values so pair sums move predictably.' },
    { id: 'start', label: 'Ends', description: 'Place pointers on the smallest and largest values.' },
    { id: 'count', label: 'Count block', description: 'Every index between the pointers forms a valid pair with the left value.' },
    { id: 'move', label: 'Move left', description: 'Advance the left pointer past the counted block.' },
    { id: 'skip', label: 'Move right', description: 'The pair is too large, so drop the right value.' },
    { id: 'done', label: 'Complete', description: 'Report the number of pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and target (JSON)',
  url: 'https://leetcode.com/problems/count-pairs-whose-sum-is-less-than-target/',
  complexity: 'O(n log n) time for sorting and O(n) for the scan. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example', input: '{"nums":[-6,2,5,-2,-7,-1,3],"target":-2}' },
    { label: 'Small', input: '{"nums":[-1,1,2,3,1],"target":3}' },
  ],
}

export default function CountPairsLessThanTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted values" length={step.sorted.length} valueAt={i => step.sorted[i]} active={step.right}
      roleAt={i => (i === step.left ? 'left' : '')} />
    <output aria-label="Count">{`Pairs counted: ${step.count} (target ${run.input.target})`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>After sorting, if the smallest value plus the largest is below the target, the largest value pairs with every value from the left pointer onward, so the whole block is counted at once.</p>
  </>} />
}
