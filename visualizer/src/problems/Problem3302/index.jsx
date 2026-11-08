import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'bounds', label: 'Bounds', description: 'Compute the latest valid start for every suffix of word2.' },
    { id: 'check', label: 'Feasibility', description: 'Confirm that some valid sequence exists.' },
    { id: 'scan', label: 'Scan', description: 'Try the smallest possible index for the next character.' },
    { id: 'pick', label: 'Pick', description: 'Keep the index and track whether the one change was used.' },
    { id: 'done', label: 'Result', description: 'Return the index sequence.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'word1 and word2 (JSON object)',
  url: 'https://leetcode.com/problems/find-the-lexicographically-smallest-valid-sequence/',
  complexity: 'O(n + m) time and O(n + m) space for word1 length n and word2 length m. The visualization caps word1 at 30 characters.',
  examples: [
    { label: 'Example 1', input: '{"word1": "bzcdbc", "word2": "bcd"}' },
    { label: 'Example 2', input: '{"word1": "zzmmp", "word2": "mp"}' },
    { label: 'Example 3', input: '{"word1": "bbbaa", "word2": "cccc"}' },
    { label: 'Example 4', input: '{"word1": "xbzd", "word2": "bd"}' },
    { label: 'Shortest valid pair', input: '{"word1":"ab","word2":"a"}' },
    { label: 'Repeated letters', input: '{"word1":"aaaa","word2":"aa"}' },
    { label: 'Longest allowed word1', input: '{"word1":"abcdefghijklmnopqrstuvwxyzabcd","word2":"zzzz"}' },
    { label: 'Long run: 30 letters', input: '{"word1":"accbccbcbcbacabcbabaacacaabaab","word2":"cabaacbbabbb"}' },
  ],
}

export default function SmallestValidSequenceVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="word1" length={run.input.word1.length} active={step.i}
            valueAt={i => run.input.word1[i]}
            roleAt={i => (step.chosen.includes(i) ? (i === step.changedAt ? 'changed' : 'chosen') : '')} />
          <table>
            <caption>Bounds for word2 suffixes (-1 means impossible)</caption>
            <thead><tr><th scope="col">j</th><th scope="col">exact[j]</th><th scope="col">almost[j]</th></tr></thead>
            <tbody>{step.exact.map((value, j) => (
              <tr key={j}><th scope="row">{j}</th><td>{value}</td><td>{step.almost[j]}</td></tr>
            ))}</tbody>
          </table>
          <p>Picked so far: [{step.chosen.join(', ')}] · changed: {step.changed ? 'yes' : 'no'}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  )
}
