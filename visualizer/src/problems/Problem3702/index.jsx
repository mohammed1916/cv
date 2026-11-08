import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a running XOR of 0.' },
    { id: 'scan', label: 'Scan', description: 'XOR each value into the running total.' },
    { id: 'keep', label: 'Decide', description: 'Choose the length from the total XOR.' },
    { id: 'drop', label: 'Decide', description: 'Drop one non-zero value when the total XOR is 0.' },
    { id: 'zero', label: 'Decide', description: 'All values are 0, so the answer is 0.' },
    { id: 'done', label: 'Complete', description: 'Report the longest length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers from 0 to 15 (JSON)',
  url: 'https://leetcode.com/problems/longest-subsequence-with-non-zero-bitwise-xor/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 10 entries.',
  examples: [
    { label: 'Own case 1', input: '[3,4,5]' },
    { label: 'Own case 2', input: '[4,5,6]' },
    { label: 'Single zero', input: '[0]' },
    { label: 'Equal values', input: '[7,7,7]' },
    { label: 'Largest values allowed', input: '[15,0,15,0,15]' },
    { label: 'Long run: 10 values', input: '[13,8,7,10,1,12,11,14,5,0]' },
  ],
}

export default function LongestNonZeroXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={index => run.input[index]} active={step.index} />
    <output aria-label="Running XOR">{`Running XOR: ${step.xor}${step.result === null ? '' : `, answer: ${step.result}`}`}</output>
  </>} renderReasoning={() => <>
    <p>If the XOR of every value is non-zero, the whole array is the longest subsequence.</p>
    <p>If it is zero, removing any non-zero value leaves a non-zero XOR, so the answer is one less than the length. An all-zero array gives 0.</p>
  </>} />
}
