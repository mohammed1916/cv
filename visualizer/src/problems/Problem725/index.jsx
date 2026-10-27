import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ListPointerView from '../../components/shared/ListPointerView'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sizes', description: 'Work out the size of each part.' },
    { id: 'cut', label: 'Cut part', description: 'Take the next run of nodes as one part.' },
    { id: 'done', label: 'Complete', description: 'Return all parts, empty ones included.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'List and k (JSON object with values and k)',
  url: 'https://leetcode.com/problems/split-linked-list-in-parts/',
  complexity: 'O(n + k) time and O(k) space for the part heads.',
  examples: [
    { label: 'Uneven', input: '{"values":[1,2,3],"k":5}' },
    { label: 'Even', input: '{"values":[1,2,3,4,5,6,7,8,9,10],"k":3}' },
  ],
}

export default function SplitLinkedList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    {step.view && <ListPointerView {...step.view} />}
    {step.parts.length === 0 ? <p>Sizing parts…</p> : step.parts.map((part, p) => <LinkedListLane key={p} title={`Part ${p}`} nodes={part.map((value, id) => ({ id: `${p}-${id}`, value }))}
      note={`${part.length} node${part.length === 1 ? '' : 's'}`} />)}
    {step.phase === 'done' && <output aria-label="Parts">{step.sizes.join(', ')}</output>}
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Sizes:</strong> {run.input.k} parts of {Math.floor(run.input.values.length / run.input.k)} or one more node each.</p>
  </>} />
}
