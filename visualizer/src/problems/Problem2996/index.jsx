import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The prefix starts at the first value.' },
    { id: 'extend', label: 'Extend', description: 'The next value continues the run by one.' },
    { id: 'set', label: 'Prefix', description: 'The run is fixed; search begins at its sum.' },
    { id: 'skip', label: 'Skip', description: 'This candidate is already present.' },
    { id: 'done', label: 'Result', description: 'The smallest missing candidate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers from 1 to 50',
  url: 'https://leetcode.com/problems/smallest-missing-integer-greater-than-sequential-prefix-sum/',
  complexity: 'O(n) time and O(n) space for the set of values, plus the search for the missing integer.',
  examples: [
    { label: 'Run then gap', input: '[4,5,6,9,2]' },
    { label: 'Run of one', input: '[7,3,8]' },
    { label: "Single element", input: '[1]' },
    { label: "All equal values", input: '[4,4,4,4]' },
    { label: "Maximum values", input: '[50,50,1,50]' },
    { label: "Long run: 50 values", input: '[32,50,42,11,43,39,40,21,47,14,47,38,20,48,26,31,24,1,43,29,17,12,41,36,20,44,27,22,18,2,32,10,19,44,11,40,35,30,23,50,23,18,49,28,1,41,22,10,20,49]' },
  ],
}

export default function SmallestMissingSequentialPrefixSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.at >= 0 ? step.at : step.end}
      roleAt={i => (i === 0 ? 'l' : i === step.end ? 'r' : i < step.end ? 'run' : '')} />
    <output aria-label="Prefix sum and candidate">{`sum = ${step.total}, candidate = ${step.x ?? 'not yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>The sequential prefix runs from l (the first value) to r (the last value that keeps adding one). Its sum is the starting candidate.</p>
    <p>A set of the array values answers each membership check in constant time, so the search only moves upward past values that are present.</p>
  </>} />
}
