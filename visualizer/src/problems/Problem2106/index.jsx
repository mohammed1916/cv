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
    { label: 'Too far', input: '{"fruits":[[1,5],[9,4]],"startPos":0,"k":2}' }, { label: "Single fruit at start", input: "{\"fruits\":[[0,1]],\"startPos\":0,\"k\":0}" }, { label: "Equal distance both ways", input: "{\"fruits\":[[3,5],[7,5]],\"startPos\":5,\"k\":2}" }, { label: "Edges of the line", input: "{\"fruits\":[[0,4],[60,4]],\"startPos\":30,\"k\":60}" }, { label: "Long run: 20 fruits", input: "{\"fruits\":[[0,9],[4,5],[5,4],[6,7],[7,5],[8,5],[11,7],[12,3],[13,6],[15,5],[18,8],[20,9],[23,9],[24,5],[25,8],[27,9],[28,3],[29,2],[30,7],[35,1]],\"startPos\":30,\"k\":60}" },
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
