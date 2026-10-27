import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty map', description: 'Start with no prefixes counted.' },
    { id: 'count', label: 'Count prefixes', description: 'Add each word’s prefixes to the counts.' },
    { id: 'score', label: 'Score words', description: 'Sum the counts along each word’s prefixes.' },
    { id: 'done', label: 'Complete', description: 'Report every word score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words (JSON list of lowercase strings)',
  url: 'https://leetcode.com/problems/sum-of-prefix-scores-of-strings/',
  complexity: 'O(total length) time and space for hashed prefixes. The visualization caps input at 6 words of up to 6 letters.',
  examples: [
    { label: 'Example 1', input: '{"words":["abc","ab","bc","b"]}' },
    { label: 'Single word', input: '{"words":["abcd"]}' },
  ],
}

export default function SumOfPrefixScores() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Prefix counts">
      <thead><tr><th>Prefix</th><th>Words sharing it</th></tr></thead>
      <tbody>{step.counts.map(([prefix, count]) => <tr key={prefix} className={step.word && step.word.startsWith(prefix) ? 'is-active' : ''}><td>{prefix}</td><td>{count}</td></tr>)}</tbody>
    </table>
    <output aria-label="Scores">{`Answer so far: ${step.answer.join(', ') || 'none'}${step.score === null ? '' : `. Current word score ${step.score}`}`}</output>
  </>} renderReasoning={() => <>
    <p>A prefix shared by several words is counted once, and each word then reads its own prefixes from that shared table.</p>
    <p>The score of a word is the sum of counts along its prefixes, so the work is proportional to the total length of the words.</p>
  </>} />
}
