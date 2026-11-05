import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2149',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Equal positives and negatives as a JSON array',
  url: 'https://leetcode.com/problems/rearrange-array-elements-by-sign/',
  complexity: 'O(n) time and O(n) space for the output.',
  examples: [
    { label: 'Positives first', input: '[7,-4,2,-9,5,-1]' },
    { label: 'Negatives first', input: '[-3,6,-8,4]' },
  ],
}

export default function Problem2149Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Input (current value highlighted)" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.i} roleAt={() => ''} />
          <IndexedSequence label="Output (p writes even slots, q writes odd slots)" length={step.result.length} valueAt={i => (step.result[i] === null ? '·' : step.result[i])} active={-1} roleAt={i => (i === step.p ? 'p' : i === step.q ? 'q' : '')} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
