import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2709',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Every index starts alone; primes are unclaimed.' },
    { id: 'own', label: 'Claim prime', description: 'The first index with a prime owns it.' },
    { id: 'union', label: 'Join', description: 'Two indices sharing a prime join one group.' },
    { id: 'one', label: 'One', description: 'The value 1 shares no prime, so the answer is false.' },
    { id: 'done', label: 'Result', description: 'Check that every index is in one group.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [6, 10, 15]}',
  url: 'https://leetcode.com/problems/greatest-common-divisor-traversal/',
  complexity: 'Near-linear time with union-find over the prime factors of each value. The visualization caps nums at 8 values up to 100.',
  examples: [
    { label: 'Chain through primes', input: '{"nums":[6,10,15]}' },
    { label: 'Isolated value', input: '{"nums":[8,12,18,25]}' },
    { label: 'Single value', input: '{"nums":[7]}' },
    { label: 'Equal values', input: '{"nums":[12,12,12]}' },
    { label: 'Coprime pair', input: '{"nums":[2,3]}' },
    { label: 'Largest values', input: '{"nums":[100,50,25,75,100,90,60,80]}' },
    { label: 'Long run: 8 values', input: '{"nums":[50,36,14,37,88,36,10,76]}' },
  ],
}

export default function GcdTraversal() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.current ?? -1} roleAt={i => (step.neighbour === i ? 'r' : '')} />
    <GraphTraversalView title="Indices sharing a prime factor" n={run.input.nums.length} edges={step.edges}
      labels={run.input.nums.map((v, i) => `${i}:${v}`)} current={step.current} neighbour={step.neighbour} tags={step.tags} showFrontier={false} />
    <p role="status" style={{ color: 'var(--text)' }}>{step.prime !== null ? `Prime ${step.prime}. ` : ''}{step.message}</p>
    {step.result !== null && <output aria-label="Traversal result">{`All pairs traversable: ${step.result}`}</output>}
  </>} renderReasoning={() => <>
    <p>Two values can be linked when they share a prime factor, and a path may pass through other values. Each prime remembers the first index that owns it, so later indices with that prime join the same group.</p>
    <p>All indices can be traversed exactly when they end in one group. A value 1 has no prime, so it is cut off whenever there is more than one number.</p>
  </>} />
}
