import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HiddenArrayView from './HiddenArrayView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the first position.' },
    { id: 'read', label: 'Read', description: 'Read the value of the current block.' },
    { id: 'search', label: 'Search', description: 'Set the range after the block start.' },
    { id: 'probe', label: 'Probe', description: 'Read one middle position with at().' },
    { id: 'block', label: 'Block', description: 'Record one block and jump to its end.' },
    { id: 'done', label: 'Result', description: 'Report the block count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a sorted values list, e.g. {"values":[1,1,1,4,4,7,9,9,9,9,12]}',
  url: 'https://leetcode.com/problems/number-of-equal-numbers-blocks/',
  complexity: 'O(k log n) calls to at() for k blocks in an array of n entries, with O(k) extra space for the answer. The visualization caps the hidden array at 40 entries.',
  examples: [
    { label: 'Five blocks', input: '{"values":[1,1,1,4,4,7,9,9,9,9,12]}' },
    { label: 'Negative start', input: '{"values":[-3,-3,0,0,0,2,2,8]}' },
    { label: 'Single value', input: '{"values":[0]}' },
    { label: 'One repeated block', input: '{"values":[5,5,5,5]}' },
    { label: 'Negative to positive', input: '{"values":[-20,-20,-20,20,20,20]}' },
    { label: 'Long run: 40 values', input: '{"values":[-20,-20,-20,-18,-17,-16,-15,-15,-14,-13,-12,-12,-11,-10,-8,-8,-8,-8,-7,-7,-7,-6,-3,-2,-2,0,0,2,5,5,5,7,12,13,13,15,15,17,19,20]}' },
  ],
}

export default function NumberOfEqualNumbersBlocks() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <HiddenArrayView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Because the array is sorted, each block is contiguous, so one binary search finds where the current value stops.</p>
    </>} />
}
