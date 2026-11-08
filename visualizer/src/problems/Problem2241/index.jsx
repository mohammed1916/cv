import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const DENOMS = [20, 50, 100, 200, 500]

const definition = {
  number: '2241',
  phases: [
    { id: 'deposit', label: 'Deposit', description: 'Add the notes to the stock.' },
    { id: 'withdraw', label: 'Withdraw', description: 'Start a withdrawal from the largest note.' },
    { id: 'pick', label: 'Pick', description: 'Use as many of this note as fit the remaining amount.' },
    { id: 'accept', label: 'Hand over', description: 'The amount was paid exactly, so the notes leave the stock.' },
    { id: 'reject', label: 'Reject', description: 'The amount cannot be paid, so nothing changes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"ops":[{"op":"deposit","counts":[0,0,0,3,1]},{"op":"withdraw","amount":600}]}',
  url: 'https://leetcode.com/problems/design-an-atm-machine/',
  complexity: 'O(1) time per call and O(1) space, since there are five note values.',
  examples: [
    { label: 'Largest first', input: '{"ops":[{"op":"deposit","counts":[0,0,0,3,1]},{"op":"withdraw","amount":600},{"op":"withdraw","amount":500},{"op":"withdraw","amount":400},{"op":"withdraw","amount":20}]}' },
    { label: 'Small notes', input: '{"ops":[{"op":"deposit","counts":[2,1,0,0,0]},{"op":"withdraw","amount":70},{"op":"withdraw","amount":50}]}' },
    { label: 'Single deposit', input: '{"ops":[{"op":"deposit","counts":[1,0,0,0,0]}]}' },
    { label: 'Largest counts, big withdraw', input: '{"ops":[{"op":"deposit","counts":[0,0,0,0,20]},{"op":"withdraw","amount":5000}]}' },
    { label: 'Long run: twelve calls', input: '{"ops":[{"op":"deposit","counts":[3,1,4,1,5]},{"op":"withdraw","amount":600},{"op":"deposit","counts":[2,7,1,8,2]},{"op":"withdraw","amount":400},{"op":"deposit","counts":[0,5,9,0,3]},{"op":"withdraw","amount":1200},{"op":"deposit","counts":[6,2,0,1,4]},{"op":"withdraw","amount":300},{"op":"deposit","counts":[1,1,1,1,1]},{"op":"withdraw","amount":200},{"op":"deposit","counts":[4,4,4,4,4]},{"op":"withdraw","amount":900}]}' },
  ],
}

export default function AtmMachine() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Notes in the machine">
      <thead><tr>{DENOMS.map(d => <th key={d} scope="col">${d}</th>)}</tr></thead>
      <tbody><tr>{step.counts.map((c, k) => <td key={k} data-current={step.pick === k ? 'true' : undefined}
        style={{ textAlign: 'center', background: step.pick === k ? 'var(--primary)' : 'var(--surface2)', color: step.pick === k ? 'var(--surface)' : 'var(--text)' }}>{c}</td>)}</tr><tr aria-hidden="true">{DENOMS.map((_, k) => <td key={k} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>{step.pick === k ? 'pick' : ''}</td>)}</tr></tbody>
    </table>
    {step.remaining !== null && <output aria-label="Amount still to pay">{`remaining ${step.remaining}`}</output>}
    <OperationLog title="Calls" ops={step.log} current={step.log.length - 1} />
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The machine always tries the largest note first. Each note value is used as many times as it fits the remaining amount and the stock allows.</p>
    <p>If something is left at the end, the request is refused and the stock stays unchanged. The greedy order is the rule the problem asks for, not the fewest notes overall.</p>
  </>} />
}
