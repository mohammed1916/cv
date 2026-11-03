import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

function BitsView({ snapshot }) {
  const { bits, start, ones } = snapshot
  return <div style={{ overflowX: 'auto' }}>
    <table aria-label="Binary array window">
      <thead><tr>{bits.map((_, i) => <th key={i} scope="col">{i}</th>)}</tr></thead>
      <tbody><tr>{bits.map((bit, i) => {
        const inWindow = start !== null && start !== undefined && i >= start && i < start + ones
        return <td key={i} style={{
          padding: '6px 10px', textAlign: 'center', border: '1px solid #94a3b8',
          background: inWindow ? '#a5f3fc' : 'transparent', fontWeight: bit ? 700 : 400,
        }}>{bit}</td>
      })}</tr></tbody>
    </table>
  </div>
}

export default function MinimumSwapsVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <BitsView snapshot={step.snapshot} />
      <output aria-label="Ones inside window">Ones inside the window: {step.snapshot.inside ?? '-'}</output>
    </>}
    renderReasoning={() => <p>The final block is as wide as the number of ones. Each zero inside the chosen block has to be exchanged with a one from outside, so the best block is the window that already holds the most ones.</p>} />
}
