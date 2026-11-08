import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1920',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON permutation of 0 to n - 1 (e.g. [3,0,1,2])',
  url: 'https://leetcode.com/problems/build-array-from-permutation/',
  complexity: 'O(n) time and O(n) space for the output array.',
  examples: [
    { label: 'Four values', input: '[3,0,1,2]' },
    { label: 'Shuffled', input: '[4,2,0,1,3]' },
    { label: 'Single value', input: '[0]' },
    { label: 'Two values swapped', input: '[1,0]' },
    { label: 'Identity order', input: '[0,1,2,3]' },
    { label: 'Long run: 12 shuffled values', input: '[8,6,0,1,3,7,4,11,2,9,10,5]' },
  ],
}

export default function Problem1920Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="Input permutation nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
        active={step.i} roleAt={i => (i === step.i ? 'l' : i === step.target ? 'r' : '')} />
      <IndexedSequence label="Answer ans" length={step.ans.length} valueAt={i => (step.ans[i] ?? '·')}
        active={step.i} roleAt={i => (step.ans[i] !== null ? 'written' : '')} />
      <p>Blue outline (l) is the position being filled; the other outline (r) is the position nums[i] points to.</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
