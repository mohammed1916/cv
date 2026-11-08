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
    { label: 'Single value equals pivot', input: '{"nums":[4],"pivot":4}' },
    { label: 'Equal values keep order', input: '{"nums":[1,5,5,1],"pivot":5}' },
    { label: 'Extreme values at the pivot', input: '{"nums":[-100,100,0,-100,100],"pivot":-100}' },
    { label: 'Pivot below every value', input: '{"nums":[3,4],"pivot":0}' },
    { label: 'Long run: 30 values', input: '{"nums":[-78,-74,85,-17,43,99,-59,-44,80,41,67,47,-39,100,99,-44,35,44,50,-82,10,91,-61,83,92,50,-54,-87,-62,64],"pivot":0}' },
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
