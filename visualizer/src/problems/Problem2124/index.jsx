import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2124',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'String of a and b letters',
  url: 'https://leetcode.com/problems/check-if-all-as-appears-before-all-bs/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Ordered', input: 'aaabbb' },
    { label: 'Out of order', input: 'abab' },
    { label: 'Only b', input: 'bb' },
  ],
}

export default function Problem2124Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`Letters of ${run.input.s}`} length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.i} roleAt={i => step.marks[i] ?? (step.seenB && i < step.i ? 'after first b' : '')} />
          <p>{step.seenB ? 'A b has been seen; a later a would fail.' : 'No b seen yet.'}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
