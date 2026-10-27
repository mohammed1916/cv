import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No pairs counted yet.' },
    { id: 'pair', label: 'Check pair', description: 'Test whether words[i] is both a prefix and a suffix of words[j].' },
    { id: 'done', label: 'Complete', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words (JSON list of lowercase strings)',
  url: 'https://leetcode.com/problems/count-prefix-and-suffix-pairs-i/',
  complexity: 'O(n^2 * L) time for n words of length up to L. The visualization caps input at 6 words.',
  examples: [
    { label: 'Example 1', input: '{"words":["a","aba","ababa","aa"]}' },
    { label: 'Example 2', input: '{"words":["pa","papa","ma","mama"]}' },
  ],
}

export default function CountPrefixSuffixPairsI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Words">
      <thead><tr><th>Index</th><th>Word</th></tr></thead>
      <tbody>{run.input.words.map((w, i) => <tr key={i} className={i === step.i || i === step.j ? 'is-active' : ''}><td>{i}</td><td>{w}</td></tr>)}</tbody>
    </table>
    <output aria-label="Pair check">{`${step.message} Count ${step.count}.`}</output>
  </>} renderReasoning={() => <>
    <p>A word is a prefix and suffix of another word exactly when both startsWith and endsWith hold for the pair.</p>
    <p>Checking each earlier word against each later word covers every pair once.</p>
  </>} />
}
