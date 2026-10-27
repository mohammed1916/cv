import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty list of pairs.' },
    { id: 'skip', label: 'Skip', description: 'This split is not two primes.' },
    { id: 'pair', label: 'Pair', description: 'Both halves of the split are prime.' },
    { id: 'done', label: 'Complete', description: 'Report all pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (JSON), from 1 to 1000',
  url: 'https://leetcode.com/problems/prime-pairs-with-target-sum/',
  complexity: 'O(n sqrt(n)) time with trial division, and O(n) output. The visualization caps input at 1000.',
  examples: [
    { label: 'Example 1', input: '{"n":10}' },
    { label: 'Example 2', input: '{"n":2}' },
  ],
}

export default function PrimePairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Smaller half x" length={Math.floor(run.input.n / 2) + 1} valueAt={i => i} active={step.index} roleAt={i => (step.pairs.some(p => p[0] === i) ? 'pair' : '')} indexOffset={0} />
    <output aria-label="Pairs">{`Pairs so far: ${step.pairs.map(p => `[${p.join(', ')}]`).join(' ') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each pair is determined by its smaller member x, since the larger is n minus x.</p>
    <p>Only x up to n divided by two needs checking, and both x and n minus x must be prime.</p>
  </>} />
}
