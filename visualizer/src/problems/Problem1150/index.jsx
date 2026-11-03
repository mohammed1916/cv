import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

function SearchView({ snapshot }) {
  const { nums, target, lo, hi, mid } = snapshot
  return <div style={{ overflowX: 'auto' }}>
    <p>Target: {target} · Search window: [{lo}, {hi})</p>
    <table aria-label="Sorted array search">
      <thead><tr>{nums.map((_, i) => <th key={i} scope="col">{i}</th>)}</tr></thead>
      <tbody><tr>{nums.map((value, i) => {
        const inWindow = i >= lo && i < hi
        return <td key={i} style={{
          padding: '6px 10px', textAlign: 'center', border: '1px solid #94a3b8',
          background: i === mid ? '#0891b2' : inWindow ? '#a5f3fc' : 'transparent',
          opacity: inWindow ? 1 : 0.45,
        }}>{value}</td>
      })}</tr></tbody>
    </table>
  </div>
}

export default function MajorityElementVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <SearchView snapshot={step.snapshot} />}
    renderReasoning={() => <p>Copies of the target form one block in a sorted array. Two binary searches find the block's edges, and the block's width decides whether it is more than half.</p>} />
}
