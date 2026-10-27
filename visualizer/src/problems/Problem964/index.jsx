import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Base x', description: 'Write the target in base x, least significant digit first.' },
    { id: 'digit', label: 'Digit', description: 'Choose the cheaper cover for this digit: plain copies or borrowing from the next power.' },
    { id: 'tail', label: 'Top borrow', description: 'Finish any borrow still pending above the highest digit.' },
    { id: 'done', label: 'Complete', description: 'Report the least number of operators.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with x and target (JSON)',
  url: 'https://leetcode.com/problems/least-operators-to-express-number/',
  complexity: 'O(log target) time and O(1) extra space: one step per base-x digit.',
  examples: [
    { label: 'Example 1', input: '{"x":3,"target":19}' },
    { label: 'Example 2', input: '{"x":5,"target":501}' },
    { label: 'Power of x', input: '{"x":2,"target":12}' },
  ],
}

export default function LeastOperatorsExpressNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { candidates } = step
    return <>
      <p>Target {run.target} in base {run.x}. Digits are shown least significant first, position 0 on the left.</p>
      <IndexedSequence label="Base x digits" length={run.digits.length} active={step.position}
        valueAt={i => run.digits[i]}
        roleAt={i => step.position < 0 ? 'unscanned' : i <= step.position ? 'scanned' : 'unscanned'} />
      <table><caption>Cheapest cost so far</caption><thead><tr><th>State</th><th>Value</th></tr></thead><tbody>
        <tr><th>pos (no borrow pending)</th><td>{step.pos}</td></tr>
        <tr><th>neg (one x^k owed)</th><td>{step.neg}</td></tr>
      </tbody></table>
      {candidates && <table><caption>Candidates at position {step.position}</caption><tbody>
        <tr><th>pos from plain copies</th><td>{candidates.posPlain}</td></tr>
        <tr><th>pos from borrow in</th><td>{candidates.posBorrow}</td></tr>
        <tr><th>neg from plain copies</th><td>{candidates.negPlain}</td></tr>
        <tr><th>neg from borrow in</th><td>{candidates.negBorrow}</td></tr>
      </tbody></table>}
      {step.phase === 'done' && <output aria-label="Least operators">Least operators: {run.result}</output>}
    </>
  }} renderReasoning={() => <>
    <p>Each base-x digit can be covered by plain positive copies of x to that power, or by borrowing: one higher power minus (x minus digit) copies. A copy of x to the power k costs k operators, and the digit 0 position uses x / x at 2 operators per copy.</p>
    <p>Two states carry between positions: pos when nothing is borrowed, and neg when one extra power is owed. The answer is the cheaper of ending with pos, or paying one more top power with neg, minus the operator the first term does not need.</p>
  </>} />
}
