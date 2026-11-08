import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a total of 0.' },
    { id: 'step', label: 'Step', description: 'Add or subtract the value depending on the index parity.' },
    { id: 'done', label: 'Complete', description: 'Report the alternating sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers from 1 to 100 (JSON)',
  url: 'https://leetcode.com/problems/compute-alternating-sum/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 100 entries.',
  examples: [
    { label: 'Repeats with extremes', input: '[88,1,42,42,99]' },
    { label: 'Own: five values with a repeat', input: '[4,9,2,7,7]' },
    { label: 'Single value', input: '[1]' },
    { label: 'Equal values', input: '[5,5,5,5]' },
    { label: 'Extreme values', input: '[100,1,100,1]' },
    { label: 'Long run: 100 values', input: '[53,8,71,14,93,12,67,82,37,88,79,38,37,84,67,30,85,20,87,34,85,16,15,30,25,84,87,46,33,92,95,70,13,8,99,66,77,84,7,90,17,52,75,34,33,60,71,74,61,20,83,26,57,84,7,90,81,52,63,54,65,20,75,90,21,48,83,74,1,48,15,90,53,64,51,6,9,96,67,54,37,68,43,34,77,40,63,2,1,40,55,50,65,64,15,98,77,24,31,86]' },
  ],
}

export default function ComputeAlternatingSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={index => run.input[index]} active={step.index}
      roleAt={index => (index % 2 === 0 ? 'added' : 'subtracted')} />
    <output aria-label="Total">{`Total so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Even indices are added and odd indices are subtracted, so one pass with the index parity gives the answer.</p>
  </>} />
}
