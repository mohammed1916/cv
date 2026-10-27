import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FenwickView from '../../components/shared/FenwickView'
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
    { label: 'Example 2', input: '[5,14,3,1,2]' },
  ],
}

export default function DistributeElementsTwoArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
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
