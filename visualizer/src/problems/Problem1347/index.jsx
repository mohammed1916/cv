import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, phases, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two words (JSON object with s and t)',
  complexity: 'O(n + 26) time and O(26) space. Each letter is counted once.',
  examples: [
    { label: 'Mixed', input: '{"s":"bab","t":"aba"}' },
    { label: 'Equal letters', input: '{"s":"abcd","t":"dcba"}' },
    { label: 'Disjoint', input: '{"s":"aabbcc","t":"xxyyzz"}' },
  ],
}

function LetterTable({ snapshot }) {
  const letters = [...'abcdefghijklmnopqrstuvwxyz'].filter(c => snapshot.countS[c] || snapshot.countT[c])
  return <table className="algorithm-count-table">
    <thead><tr><th>Letter</th><th>In s</th><th>In t</th><th>Surplus in t</th></tr></thead>
    <tbody>{letters.map(c => {
      const surplus = Math.max(0, snapshot.countT[c] - snapshot.countS[c])
      return <tr key={c} aria-current={snapshot.letter === c ? 'step' : undefined}>
        <td>{c}</td><td>{snapshot.countS[c]}</td><td>{snapshot.countT[c]}</td><td>{surplus}</td>
      </tr>
    })}</tbody>
  </table>
}

export default function MinimumStepsAnagram() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <LetterTable snapshot={step.snapshot} />
      <p>Steps so far: <strong>{step.snapshot.steps}</strong></p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
