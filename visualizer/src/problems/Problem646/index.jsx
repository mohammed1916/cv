import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order pairs by their right endpoint.' },
    { id: 'take', label: 'Take pair', description: 'It starts after the chain currently ends.' },
    { id: 'skip', label: 'Skip pair', description: 'It overlaps the chain end.' },
    { id: 'done', label: 'Complete', description: 'Return the chain length.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Pairs (JSON array of [left, right])',
  url: 'https://leetcode.com/problems/maximum-length-of-pair-chain/',
  complexity: 'O(n log n) time for the sort and O(n) space for the sorted copy.',
  examples: [
    { label: 'Three in chain', input: '[[1,2],[2,3],[3,4]]' },
    { label: 'Overlaps', input: '[[1,2],[7,8],[4,5]]' },
    { label: 'Nested', input: '[[-6,9],[1,6],[8,10],[-1,4],[-6,-2],[-9,8],[-5,3],[0,3]]' },
  ],
}

export default function PairChain() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Chosen pairs">
      <thead><tr><th>Chosen pair</th></tr></thead>
      <tbody>{step.chain.length === 0 ? <tr><td>none yet</td></tr> : step.chain.map(([a, b]) => <tr key={`${a},${b}`}><td>[{a}, {b}]</td></tr>)}</tbody>
    </table>
    <output aria-label="Chain state">Chain length {step.count ?? 0} · chain ends at {step.end ?? '—'}{step.current ? ` · current [${step.current[0]}, ${step.current[1]}]` : ''}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Exchange argument:</strong> choosing the pair that ends earliest leaves the most room for later pairs, so greedy by right endpoint is optimal.</p>
    <p>{run.input.length} candidate pairs were examined.</p>
  </>} />
}
