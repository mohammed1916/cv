import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2161',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with nums and pivot',
  url: 'https://leetcode.com/problems/partition-array-according-to-given-pivot/',
  complexity: 'O(n) time with three buckets; O(n) extra space.',
  examples: [
    { label: 'Equal and both sides', input: '{"nums":[4,-2,8,4,0,-5],"pivot":4}' },
    { label: 'Nothing equal', input: '{"nums":[3,9,1],"pivot":5}' },
  ],
}

export default function Problem2161Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`Input (pivot ${run.input.pivot})`} length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.i} roleAt={() => ''} />
          <IndexedSequence label="Smaller, equal and larger groups (in order)" length={step.smaller.length + step.equal.length + step.larger.length} valueAt={i => [...step.smaller, ...step.equal, ...step.larger][i]} active={-1} roleAt={i => (i < step.smaller.length ? 'smaller' : i < step.smaller.length + step.equal.length ? 'equal' : 'larger')} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
