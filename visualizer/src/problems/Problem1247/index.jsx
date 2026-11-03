import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function PairView({ step }) {
  const cellStyle = (i, mismatchColor) => ({
    background: step.position === i ? 'rgba(8,145,178,0.35)' : mismatchColor ?? 'transparent',
    border: '1px solid currentColor', padding: '4px 8px',
  })
  return <div>
    <table aria-label="Strings compared by position">
      <tbody>
        <tr><th scope="row">First</th>{[...step.s1].map((ch, i) => <td key={i} style={cellStyle(i, ch !== step.s2[i] ? (ch === 'x' ? 'rgba(220,38,38,0.25)' : 'rgba(37,99,235,0.25)') : null)}>{ch}</td>)}</tr>
        <tr><th scope="row">Second</th>{[...step.s2].map((ch, i) => <td key={i} style={cellStyle(i, null)}>{ch}</td>)}</tr>
      </tbody>
    </table>
    <p>xy mismatches: {step.xy} · yx mismatches: {step.yx} · Swaps: {step.swaps}</p>
    {step.verdict === 'impossible' && <p role="status">The total number of mismatches is odd, so the strings cannot be made equal.</p>}
  </div>
}

export default function MinimumSwapsVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <PairView step={step} />}
    renderReasoning={() => <p>A swap across the strings can fix two mismatches that point the same way with one move. Two leftover mismatches pointing in opposite directions need two swaps. An odd total cannot be fixed at all.</p>} />
}
