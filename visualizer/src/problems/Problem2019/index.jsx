import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2019',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Expression and student answers (JSON)',
  url: 'https://leetcode.com/problems/the-score-of-students-solving-math-expression/',
  complexity: 'Interval DP over the operands: O(m^3) pairings, with value sets that stay small for single digits here.',
  examples: [
    { label: 'Mixed operators', input: '{"s":"4+2*3","answers":[10,14,8,0]}' },
    { label: 'Five plus one times two', input: '{"s":"5+1*2","answers":[7,12,0]}' },
  ],
}

export default function ScoreOfStudents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { s, answers, correct, wrongOrder, grade, points } = step.snapshot
    return <>
      <p>Expression <strong>{s}</strong>; correct value <strong>{correct}</strong>.</p>
      <div aria-label="Values reachable in wrong orders" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {wrongOrder.length ? wrongOrder.map(v => <span key={v} style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', color: 'var(--text)' }}>{v}</span>) : <em style={{ color: 'var(--text-muted)' }}>not computed yet</em>}
      </div>
      <table aria-label="Answers and points" style={{ borderCollapse: 'collapse', marginTop: 8, color: 'var(--text)' }}>
        <tbody>{answers.map((a, i) => {
          const pts = grade ? grade[i] : null
          return <tr key={i}>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px', fontFamily: 'monospace' }}>{a}</td>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{pts === null ? '' : `${pts} point${pts === 1 ? '' : 's'}`}</td>
          </tr>
        })}</tbody>
      </table>
      {points !== null && <p>Total points: <strong>{points}</strong>.</p>}
    </>
  }} renderReasoning={() => <p>Points go to the correct answer first. Any answer reachable by applying the operators in some other order earns 2 points, which is found by combining neighbouring groups in every possible way.</p>} />
}
