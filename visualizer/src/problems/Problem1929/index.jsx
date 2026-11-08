import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1929',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array (e.g. [2,5,2])',
  url: 'https://leetcode.com/problems/concatenation-of-array/',
  complexity: 'O(n) time and O(n) space for the 2n output values.',
  examples: [
    { label: 'Three values', input: '[2,5,2]' },
    { label: 'Single value', input: '[7]' },
    { label: 'Extreme values', input: '[-1000,1000]' },
    { label: 'Equal values, ten items', input: '[4,4,4,4,4,4,4,4,4,4]' },
    { label: 'Long run: 10 values', input: '[-399,-301,803,959,792,413,-39,115,-813,472]' },
  ],
}

export default function Problem1929Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="Input nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
        active={step.i} roleAt={i => (i === step.i ? 'l' : '')} />
      <IndexedSequence label="Answer ans (first half, then copy)" length={step.ans.length} valueAt={i => (step.ans[i] ?? '·')}
        active={step.i >= 0 ? step.i + run.input.nums.length : -1} roleAt={i => (step.ans[i] !== null ? 'written' : '')} />
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
