import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2111',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with arr and k',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-the-array-k-increasing/',
  complexity: 'O(n log(n / k)) time overall, since each class is handled with binary search over its tails; O(n) space.',
  examples: [
    { label: 'Two classes', input: '{"arr":[3,1,2,5,4,4],"k":2}' },
    { label: 'Already sorted by class', input: '{"arr":[1,2,3,4],"k":2}' },
    { label: 'Single class', input: '{"arr":[5,4,3,2,1],"k":1}' },
  ],
}

export default function Problem2111Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`Array (class ${step.group >= 0 ? step.group : '–'} highlighted)`} length={run.input.arr.length} valueAt={i => run.input.arr[i]} active={-1} roleAt={i => step.marks[i] ?? ''} />
          <IndexedSequence label="Tails of the kept values in this class" length={step.tails.length} valueAt={i => step.tails[i]} active={step.mid ?? -1} roleAt={i => (i === step.lo ? 'lo' : i === step.hi ? 'hi' : '')} />
          <p>Changes so far: {step.operations}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
