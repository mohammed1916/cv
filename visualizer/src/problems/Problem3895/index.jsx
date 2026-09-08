import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'
const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'Numbers and target digit (JSON object)',
  url: 'https://leetcode.com/problems/count-digit-appearances/',
  complexity: 'O(D) time for D total decimal digits, O(1) solver extra space. The visualization retains O(D) compact events and O(n) per-number counts.',
  phases: [
    { id: 'start', label: 'Input', description: 'Initialize the total occurrence count.' },
    { id: 'number', label: 'Next number', description: 'Load a number and reset its local contribution.' },
    { id: 'extract', label: '% 10 / divide', description: 'Inspect the rightmost digit, count a match, then remove it.' },
    { id: 'finish', label: 'Number complete', description: 'The quotient is zero, so no digits remain.' },
    { id: 'done', label: 'Return total', description: 'Return all occurrences, not merely the number of matching elements.' },
  ],
  examples: [
    { label: 'Repeated twos', input: '{"nums":[12,54,32,22],"digit":2}' },
    { label: 'Absent digit', input: '{"nums":[1,34,7],"digit":9}' },
    { label: 'Trailing zeros', input: '{"nums":[1000000,10,101],"digit":0}' },
    { label: 'All digits match', input: '{"nums":[777777,7],"digit":7}' },
  ],
}
export default function CountDigitAppearances() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const digits = step.index < 0 ? '' : String(run.input[step.index])
    const active = step.phase === 'extract' ? digits.length - 1 - step.position : -1
    return <>
      <p>Target digit: {run.digit}</p>
      <IndexedSequence label="Input numbers" length={run.input.length} active={step.index} valueAt={i => run.input[i]} />
      {digits && <IndexedSequence label="Current number digits (processed right to left)" length={digits.length} active={active}
        valueAt={i => digits[i]} roleAt={i => step.phase === 'finish' || step.phase === 'extract' && i >= active ? Number(digits[i]) === run.digit ? 'counted' : 'removed' : 'pending'} />}
      <IndexedSequence label="Contributions by input index" length={run.input.length} active={step.index}
        valueAt={i => step.phase === 'done' || i < step.index ? run.counts[i] : i === step.index ? step.local : '?'} />
      {step.phase === 'extract' && <table><caption>Current arithmetic extraction</caption><tbody>
        <tr><th>Before</th><td>{step.before}</td></tr><tr><th>Remainder % 10</th><td>{step.extracted}</td></tr>
        <tr><th>Remaining quotient // 10</th><td>{step.remaining}</td></tr><tr><th>Current number count</th><td>{step.local}</td></tr>
      </tbody></table>}
      <output aria-label="Digit occurrence count">{step.phase === 'done' ? 'Total occurrences' : 'Count so far'}: {step.total}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each loop removes exactly one real decimal digit. Repeated matching digits in one number contribute separately.</p>
    <p>A zero remainder counts when the target is zero. A zero quotient ends the loop; it is not an additional leading zero. Input numbers are positive under this problem's constraints.</p>
  </>} />
}
