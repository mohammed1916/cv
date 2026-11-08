import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Distinct', description: 'Gather the distinct values; a repeated value can be chosen only once.' },
    { id: 'sort', label: 'Sort', description: 'Order the distinct values from largest to smallest.' },
    { id: 'take', label: 'Take', description: 'Keep the next largest value while fewer than k are chosen.' },
    { id: 'done', label: 'Complete', description: 'Report the chosen values in descending order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (positive integers) and k',
  url: 'https://leetcode.com/problems/maximize-sum-of-at-most-k-distinct-elements/',
  complexity: 'O(n log n) time for sorting. The visualization caps input at 20 values.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[85,94,101,78,91],"k":4}' },
    { label: 'Duplicates', input: '{"nums":[84,93,100,77,93],"k":3}' },
    { label: 'Single value', input: '{"nums":[4],"k":1}' },
    { label: 'Equal values', input: '{"nums":[7,7,7],"k":2}' },
    { label: 'Largest values and k', input: '{"nums":[1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000],"k":20}' },
    { label: 'Long run: 20 values', input: '{"nums":[11136903,7234970,4778304,606646,10834240,3164885,4767294,12541755,10306741,3725344,5402499,9824721,6218122,6396110,2721874,10226668,15566756,5194612,6178351,9141569],"k":9}' },
  ],
}

export default function MaximizeDistinctSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, k } = run.input
    const roleAt = i => (step.chosen.includes(nums[i]) && nums.indexOf(nums[i]) === i ? 'chosen' : '')
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} roleAt={roleAt} />
      <output aria-label="Chosen">{`Chosen so far: [${step.chosen.join(', ')}] (k = ${k})`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Every value is positive, so adding a value never lowers the sum. The best choice is the largest distinct values, up to k of them.</p>
    <p>Duplicates are removed first because the statement requires distinct values.</p>
  </>} />
}
