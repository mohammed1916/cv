import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'
const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'Number n and digit x (JSON object)',
  url: 'https://leetcode.com/problems/valid-digit-number/',
  complexity: 'O(d) time and space for d decimal digits. The official input has at most six digits.',
  phases: [
    { id: 'start', label: 'Decimal input', description: 'Convert the number to its decimal digits.' },
    { id: 'scan', label: 'Find target', description: 'Track whether any scanned digit matches x.' },
    { id: 'leading', label: 'Check first digit', description: 'The leading digit must differ from x.' },
    { id: 'done', label: 'AND / return', description: 'Both conditions must pass.' },
  ],
  examples: [
    { label: 'Valid zero inside', input: '{"n":101,"x":0}' },
    { label: 'Leading match', input: '{"n":232,"x":2}' },
    { label: 'Target absent', input: '{"n":5,"x":1}' },
    { label: 'Number zero', input: '{"n":0,"x":0}' },
  ],
}
export default function ValidDigitNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>Target digit: {run.target}. Index 0 is the leading digit.</p>
    <IndexedSequence label="Decimal digits" length={run.input.length} active={step.index} valueAt={i => run.input[i]}
      roleAt={i => step.phase === 'start' || step.phase === 'scan' && i > step.index ? 'unscanned' : run.input[i] === run.target ? 'match' : 'different'} />
    <table><caption>Two required conditions</caption><thead><tr><th>Condition</th><th>State</th></tr></thead><tbody>
      <tr><th>Contains target</th><td>{step.phase === 'start' ? 'Not checked' : step.phase === 'scan' && !step.found ? 'Not found so far' : String(step.found)}</td></tr>
      <tr><th>First digit differs</th><td>{step.leading === null ? 'Not checked' : String(step.leading)}</td></tr>
    </tbody></table>
    {step.phase === 'done' && <output aria-label="Valid digit result">Valid: {String(run.result)}</output>}
  </>} renderReasoning={() => <>
    <p>A later occurrence cannot repair a leading match. Conversely, a different first digit is not enough if the target never appears.</p>
    <p>For n = 0 and x = 0, the target is present but it is also the leading digit, so the answer is false.</p>
  </>} />
}
