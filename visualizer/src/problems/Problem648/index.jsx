import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Roots', description: 'Store the roots in a set.' },
    { id: 'word', label: 'Replace word', description: 'Use the shortest root prefix, if any.' },
    { id: 'done', label: 'Complete', description: 'Return the rewritten sentence.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Dictionary and sentence (JSON object)',
  url: 'https://leetcode.com/problems/replace-words/',
  complexity: 'O(total characters) time using a trie in production; this visualization checks each word’s prefixes with a set, which is O(L²) per word.',
  examples: [
    { label: 'Shortest root', input: '{"dictionary":["cat","bat","rat"],"sentence":"the cattle was rattled by the battery"}' },
    { label: 'No match', input: '{"dictionary":["a","b","c"],"sentence":"aadsfasf absbs bbab cadsfafs"}' },
  ],
}

export default function ReplaceWords() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Words">
      <thead><tr><th>Word</th><th>Replacement</th></tr></thead>
      <tbody>{run.input.sentence.split(' ').map((word, i) => <tr key={i} style={{ fontWeight: step.out.length === i + 1 && step.word === word ? 700 : 400 }}>
        <td>{word}</td><td>{step.out[i] ?? '…'}</td></tr>)}</tbody>
    </table>
    <output aria-label="Rewritten sentence">{step.out.join(' ') || '—'}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Shortest wins:</strong> prefixes are tried from length 1 upward, so the first root found is the shortest one.</p>
    <p>Roots loaded: {run.input.dictionary.join(', ')}.</p>
  </>} />
}
