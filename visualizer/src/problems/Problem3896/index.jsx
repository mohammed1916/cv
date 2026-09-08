import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'
const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/minimum-operations-to-transform-array-into-alternating-prime/',
  complexity: 'O(U log log U + n) time and O(U + n) visualization space, U = 2 × max(2, max(nums)). The sieve and reverse lookup scan are preprocessing; playback focuses on per-position decisions.',
  phases: [
    { id: 'start', label: 'Prime lookup', description: 'Build sieve and next-valid-value tables.' },
    { id: 'classify', label: 'Index requirement', description: 'Even indices need prime; odd indices need non-prime.' },
    { id: 'choose', label: 'Nearest target', description: 'Choose the first valid value reachable by increments.' },
    { id: 'apply', label: 'Pay increments', description: 'Apply the exact value difference to this position.' },
    { id: 'done', label: 'Return minimum', description: 'Sum the independent minimum costs.' },
  ],
  examples: [
    { label: 'Two consecutive primes', input: '[1,2,3,4]' },
    { label: 'Already alternating', input: '[5,6,7,8]' },
    { label: 'One increment', input: '[4,4]' },
    { label: 'Prime gap', input: '[90,97]' },
  ],
}
export default function AlternatingPrime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const committed = i => step.phase === 'done' || i < step.index || i === step.index && step.phase === 'apply'
    return <>
      <IndexedSequence label="Input and required primality" length={run.input.length} active={step.index} valueAt={i => run.input[i]}
        roleAt={i => i % 2 ? 'need non-prime' : 'need prime'} />
      <IndexedSequence label="Transformed array" length={run.input.length} active={step.index} valueAt={i => committed(i) ? run.targets[i] : run.input[i]}
        roleAt={i => committed(i) ? run.prime[run.targets[i]] ? 'prime' : 'non-prime' : 'pending'} />
      <IndexedSequence label="Paid operations by index" length={run.input.length} active={step.index} valueAt={i => committed(i) ? run.costs[i] : '?'} />
      {['choose', 'apply'].includes(step.phase) && <IndexedSequence label="Candidate values (all increments to target)"
        length={step.cost + 1} indexOffset={run.input[step.index]} active={step.cost} valueAt={i => run.input[step.index] + i}
        roleAt={i => run.prime[run.input[step.index] + i] ? 'prime' : 'non-prime'} />}
      <output aria-label="Minimum prime alternation operations">{step.phase === 'done' ? 'Minimum operations' : 'Cost so far'}: {step.total}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>Index parity determines the requirement, not value parity. The number 1 is non-prime; 2 is prime.</p>
    <p>Only increments are allowed. Each element is independent, so the nearest allowed value minimizes its cost; summing those minima is globally optimal.</p>
    <p>At an odd index, 2 requires two increments: 2 → 3 → 4. Other odd primes become even non-primes after one increment.</p>
    {['choose', 'apply'].includes(step.phase) && <p>Current target: {step.target}. The candidate row shows every intervening value; the operation batch represents exactly {step.cost} unit increments.</p>}
  </>} />
}
