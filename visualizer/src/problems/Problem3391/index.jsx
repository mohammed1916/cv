import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HeapView from '../../components/shared/HeapView'
import OperationLog from '../../components/shared/OperationLog'
import LayerStackView from './LayerStackView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and calls, for example ["setCell",0,1,2] or ["largestMatrix"]',
  url: 'https://leetcode.com/problems/design-a-3d-binary-matrix-with-efficient-layer-tracking/',
  complexity: 'Setting or clearing is O(log m) for m heap entries. A query discards each out-of-date entry once, so it is O(log m) amortized. The visualization limits n to 6 and calls to 24; the class handles n up to 100.',
  examples: [
    { label: 'Tie, then an old entry', input: '{"n":3,"calls":[["setCell",2,0,1],["setCell",1,1,1],["setCell",1,2,2],["largestMatrix"],["setCell",2,2,0],["largestMatrix"],["unsetCell",2,2,0],["largestMatrix"]]}' },
    { label: 'Repeats and an empty grid', input: '{"n":2,"calls":[["largestMatrix"],["setCell",0,1,1],["setCell",0,1,1],["largestMatrix"],["unsetCell",0,1,1],["unsetCell",0,1,1],["largestMatrix"]]}' },
    { label: 'One layer only', input: '{"n":1,"calls":[["largestMatrix"],["setCell",0,0,0],["largestMatrix"]]}' },
    { label: 'Tie on count, then layer', input: '{"n":2,"calls":[["setCell",0,0,1],["setCell",1,1,0],["largestMatrix"]]}' },
    { label: 'Equal cells in one layer', input: '{"n":3,"calls":[["setCell",0,0,2],["setCell",1,0,2],["setCell",2,0,2],["largestMatrix"]]}' },
    { label: 'Largest grid, all cleared', input: '{"n":6,"calls":[["setCell",5,5,5],["unsetCell",5,5,5],["largestMatrix"]]}' },
    { label: 'Long run: 24 calls', input: '{"n":6,"calls":[["setCell",5,2,2],["largestMatrix"],["largestMatrix"],["largestMatrix"],["unsetCell",5,0,4],["setCell",5,4,5],["largestMatrix"],["largestMatrix"],["setCell",5,3,0],["setCell",5,0,0],["largestMatrix"],["setCell",5,3,3],["setCell",1,3,2],["largestMatrix"],["setCell",4,0,1],["largestMatrix"],["largestMatrix"],["unsetCell",1,1,2],["setCell",2,5,4],["largestMatrix"],["setCell",4,0,5],["setCell",0,1,2],["setCell",0,0,5],["setCell",3,0,0]]}' },
  ],
}

export default function Matrix3DLayerTracking() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <div style={{ display: 'grid', gap: 14 }}>
    <LayerStackView step={step} />
    <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'start' }}>
      {step.heap && <HeapView {...step.heap} />}
      <OperationLog title="Calls" ops={step.ops} current={step.current} through={step.current < 0 ? (step.phase === 'done' ? step.ops.length - 1 : -1) : step.current} />
    </div>
  </div>} renderReasoning={() => <>
    <p>Only one number per layer matters: how many 1s it holds. A count array answers updates at once, but scanning it on every query repeats work when queries are frequent.</p>
    <p>A heap keeps the leader on top, yet it cannot edit an entry deep inside it. So every change just pushes a new entry, and old ones are recognised later because their count no longer matches the true count. Each layer's newest entry is always correct, so the heap never runs out, and seeding every layer at 0 makes the empty grid answer n minus 1 with no special case.</p>
  </>} />
}
