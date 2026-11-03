import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
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
  examples: [
    { label: 'Uneven tree', input: '[4,2,9,1,null,null,6,3]' },
    { label: 'Gap in the middle', input: '[5,3,8,1,null,null,9]' },
    { label: 'Single node', input: '[7]' },
  ],
}

export default function PopulatingNextRightPointersIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const snap = step.snapshot
        const queued = new Set(snap.queue)
        return <section className="algorithm-sequence" aria-label="Tree levels">
          <h3>Levels</h3>
          {run.input.levels.map((ids, depth) => (
            <div key={depth} className="algorithm-sequence__cells" aria-label={`Level ${depth}`}>
              {ids.map(id => {
                const node = run.input.nodes[id]
                const linkedTo = Object.prototype.hasOwnProperty.call(snap.next, id) ? snap.next[id] : undefined
                const linkText = linkedTo === undefined ? 'not linked yet' : linkedTo === null ? 'next: null' : `next: ${run.input.nodes[linkedTo].value}`
                return <div key={id} className={`algorithm-sequence__cell ${snap.current === id ? 'is-active' : ''}`}
                  data-role={queued.has(id) ? 'queued' : ''} data-index={id}>
                  <small>node {id}</small><strong>{node.value}</strong><span>{linkText}</span>
                </div>
              })}
            </div>
          ))}
        </section>
      }}
      renderReasoning={({ step }) => <p>Nodes waiting in the queue: {step.snapshot.queue.length}.</p>}
    />
  )
}
