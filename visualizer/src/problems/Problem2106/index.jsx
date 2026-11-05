import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2106',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with fruits, startPos and k',
  url: 'https://leetcode.com/problems/maximum-fruits-harvested-after-at-most-k-steps/',
  complexity: 'O(n) time after sorting-free input (positions are already increasing), using prefix sums and two pointers; O(n) space for prefix sums.',
  examples: [
    { label: 'Go left then right', input: '{"fruits":[[1,4],[3,2],[7,5]],"startPos":4,"k":3}' },
    { label: 'Only one side', input: '{"fruits":[[0,9],[4,1],[5,7],[10,2]],"startPos":4,"k":6}' },
    { label: 'Too far', input: '{"fruits":[[1,5],[9,4]],"startPos":0,"k":2}' },
  ],
}

export default function Problem2106Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`Fruit positions (start ${run.input.startPos}, budget ${run.input.k})`} length={run.input.fruits.length} valueAt={i => `x=${run.input.fruits[i][0]}: ${run.input.fruits[i][1]}`} active={step.i} roleAt={i => step.marks[i] ?? ''} />
          <p>Cost of the current stretch: {step.cost ?? '–'} · best so far: {step.best}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
