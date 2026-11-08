import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2104',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array as JSON (e.g. [1,3,2])',
  url: 'https://leetcode.com/problems/sum-of-subarray-ranges/',
  complexity: 'O(n) time and O(n) space with monotonic stacks; the visualization draws the boundaries of each element.',
  examples: [
    { label: 'Short array', input: '[1,3,2]' },
    { label: 'Repeated values', input: '[4,4,-1,2]' },
    { label: 'Descending', input: '[5,4,3]' }, { label: "Single value", input: "[5]" }, { label: "Equal values", input: "[2,2,2]" }, { label: "Extreme values", input: "[1000,-1000,0]" }, { label: "Long run: 30 values", input: "[-664,274,-590,890,688,711,-171,768,763,987,37,668,964,560,-954,57,-181,-222,860,-459,-356,-832,100,202,389,-823,656,-833,-535,540]" },
  ],
}

export default function Problem2104Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Array with the span boundaries" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={Object.keys(step.marks).map(Number).find(k => step.marks[k] === 'current') ?? -1} roleAt={i => step.marks[i] === 'current' ? 'current' : step.marks[i] === 'l' ? 'left l' : step.marks[i] === 'r' ? 'right r' : ''} />
          <p>Running sum of this pass: {step.subtotal}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
