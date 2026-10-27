import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty output list.' },
    { id: 'enter', label: 'Open array', description: 'Walk into a nested array before its siblings.' },
    { id: 'yield', label: 'Yield value', description: 'Emit a plain value in order.' },
    { id: 'done', label: 'Complete', description: 'All values have been yielded.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Nested array as JSON: {"arr": [...]}',
  url: 'https://leetcode.com/problems/nested-array-generator/',
  complexity: 'O(m) time for m values, plus the recursion depth. The visualization caps input at 30 values and 5 levels.',
  examples: [
    { label: 'Example 1', input: '{"arr":[1,2,3]}' },
    { label: 'Nested', input: '{"arr":[[1,2],3,[[4]]]}' },
  ],
}

export default function NestedArrayGenerator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Yielded values" length={step.output.length} valueAt={i => step.output[i]}
      active={step.output.length - 1} />
    <output aria-label="Current position">{`Depth ${step.depth}, path ${step.path}`}</output>
  </>} renderReasoning={() => <>
    <p>A generator with yield* hands control to each nested array in turn, so the values come out in the order they appear when read left to right.</p>
    <p>This visualization uses the same recursion but collects the values in a list so every yield can be inspected.</p>
  </>} />
}
