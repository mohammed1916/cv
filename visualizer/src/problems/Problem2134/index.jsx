import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2134',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Circular array of 0s and 1s as JSON',
  url: 'https://leetcode.com/problems/minimum-swaps-to-group-all-1s-together-ii/',
  complexity: 'O(n) time with a sliding window over the circle; O(1) extra space.',
  examples: [
    { label: 'Wraps around', input: '[1,0,1,0,1,0,0,1]' },
    { label: 'Already grouped', input: '[0,1,1,1,0]' },
  ],
}

export default function Problem2134Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Circular array (window l to r, wrapping)" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.l >= 0 ? step.l : -1} roleAt={i => (i === step.l ? 'l' : i === step.r ? 'r' : '')} />
          <p>Ones inside: {step.inside} · best: {step.best}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
