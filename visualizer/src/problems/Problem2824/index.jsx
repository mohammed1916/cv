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
    { label: 'Own case 1', input: '{"nums":[-7,3,6,-3,-8,-2,4],"target":-3}' },
    { label: 'Small', input: '{"nums":[-1,1,2,3,1],"target":3}' },
    { label: "Single number", input: "{\"nums\":[7],\"target\":7}" },
    { label: "Equal values", input: "{\"nums\":[2,2,2,2],\"target\":2}" },
    { label: "Extreme negative target", input: "{\"nums\":[-50,50,-50,50],\"target\":-100}" },
    { label: "Long run: 30 seeded values", input: "{\"nums\":[22,29,41,-15,3,26,45,27,-49,40,44,45,39,-12,12,4,13,4,5,45,33,-16,-34,-31,25,-31,-21,-9,24,45],\"target\":0}" },
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
