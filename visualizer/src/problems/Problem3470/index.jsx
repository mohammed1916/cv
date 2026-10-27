import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Choose the first value of permutation k.' },
    { id: 'place', label: 'Place value', description: 'Skip whole blocks of completions until the rank falls inside one.' },
    { id: 'done', label: 'Complete', description: 'Report the permutation.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": 1-8, "k": rank among alternating permutations}',
  url: 'https://leetcode.com/problems/permutations-iv/',
  complexity: 'O(n^2) candidate checks with memoised completion counts, each O(n^2) states. The visualization caps n at 8.',
  examples: [
    { label: 'n 3, k 2', input: '{"n":3,"k":2}' },
    { label: 'n 4, k 2', input: '{"n":4,"k":2}' },
  ],
}

export default function PermutationsIV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p aria-label="Prefix">{`Prefix so far: [${step.prefix.join(', ')}]`}</p>
    <p>{`Rank still to find: ${step.rest}`}</p>
    {step.candidates.length > 0 && <table aria-label="Candidates at this position">
      <thead><tr><th>Value</th><th>Completions</th><th>Outcome</th></tr></thead>
      <tbody>{step.candidates.map(c => <tr key={c.value} data-role={c.chosen ? 'chosen' : ''}>
        <td>{c.value}</td>
        <td>{c.skipped === 'same parity' ? '—' : c.count}</td>
        <td>{c.chosen ? 'chosen' : c.skipped ?? 'skip'}</td>
      </tr>)}</tbody>
    </table>}
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Alternating permutations of a prefix's remaining values can be counted from how many odd and even values remain and the parity of the last one placed.</p>
    <p>For each position, the values are tried in increasing order, and each one whose block of completions lies entirely before the target rank is skipped in one step.</p>
  </>} />
}
