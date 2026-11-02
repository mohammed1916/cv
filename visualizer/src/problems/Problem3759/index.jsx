import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No element has been counted yet.' },
    { id: 'pick', label: 'Pick x', description: 'Choose an element to test.' },
    { id: 'compare', label: 'Compare', description: 'Scan every element for a strictly larger one.' },
    { id: 'check', label: 'Check', description: 'Compare the greater count with k.' },
    { id: 'count', label: 'Count', description: 'The element qualifies.' },
    { id: 'done', label: 'Result', description: 'Report the number of qualifying elements.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers 0 to 99) and k',
  url: 'https://leetcode.com/problems/count-elements-with-at-least-k-greater-values/',
  complexity: 'O(n^2) in this trace, which compares each element with every other element. Sorting would reduce it to O(n log n).',
  examples: [
    { label: 'Example', input: '{"nums":[1,2,3,4,5],"k":2}' },
    { label: 'k zero', input: '{"nums":[4,4,1],"k":0}' },
  ],
}

export default function CountElementsAtLeastKGreater() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.at >= 0 && step.at !== undefined && i === step.at ? 'compared' : '')} />
    <output aria-label="Count state">{`qualifying so far ${step.total}, greater ${step.greater ?? 0}`}</output>
  </>} renderReasoning={() => <>
    <p>An element qualifies when the number of values strictly greater than it reaches k.</p>
    <p>The trace counts that directly for each element, which keeps the rule visible.</p>
  </>} />
}
