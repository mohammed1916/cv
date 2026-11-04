import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function ParityView({ step }) {
  return <div>
    <div aria-label="Values by parity" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {step.nums.map((v, i) => {
        const current = i === step.index
        const done = i < step.index
        return <span key={i} style={{ padding: '6px 10px', border: `2px solid ${current ? 'var(--primary)' : 'currentColor'}`, borderRadius: 4, opacity: done || current ? 1 : 0.5, background: v % 2 ? 'rgba(37,99,235,0.2)' : 'transparent' }}>
          {v}{v % 2 ? ' odd' : ' even'}
        </span>
      })}
    </div>
    <p>Odd numbers in prefix: {step.odd} · Target k: {step.k} · Answer so far: {step.answer}</p>
    <table>
      <thead><tr><th scope="col">Odd count in an earlier prefix</th><th scope="col">Prefixes</th></tr></thead>
      <tbody>{step.seen.map(row => <tr key={row.count} style={{ fontWeight: row.count === step.odd - step.k ? 700 : 400 }}>
        <td>{row.count}</td><td>{row.times}</td>
      </tr>)}</tbody>
    </table>
  </div>
}

export default function NiceSubarraysVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <ParityView step={step} />}
    renderReasoning={() => <p>Only parity matters, so each value becomes 1 for odd or 0 for even. A subarray has exactly k odd numbers when two prefix odd-counts differ by k, so earlier prefixes are counted in a table.</p>} />
}
