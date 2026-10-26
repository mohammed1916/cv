import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Alice moves first on the chalkboard.' },
    { id: 'xor', label: 'Fold XOR', description: 'Accumulate the total XOR.' },
    { id: 'decide', label: 'Parity rule', description: 'XOR zero or an even count wins.' },
    { id: 'done', label: 'Complete', description: 'Return the winner.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/chalkboard-xor-game/',
  complexity: 'O(n) time, O(1) extra space; the game tree is never searched.',
  examples: [
    { label: 'Example 1 (Alice loses)', input: '[1,1,2]' },
    { label: 'Example 2 (even count)', input: '[0,1]' },
    { label: 'Example 3', input: '[1,2,3]' },
  ],
}
export default function ChalkboardXorGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Chalkboard numbers" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => i <= step.index ? 'folded' : ''} />
    <IndexedSequence label="Prefix XOR" length={step.prefix.length} active={step.index} valueAt={i => step.prefix[i]} />
    <output aria-label="XOR state">XOR = {step.x} (binary {step.x.toString(2)}); count = {run.input.length} ({run.input.length % 2 ? 'odd' : 'even'})</output>
    {step.phase === 'done' && <output aria-label="Winner">{run.result ? 'Alice wins' : 'Alice loses'}</output>}
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
  </>} />
}
