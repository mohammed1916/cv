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
    { label: 'Own case 1', input: '{"nums":[2,3,3,4],"l":7,"r":7}' },
    { label: 'Zeros', input: '{"nums":[0,0,2],"l":0,"r":2}' },
    { label: "Single zero, empty range check", input: "{\"nums\":[0],\"l\":0,\"r\":0}" },
    { label: "Equal values, middle range", input: "{\"nums\":[2,2,2,2],\"l\":4,\"r\":6}" },
    { label: "Largest values, full range", input: "{\"nums\":[9,9,9,9,9,9,9,9],\"l\":0,\"r\":40}" },
    { label: "No sub-multiset fits the range", input: "{\"nums\":[9,9],\"l\":1,\"r\":8}" },
    { label: "Long run: 8 values", input: "{\"nums\":[3,5,8,0,4,4,2,3],\"l\":5,\"r\":30}" },
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
