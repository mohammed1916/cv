import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3839,
  phases: [
    { id: 'word', label: 'Bucket', description: 'Place each long-enough word under its first k letters.' },
    { id: 'done', label: 'Result', description: 'Count the buckets holding at least two words.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words (lowercase strings) and k',
  url: 'https://leetcode.com/problems/number-of-prefix-connected-groups/',
  complexity: 'O(total length) time with a hash map from prefix to count.',
  examples: [
    { label: 'Two groups', input: '{"words":["ant","anvil","bee","beetle","cat"],"k":2}' },
    { label: 'Short words', input: '{"words":["sun","sunny","sea","tea","sea"],"k":3}' },
  ],
}

export default function NumberOfPrefixConnectedGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Prefix buckets">
      <thead><tr><th>prefix of length {run.input.k}</th><th>words</th></tr></thead>
      <tbody>{step.buckets.map(([key, count]) => <tr key={key} data-current={step.key === key ? 'yes' : undefined}>
        <td>{key}</td><td>{count}{count >= 2 ? ' (group)' : ''}</td></tr>)}</tbody>
    </table>
    <output aria-label="Current word">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Sharing the same first k letters is an equivalence: if a and b match, and b and c match, then a and c match.</p>
    <p>So each bucket is one connected group, and only buckets with two or more words count.</p>
  </>} />
}
