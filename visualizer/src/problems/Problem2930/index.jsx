import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No letters placed yet.' },
    { id: 'position', label: 'Next letter', description: 'Each position moves the counts toward leet.' },
    { id: 'done', label: 'Complete', description: 'Report the strings that can be rearranged to contain leet.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String length n (integer 1 to 40)',
  url: 'https://leetcode.com/problems/number-of-strings-which-can-be-rearranged-to-contain-substring/',
  complexity: 'O(n * 12) time for the 12 capped states, and O(1) space. The visualization caps n at 40.',
  examples: [
    { label: 'Length 4', input: '4' },
    { label: 'Length 10', input: '10' },
    { label: 'Single letter', input: '1' },
    { label: 'Length 3', input: '3' },
    { label: 'Upper limit', input: '40' },
    { label: 'Long run: length 37', input: '37' },
  ],
}

export default function LeetRearrange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Step">{step.message}</output>
    <p aria-label="Current count">Strings that contain l, e, e, t so far: {step.ways}</p>
    {step.dp && <table aria-label="Capped count states" style={{ borderCollapse: "collapse", color: "var(--text)" }}>
      <thead><tr><th scope="col">l used (max 1)</th><th scope="col">e used (max 2)</th><th scope="col">t used (max 1)</th><th scope="col">strings in this state</th></tr></thead>
      <tbody>{[0, 1].flatMap(l => [0, 1, 2].flatMap(e => [0, 1].map(t => {
        const value = step.dp[(l * 3 + e) * 2 + t]
        return <tr key={`${l}${e}${t}`} data-active={value > 0} style={{ opacity: value > 0 ? 1 : 0.5 }}>
          <td style={{ padding: "2px 8px" }}>{l}</td><td style={{ padding: "2px 8px" }}>{e}</td><td style={{ padding: "2px 8px" }}>{t}</td><td style={{ padding: "2px 8px" }}>{value}</td>
        </tr>
      })))}</tbody>
    </table>}
  </>} renderReasoning={() => <>
    <p>A string can be rearranged to contain leet exactly when it has at least one l, two e, and one t.</p>
    <p>The counts above the requirement do not matter, so each count is capped, which keeps the state space at 12.</p>
  </>} />
}
