import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Load roots', description: 'Put the dictionary roots in a set.' },
    { id: 'prefix', label: 'Test prefixes', description: 'Try the shortest prefix first, then longer ones.' },
    { id: 'word', label: 'Replace word', description: 'Use the first root found, or keep the word.' },
    { id: 'done', label: 'Join', description: 'Join the replaced words with single spaces.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Roots and sentence (JSON object)',
  url: 'https://leetcode.com/problems/replace-words/',
  complexity: 'O(total characters) time with a hash set; each word scans at most its own length of prefixes.',
  examples: [
    { label: 'Two roots', input: '{"dictionary":["ca","ar"],"sentence":"car arrive cat"}' },
    { label: 'Longer root', input: '{"dictionary":["tree","tr","go"],"sentence":"trees go trace"}' },
    { label: 'No root', input: '{"dictionary":["bat"],"sentence":"battery is ready"}' },
  ],
}

export default function ReplaceWords() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecordStateTable label={step.word ? `Prefixes of ${step.word}` : 'Prefixes of the current word'} columns={['prefix', 'is a root']}
      rows={step.prefixes.map(p => ({ prefix: p.prefix, 'is a root': p.isRoot ? 'yes' : 'no' }))} activeRow={step.prefixes.length - 1} />
    <RecordStateTable label="Roots in the dictionary" columns={['root']} rows={[...new Set(run.input.dictionary)].map(root => ({ root }))} />
    <output aria-label="Sentence so far">{step.output.join(' ') || '…'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the shortest prefix:</strong> the statement replaces a word with its shortest matching root, so the search stops at the first hit.</p>
  </>} />
}
