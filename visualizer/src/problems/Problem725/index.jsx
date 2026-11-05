import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sizes', description: 'Work out the base size and the extra nodes.' },
    { id: 'cut', label: 'Cut part', description: 'Take the next run of nodes as one part.' },
    { id: 'done', label: 'Complete', description: 'Return all parts, empty ones included.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'values and k (JSON object)',
  url: 'https://leetcode.com/problems/split-linked-list-in-parts/',
  complexity: 'O(n + k) time for the walk and the cuts; the parts reuse the existing nodes.',
  examples: [
    { label: 'Uneven', input: '{"values":[4,8,15,16,23],"k":2}' },
    { label: 'Empty tail', input: '{"values":[7,7,7],"k":4}' },
    { label: 'Even', input: '{"values":[1,3,5,7,9,11],"k":3}' },
  ],
}

export default function SplitLinkedList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="List nodes (the part being cut is marked)" length={run.input.values.length} active={step.cuts?.[0] ?? -1}
      valueAt={i => run.input.values[i]}
      roleAt={i => (step.cuts && i >= step.cuts[0] && i < step.cuts[1] ? 'part ' + step.part : '')} />
    <ol aria-label="Parts so far">{step.parts.map((part, index) => <li key={index}>{`Part ${index}: [${part.join(', ')}]`}</li>)}</ol>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Every part gets the same base size. The first remainder parts take one extra node so sizes differ by at most one and the earlier parts are never smaller.</p>
    <p>Parts are consecutive runs in the original order, and when there are more parts than nodes the trailing parts are empty.</p>
  </>} />
}
