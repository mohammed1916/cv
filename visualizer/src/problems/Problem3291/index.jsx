import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'prefixes', label: 'Prefixes', description: 'Collect every prefix of every word.' },
    { id: 'reach', label: 'Reach', description: 'Find the longest valid piece starting at each target position.' },
    { id: 'relax', label: 'Cost', description: 'Spread the cheapest piece count forward through the target.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum count, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words and target (JSON)',
  url: 'https://leetcode.com/problems/minimum-number-of-valid-strings-to-form-target-i/',
  complexity: 'O(m * L^2) time for m words and target length m, with substring checks. The visualization caps sizes.',
  examples: [
    { label: 'Example 1', input: '{"words":["abc","aaaaa","bcdef"],"target":"aabcdabc"}' },
    { label: 'Impossible', input: '{"words":["abcdef"],"target":"xyz"}' },
  ],
}

export default function MinimumValidStringsI() {
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
    <p>A valid string is any prefix of a word, so a piece starting at a position is valid for every length up to its reach.</p>
    <p>The cheapest way to reach each position is the cheapest way to reach an earlier position plus one piece.</p>
  </>} />
}
