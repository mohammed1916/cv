import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, pythonLineMap, phases, parseInput, buildTrace } from './algorithm'

const definition = {
  number: '117',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON array in level order, null for a missing child',
  url: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/description/',
  complexity: 'O(n) time and O(w) extra space for n nodes and maximum width w. The visualization caps the tree at 30 nodes.',
  question: "Connect each node of a binary tree to its right neighbour on the same level, for a tree with arbitrary shape.",
  approaches: [
    { name: "Level-order with dummy head", intuition: "Walk each level as a linked list and link the next pointers while building the next level.", time: "O(n)", space: "O(w)" },
    { name: "Linked-list traversal", intuition: "Use already connected next pointers on the previous level to avoid a queue.", time: "O(n)", space: "O(1)" },
  ],
  examples: [
    { label: 'Uneven tree', input: '[4,2,9,1,null,null,6,3]' },
    { label: 'Gap in the middle', input: '[5,3,8,1,null,null,9]' },
    { label: 'Single node', input: '[7]' },
    { label: 'Equal values on every level', input: '[2,2,2,2,2,2,2]' },
    { label: 'Boundary values with gaps', input: '[99,-99,99,null,null,-99,99]' },
    { label: 'Long run: 30 nodes', input: '[79,35,12,7,26,8,33,69,62,73,96,68,42,5,30,11,42,71,53,27,30,5,7,10,42,32,94,42,89,73]' },
  ],
}

export default function PopulatingNextRightPointersIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const snap = step.snapshot
        const queued = new Set(snap.queue)
        const linkTextFor = id => {
          const linkedTo = Object.prototype.hasOwnProperty.call(snap.next, id) ? snap.next[id] : undefined
          const linkText = linkedTo === undefined ? 'not linked yet' : linkedTo === null ? 'next: null' : `next: ${run.input.nodes[linkedTo].value}`
          return queued.has(id) ? `queued, ${linkText}` : linkText
        }
        return <>
          {run.input.levels.map((ids, depth) => (
            <IndexedSequence key={depth} label={`Level ${depth}`} length={ids.length}
              active={ids.indexOf(snap.current)}
              valueAt={i => run.input.nodes[ids[i]].value}
              roleAt={i => linkTextFor(ids[i])} />
          ))}
        </>
      }}
      renderReasoning={({ step }) => <p>Nodes waiting in the queue: {step.snapshot.queue.length}.</p>}
    />
  )
}
