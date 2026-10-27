import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Only the empty multiset has sum 0.' },
    { id: 'value', label: 'Add value', description: 'Let this value appear 0 to its count times.' },
    { id: 'done', label: 'Complete', description: 'Sum the counts within [l, r] and apply the zeros factor.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: nums (0-9 each), l and r',
  url: 'https://leetcode.com/problems/count-of-sub-multisets-with-bounded-sum/',
  complexity: 'O(distinct * total * maxCount) time. The visualization caps input at 8 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,2,3],"l":6,"r":6}' },
    { label: 'Zeros', input: '{"nums":[0,0,2],"l":0,"r":2}' },
  ],
}

export default function SubMultisetsBoundedSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Ways to reach each sum" length={step.ways.length} valueAt={i => step.ways[i]}
      active={-1} roleAt={i => (i >= run.input.l && i <= run.input.r ? 'in range' : '')} />
    <output aria-label="Current value">{step.value === null ? 'Zeros give a factor only' : `Value ${step.value} appears 0 to ${step.copies} times`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A sub-multiset is a count for each distinct value, so the table adds one value at a time. Zeros do not change the sum, so they multiply the final count by one more than their number.</p>
  </>} />
}
