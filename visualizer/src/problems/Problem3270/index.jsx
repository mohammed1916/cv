import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pad', description: 'Pad each number to four digits.' },
    { id: 'digit', label: 'Position', description: 'Take the smallest digit at this position.' },
    { id: 'done', label: 'Result', description: 'Report the key.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num1, num2 and num3 (integers from 1 to 9999)',
  url: 'https://leetcode.com/problems/find-the-key-of-the-numbers/',
  complexity: 'O(1) time and space, since every number has at most four digits.',
  examples: [
    { label: 'Example', input: '{"num1":452,"num2":61,"num3":7}' },
    { label: 'Leading zeros', input: '{"num1":9,"num2":999,"num3":42}' },
    { label: 'Single digit ones', input: '{"num1":1,"num2":1,"num3":1}' },
    { label: 'Equal numbers', input: '{"num1":1234,"num2":1234,"num3":1234}' },
    { label: 'Largest values', input: '{"num1":9999,"num2":9000,"num3":9999}' },
    { label: 'Zero-padded pattern', input: '{"num1":10,"num2":100,"num3":1000}' },
  ],
}

export default function FindTheKeyOfTheNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Padded digits by position" className="algorithm-digit-table">
      <tbody>{step.digits.map((row, r) => <tr key={r}>{[...row].map((ch, c) => <td key={c} style={{ padding: '2px 8px', color: 'var(--text)', background: c === step.position ? 'var(--primary)' : 'transparent', border: '1px solid var(--text-muted)' }}>{ch}</td>)}</tr>)}</tbody>
    </table>
    <IndexedSequence label="key digits" length={4} valueAt={i => (i < step.key.length ? step.key[i] : '·')} active={step.position} />
    <output aria-label="Key so far">{`padded: ${step.digits.join(' | ')}, key: ${step.key || 'empty'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each number is padded to four digits so that the positions line up.</p>
    <p>At each position the smallest digit among the three numbers is the digit of the key there.</p>
  </>} />
}
