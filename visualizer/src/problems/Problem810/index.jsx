import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Alice moves first on the chalkboard.' },
    { id: 'xor', label: 'Fold XOR', description: 'Accumulate the total XOR.' },
    { id: 'decide', label: 'Parity rule', description: 'XOR zero or an even count wins.' },
    { id: 'done', label: 'Complete', description: 'Return the winner.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/chalkboard-xor-game/',
  complexity: 'O(n) time, O(1) extra space; the game tree is never searched.',
  examples: [
    { label: 'Example 1 (Alice loses)', input: '[1,1,2]' },
    { label: 'Example 2 (even count)', input: '[0,1]' },
    { label: 'Example 3', input: '[1,2,3]' },
    { label: 'Single element', input: '[7]' },
    { label: 'Equal values', input: '[5,5,5,5]' },
    { label: 'Largest allowed values', input: '[65535,0,65535]' },
    { label: 'Long run: 24 values', input: '[7540,43608,13531,63219,39417,6477,21862,33057,15502,45213,8015,56227,59719,39567,64481,27575,34832,32159,26163,63635,51341,59693,39017,46572]' },
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
