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
    { label: 'Single item', input: '{"nums":[50],"cost":[100]}' },
    { label: 'Equal values', input: '{"nums":[3,3,3,3],"cost":[1,2,3,4]}' },
    { label: 'Largest values', input: '{"nums":[50,1,50,1,50,1,50,1,50,1,50,1],"cost":[100,1,100,1,100,1,100,1,100,1,100,1]}' },
    { label: 'Long run: 12 items', input: '{"nums":[34,25,22,12,32,43,40,44,6,31,24,46],"cost":[71,84,22,23,32,68,84,24,83,19,6,23]}' },
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
