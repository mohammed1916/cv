import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Leaf values (JSON array)',
  url: 'https://leetcode.com/problems/minimum-cost-tree-from-leaf-values/',
  complexity: 'O(n) time and O(n) space for n leaves. The visualization caps n at 30.',
  examples: [
    { label: 'Mixed', input: '[6,2,4]' },
    { label: 'Two leaves', input: '[4,11]' },
    { label: 'Equal leaves', input: '[5,5,5]' },
  ],
}

export default function MinimumCostTreeFromLeaves() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const s = step.snapshot
      return <div style={{ display: 'grid', gap: 12 }}>
        <div aria-label="Leaves"><strong>Leaves:</strong> {run.input.map((v, i) => <span key={i} style={{ marginRight: 8, fontWeight: i === s.index ? 700 : 400 }}>{v}</span>)}</div>
        <StackLane title="Stack (bottom to top)" items={s.stack} dropped={s.dropped} note={s.mid !== undefined ? `${s.mid} × ${s.neighbour} joined` : undefined} />
        <p>Total nonleaf cost so far: <strong>{s.total}</strong></p>
      </div>
    }}
    renderReasoning={({ step }) => <p>{step.snapshot.mid !== undefined
      ? 'A leaf no larger than its right neighbour can only be the middle of a cheapest join with its smaller neighbour, so it is removed here.'
      : 'The stack keeps leaves in decreasing order, so every leaf still in it is a candidate for a later join.'}</p>} />
}
