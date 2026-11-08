import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty trie', description: 'Start with no reversed words stored.' },
    { id: 'build', label: 'Store words', description: 'Walk each container word backwards and record the best index at each node.' },
    { id: 'query', label: 'Answer query', description: 'Walk the query backwards and read the best index at the deepest node.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words_container and words_query (JSON lists of lowercase strings)',
  url: 'https://leetcode.com/problems/longest-common-suffix-queries/',
  complexity: 'O(total length) time and space for the trie. The visualization caps input at 6 words each.',
  examples: [
    { label: 'Example 1', input: '{"words_container":["apple","pale","ple"],"words_query":["le","ale","zz"]}' },
    { label: "Single letter words", input: "{\"words_container\":[\"a\"],\"words_query\":[\"a\"]}" },
    { label: "Equal reversed suffixes", input: "{\"words_container\":[\"abc\",\"xbc\"],\"words_query\":[\"bc\"]}" },
    { label: "Longest allowed: 6 words of 6 letters", input: "{\"words_container\":[\"abcdef\",\"fedcba\",\"zzzzzz\",\"abcabc\",\"aaaaaa\",\"qwerty\"],\"words_query\":[\"bcdef\",\"zz\",\"abcdef\",\"a\",\"xyz\",\"ccc\"]}" },
    { label: "No shared suffix", input: "{\"words_container\":[\"abc\"],\"words_query\":[\"xyz\"]}" },
    { label: "Long run: 6 words", input: "{\"words_container\":[\"b\",\"bbabc\",\"acbcb\",\"c\",\"a\",\"bcb\"],\"words_query\":[\"b\",\"b\",\"acbba\",\"c\",\"cacac\",\"bca\"]}" },
  ],
}

export default function LongestCommonSuffixQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Container words">
      <thead><tr><th>Index</th><th>Word</th></tr></thead>
      <tbody>{run.input.words_container.map((w, i) => <tr key={i}><td>{i}</td><td>{w}</td></tr>)}</tbody>
    </table>
    <output aria-label="Answers">{`${step.message} Answers so far: ${step.answers.join(', ') || 'none'}.`}</output>
  </>} renderReasoning={() => <>
    <p>Reversing every word turns a common suffix into a common prefix, so a trie over reversed words finds the deepest shared path for a query.</p>
    <p>Each node keeps the shortest word through it, with the earliest index on a tie, so the deepest node gives the answer directly.</p>
  </>} />
}
