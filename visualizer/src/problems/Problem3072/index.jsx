import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FenwickView from '../../components/shared/FenwickView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The first two values seed the two arrays.' },
    { id: 'place', label: 'Place value', description: 'Count larger values in each array with its Fenwick tree, then choose.' },
    { id: 'done', label: 'Complete', description: 'Concatenate the two arrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Distinct integers as JSON array (1 to 50, 3 to 12 values)',
  url: 'https://leetcode.com/problems/distribute-elements-into-two-arrays-ii/',
  complexity: 'O(n log n) time with two Fenwick trees over the value ranks. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '[2,1,4,5]' },
    { label: 'Own case 1', input: '[6,15,4,2,3]' },
    { label: 'Three values', input: '[1,2,3]' },
    { label: 'Spread values', input: '[50,1,49,2,48,3,47,4,46,5,45,6]' },
    { label: 'Long run: 12 values', input: '[17,34,1,15,4,14,5,33,7,19,49,30]' },
  ],
}

export default function DistributeElementsTwoArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input values" length={run.input.length} valueAt={i => run.input[i]} active={step.index ?? -1} roleAt={i => (step.arr1.includes(run.input[i]) ? 'arr1' : step.arr2.includes(run.input[i]) ? 'arr2' : '')} />
    <output aria-label="Decision">{step.index === null ? step.message : `Value ${step.value}: greater counts ${step.g1} (arr1) and ${step.g2} (arr2), goes to arr${step.target}`}</output>
    <div className="fenwick-pair">
      <FenwickView title="arr1 counts by rank" tree={step.tree1} ops={step.ops1} />
      <FenwickView title="arr2 counts by rank" tree={step.tree2} ops={step.ops2} />
    </div>
    <p>{`arr1 = [${step.arr1.join(', ')}]`}</p>
    <p>{`arr2 = [${step.arr2.join(', ')}]`}</p>
  </>} renderReasoning={() => <>
    <p>Each array's count of larger values is a prefix query on a Fenwick tree indexed by value rank, subtracted from the array length.</p>
    <p>Ties go to the shorter array, so the two arrays stay balanced when the counts are equal.</p>
  </>} />
}
