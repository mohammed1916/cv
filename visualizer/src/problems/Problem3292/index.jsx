import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'trie', label: 'Trie', description: 'Store every word in a trie.' },
    { id: 'reach', label: 'Reach', description: 'Walk the trie from each target position.' },
    { id: 'relax', label: 'Cost', description: 'Spread the cheapest piece count forward through the target.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum count, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words and target (JSON)',
  url: 'https://leetcode.com/problems/minimum-number-of-valid-strings-to-form-target-ii/',
  complexity: 'O(total word length + m * L) time, where m is the target length and L is the longest word. The visualization caps sizes.',
  examples: [
    { label: 'Example 1', input: '{"words":["abc","aaaaa","bcdef"],"target":"aabcdabc"}' },
    { label: 'Overlapping', input: '{"words":["abababab","ab"],"target":"ababaababa"}' },
  ],
}

export default function MinimumValidStringsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Target characters" length={run.input.target.length} valueAt={i => run.input.target[i]} active={step.p} />
    <table aria-label="Reach and cost">
      <thead><tr><th>Position</th><th>Reach</th><th>Cost</th></tr></thead>
      <tbody>{run.input.target.split('').map((ch, i) => <tr key={i}>
        <td>{i}</td><td>{step.reach[i] ?? ''}</td><td>{step.cost.length > i ? String(step.cost[i]) : ''}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Result">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A trie answers, for each target position, the longest prefix of any word that matches there in one walk.</p>
    <p>Because every shorter prefix is also valid, the cost DP only needs the reach value at each position.</p>
  </>} />
}
