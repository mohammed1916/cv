import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Split', description: 'Separate odd and even values; each class is matched on its own.' },
    { id: 'pair', label: 'Pair', description: 'Pair the next sorted values and add their difference.' },
    { id: 'done', label: 'Complete', description: 'Divide the total difference by four.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and target (equal-length arrays, same sum and same odd count)',
  url: 'https://leetcode.com/problems/minimum-number-of-operations-to-make-arrays-similar/',
  complexity: 'O(n log n) time for the sorts. The visualization caps input at 6 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[8,12,6],"target":[2,14,10]}' },
    { label: 'Example 2', input: '{"nums":[1,2,5],"target":[2,5,1]}' },
  ],
}

export default function MinimumOperationsSimilar() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values of nums (left) against target (right)" length={run.input.nums.length} valueAt={i => `${run.input.nums[i]} → ${run.input.target[i]}`} active={-1} roleAt={() => ''} />
    <output aria-label="Running difference">{step.pair ? `Pair ${step.pair[0]} with ${step.pair[1]}. Total difference ${step.total}` : `Total difference ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation adds 2 to one entry and subtracts 2 from another, so odd values stay odd and even values stay even.</p>
    <p>Matching sorted values within each parity class minimizes the total difference, and each operation can reduce that total by at most four.</p>
  </>} />
}
