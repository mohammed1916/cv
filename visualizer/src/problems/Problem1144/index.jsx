import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

function ValuesView({ snapshot }) {
  const { nums, index, roles } = snapshot
  return <div style={{ overflowX: 'auto' }}>
    <table aria-label="Array values">
      <thead><tr>{nums.map((_, i) => <th key={i} scope="col">{i}</th>)}</tr></thead>
      <tbody>
        <tr>{nums.map((value, i) => <td key={i} style={{
          padding: '6px 10px', textAlign: 'center', border: '1px solid #94a3b8',
          background: i === index ? '#0891b2' : 'transparent', fontWeight: roles?.[i] === 'valley' ? 700 : 400,
        }}>{value}</td>)}</tr>
        {roles && <tr>{roles.map((role, i) => <td key={i} style={{ textAlign: 'center', fontSize: 12 }}>{role}</td>)}</tr>}
      </tbody>
    </table>
  </div>
}

export default function ZigzagDecrementsVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <ValuesView snapshot={step.snapshot} />
      <output aria-label="Running cost">Cost of this pattern so far: {step.snapshot.total ?? 0}</output>
    </>}
    renderReasoning={() => <p>Valleys never sit next to each other, so each valley only needs to stay below its own neighbours. Price each pattern separately and keep the cheaper one.</p>} />
}
