import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty output list.' },
    { id: 'enter', label: 'Enter list', description: 'Descend into a nested list while depth remains.' },
    { id: 'emit', label: 'Emit', description: 'Append a value, or a list that is past the depth limit.' },
    { id: 'done', label: 'Complete', description: 'Report the flattened array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Nested array of integers and depth n (JSON object with arr and n)',
  url: 'https://leetcode.com/problems/flatten-deeply-nested-array/',
  complexity: 'O(total size) time and O(depth) recursion space. The visualization caps the input at 30 integers and depth 5.',
  examples: [
    { label: 'Depth 1', input: '{"arr":[1,[2,[3,[4]],5]],"n":1}' },
    { label: 'Depth 2', input: '{"arr":[1,[2,[3,[4]],5]],"n":2}' },
  ],
}

export default function FlattenDeeplyNestedArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Flattened output so far" length={step.output.length} valueAt={index => step.output[index]}
      active={step.output.length - 1} />
    <output aria-label="Depth">{`Depth remaining for this step: ${step.depth}. Input depth: ${run.input.n}`}</output>
  </>} renderReasoning={() => <>
    <p>A list is opened only while depth remains. Each opened list uses up one level, and a list that is still nested when depth runs out is kept as a single value.</p>
    <p>The output is built in order, so the result matches flattening the input to the same depth.</p>
  </>} />
}
