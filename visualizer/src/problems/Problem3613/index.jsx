import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WeightedGraphView from '../../components/shared/WeightedGraphView'
import DisjointSetView from '../../components/shared/DisjointSetView'
import ComponentLedger from './ComponentLedger'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function MinimizeMaximumComponentCost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <div style={{ display: 'grid', gap: 12 }}>
    <ComponentLedger step={step} />
    {step.wgraph && <WeightedGraphView {...step.wgraph} />}
    {step.dsu && <DisjointSetView {...step.dsu} />}
  </div>} renderReasoning={() => <>
    <p>Only the single largest cost matters, and that is the heaviest edge kept anywhere. So fix a weight limit: keep every edge up to it and see whether the component count is within k.</p>
    <p>Raising the limit can only merge more, so the smallest working limit can be found by adding edges from lightest to heaviest. The moment the count reaches k, the edge just added is the answer.</p>
    <p>An edge inside one component can stay without changing the answer, because it was lighter than the current edge, but it does not reduce the count.</p>
  </>} />
}
