import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Seed the table with the empty prefix.' },
    { id: 'scan', label: 'Scan', description: 'Update the prefix residue and count earlier prefixes that match.' },
    { id: 'done', label: 'Complete', description: 'Report the number of interesting subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums (1 to 10 integers 0-20), modulo (2-6) and k (below modulo)',
  url: 'https://leetcode.com/problems/count-of-interesting-subarrays/',
  complexity: 'O(n + m) time and O(m) space for modulo m. The visualization caps nums at 10 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,2,4],"modulo":2,"k":1}' },
    { label: 'Example 2', input: '{"nums":[3,1,9,6],"modulo":3,"k":0}' },
  ],
}

export default function CountInterestingSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => run.input.nums[index] % run.input.modulo === run.input.k ? 'counts' : ''} />
    <output aria-label="Prefix residues">{`Prefix residue ${step.cur}, interesting so far: ${step.count}`}</output>
    <output aria-label="Residue table">{`Residue counts: ${step.freq.join(', ')}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the count of matching elements modulo the modulus matters, so prefixes can be tracked by residue.</p>
    <p>A subarray is interesting exactly when two prefix residues differ by k, so each step looks up how many earlier prefixes give the needed residue.</p>
  </>} />
}
