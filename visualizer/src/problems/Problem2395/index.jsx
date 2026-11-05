import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2395',
  phases: [
    { id: 'record', label: 'Record', description: 'Store the sum of this adjacent pair with its start index.' },
    { id: 'match', label: 'Match', description: 'The sum was already stored, so two different pairs match.' },
    { id: 'done', label: 'Result', description: 'Return whether a match was found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [1, 2, 1, 2]}',
  url: 'https://leetcode.com/problems/find-subarrays-with-equal-sum/',
  complexity: 'O(n) expected time and O(n) space with a hash map of pair sums.',
  examples: [
    { label: 'Match', input: '{"nums":[1,2,1,2]}' },
    { label: 'No match', input: '{"nums":[1,2,4,8,16]}' },
  ],
}

export default function EqualPairSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    return <>
      <IndexedSequence label="values" length={nums.length} valueAt={i => nums[i]} active={step.i < 0 ? -1 : step.i}
        roleAt={i => (step.found && (i === step.found[0] || i === step.found[0] + 1) ? 'match' : step.i >= 0 && (i === step.i || i === step.i + 1) ? 'pair' : '')} />
      <table aria-label="Pair sums seen">
        <thead><tr><th scope="col">Sum</th><th scope="col">Start index</th></tr></thead>
        <tbody>{step.sums.map(([sum, index]) => <tr key={sum}><td>{sum}</td><td>{index}</td></tr>)}</tbody>
      </table>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Two length-2 subarrays with equal sums are two adjacent pairs whose totals match. Scan the pairs left to right, remembering each sum and where it first appeared.</p>
  </>} />
}
