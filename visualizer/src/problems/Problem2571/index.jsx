import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the given integer and no operations.' },
    { id: 'shift', label: 'Halve', description: 'An even number is halved without cost.' },
    { id: 'add', label: 'Add one', description: 'Low bits 11: adding one clears a run of ones.' },
    { id: 'subtract', label: 'Subtract one', description: 'Low bits 01: subtracting one clears the lowest bit.' },
    { id: 'done', label: 'Complete', description: 'Report the operation count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'A positive integer as JSON, e.g. {"n": 39}',
  url: 'https://leetcode.com/problems/minimum-operations-to-reduce-an-integer-to-0/',
  complexity: 'O(log n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"n": 39}' },
    { label: 'Example 2', input: '{"n": 54}' },
  ],
}

export default function ReduceToZero() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const bits = step.value.toString(2).split('').reverse()
    return <>
      <IndexedSequence label="Bits of the current value (least significant first)" length={Math.max(1, bits.length)}
        valueAt={i => bits[i] ?? '0'} active={0} />
      <output aria-label="Current value">{`Value ${step.value}, operations so far: ${step.ops}`}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => (
    <>
      <p>An even number is always halved for free, because the lowest bit is already cleared.</p>
      <p>On an odd number, either subtracting one or adding one clears the lowest bit; adding one is better when the two lowest bits are 11, since it turns a run of ones into a single carry.</p>
    </>
  )} />
}
