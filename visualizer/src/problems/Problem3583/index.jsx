import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'All values start on the right side.' },
    { id: 'scan', label: 'Middle value', description: 'Use each value as the middle of a triplet.' },
    { id: 'done', label: 'Complete', description: 'Report the count modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array nums of integers 0 to 100 (JSON object)',
  url: 'https://leetcode.com/problems/count-special-triplets/',
  complexity: 'O(n) time with hash counts. The visualization caps input at 30 values.',
  examples: [
    { label: 'Two doubles', input: '{"nums":[8,4,2,8,4]}' },
    { label: 'Zeros', input: '{"nums":[0,1,0,0]}' },
  ],
}

export default function SpecialTriplets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => nums[i]} active={step.index}
        roleAt={i => (step.index >= 0 && i < step.index ? 'left' : i > step.index && step.index >= 0 ? 'right' : '')} />
      <FrequencyCountTable title="Left counts" entries={step.left} />
      <FrequencyCountTable title="Right counts" entries={step.right} />
      <output aria-label="Triplets so far">{`Triplets so far: ${step.total}${step.target !== undefined ? `. Target ${step.target}, adding ${step.contribution}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>In a special triplet the middle value x pairs with two copies of 2x, one on each side.</p>
    <p>Sweeping left to right, the right side loses the current value and the left side gains it, so each product is ready in constant time.</p>
  </>} />
}
