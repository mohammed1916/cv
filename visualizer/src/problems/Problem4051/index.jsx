import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PrefixLineView from './PrefixLineView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Record prefix zero.' },
    { id: 'prefix', label: 'Prefix', description: 'Add the next value to the running sum.' },
    { id: 'band', label: 'Close band', description: 'Find earlier prefixes too close to the goal.' },
    { id: 'add', label: 'Count', description: 'Count the distant subarrays that end here.' },
    { id: 'insert', label: 'Insert', description: 'Keep the prefix list sorted for later steps.' },
    { id: 'done', label: 'Result', description: 'Return the count.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums, goal and k, e.g. {"nums":[1,-1,2,3],"goal":2,"k":1}',
  url: 'https://leetcode.com/problems/count-subarrays-with-distant-sums/',
  complexity: 'O(n^2) worst case in this sorted-list form, from list insertion; O(n log n) with a balanced structure. The visualization caps nums at 12 values; the official limit is 100000.',
  examples: [
    { label: 'Mixed signs', input: '{"nums":[1,-1,2,3,-2],"goal":2,"k":1}' },
    { label: 'Any sum counts', input: '{"nums":[4,1,3],"goal":3,"k":0}' },
    { label: "One value, no changes", input: "{\"nums\":[5],\"goal\":5,\"k\":0}" },
    { label: "Equal values", input: "{\"nums\":[2,2,2],\"goal\":2,\"k\":0}" },
    { label: "Extremes with large k", input: "{\"nums\":[-100,100,-100,100,-100,100,-100,100,-100,100,-100,100],\"goal\":-1000,\"k\":1000}" },
    { label: "Long run: twelve values", input: "{\"nums\":[-82,-7,-85,84,-63,-13,-67,-34,-94,94,52,-72],\"goal\":0,\"k\":12}" },
  ],
}

export default function CountSubarraysWithDistantSums() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PrefixLineView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
