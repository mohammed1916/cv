import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the value and cost pairs by value.' },
    { id: 'accumulate', label: 'Weight', description: 'Add costs from the smallest value up.' },
    { id: 'median', label: 'Median', description: 'Half of the total cost is reached.' },
    { id: 'done', label: 'Result', description: 'Sum the cost of moving every value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and cost of the same length (values 1 to 50, costs 1 to 100)',
  url: 'https://leetcode.com/problems/minimum-cost-to-make-array-equal/',
  complexity: 'O(n log n) time with the sort; the weighted median is found in one pass.',
  examples: [
    { label: 'Example', input: '{"nums":[1,3,5,2],"cost":[2,3,1,14]}' },
    { label: 'Equal', input: '{"nums":[2,2,2],"cost":[4,1,9]}' },
  ],
}

export default function MinimumCostToMakeArrayEqual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted value/cost" length={step.sorted.length} valueAt={i => step.sorted[i]} active={step.at}
      roleAt={i => (step.target !== null && i === step.at ? 'target' : i < step.at ? 'counted' : '')} />
    <output aria-label="Weighted median">{`running ${step.running} of ${step.total}, target ${step.target ?? 'pending'}, cost ${step.result ?? 'pending'}`}</output>
  </>} renderReasoning={() => <>
    <p>Moving one value by one step costs its weight, so the total cost is a weighted sum of distances to the target.</p>
    <p>The best target is the weighted median: the first value, in sorted order, where at least half the total weight has been reached.</p>
  </>} />
}
