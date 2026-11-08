import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with prefix 0 seen once.' },
    { id: 'step', label: 'Extend prefix', description: 'XOR the value into the prefix and count earlier matches.' },
    { id: 'done', label: 'Complete', description: 'Report the number of beautiful subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (up to 20 values from 0 to 255)',
  url: 'https://leetcode.com/problems/count-the-number-of-beautiful-subarrays/',
  complexity: 'O(n) expected time with a hash map of prefix counts, O(n) space.',
  examples: [
    { label: 'Example 1', input: '{"nums": [4,3,1,2,4]}' },
    { label: 'Example 2', input: '{"nums": [1,10,4]}' },
    { label: 'Single value', input: '{"nums":[7]}' },
    { label: 'Repeated values tie', input: '{"nums":[5,9,5,9,5]}' },
    { label: 'Byte limits 0 and 255', input: '{"nums":[255,0,255,0,255,128]}' },
    { label: 'Long run: 20 values', input: '{"nums":[203,174,53,16,47,194,57,68,211,22,125,184,183,170,1,108,219,126,197,96]}' },
  ],
}

export default function BeautifulSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    return <>
      <IndexedSequence label="nums" length={run.nums.length} valueAt={i => run.nums[i]} active={step.index} />
      <output aria-label="Prefix state">{`Prefix ${step.prefix}, count ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The XOR of a subarray is zero exactly when the two prefix XORs around it are equal, and each beautiful subarray is one such pair.</p>
    <p>A hash map of prefix counts lets each step add the earlier matches in constant time.</p>
  </>} />
}
