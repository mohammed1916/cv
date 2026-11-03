import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Exactly one value will be replaced.' },
    { id: 'try', label: 'Try', description: 'Place a bound at this position and take the best triple.' },
    { id: 'done', label: 'Result', description: 'Keep the largest product found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (at least three integers)',
  url: 'https://leetcode.com/problems/maximum-product-of-three-elements-after-one-replacement/description/',
  complexity: 'O(n^2 log n) for this visualization: two bounds per position, each sorted once.',
  examples: [
    { label: 'Example', input: '{"nums":[-4,6,0]}' },
    { label: 'All negative', input: '{"nums":[-1,-2,-3]}' },
  ],
}

export default function MaximumProductAfterOneReplacement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => (i === step.at && step.value !== null ? step.value : run.input.nums[i])}
      active={step.at} roleAt={i => (i === step.at ? 'replaced' : '')} />
    <output aria-label="Best product">{`best so far: ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>The product of a triple that contains the replaced position is a straight line in the new value, so its maximum sits at one of the two bounds.</p>
    <p>A triple that avoids the replaced position is unchanged, and the sorted-ends rule still finds the best one among them.</p>
  </>} />
}
