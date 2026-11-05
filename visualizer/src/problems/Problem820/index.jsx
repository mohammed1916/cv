import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every distinct word needs its own reference.' },
    { id: 'cover', label: 'Covered', description: 'A word covers its proper suffixes.' },
    { id: 'scan', label: 'Scan', description: 'The word covers nothing else.' },
    { id: 'done', label: 'Complete', description: 'Add each kept word with its # sign.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words (JSON array of lowercase words)',
  url: 'https://leetcode.com/problems/short-encoding-of-words/',
  complexity: 'O(total length^2) for the suffix slices in this version; a trie gives O(total length).',
  examples: [
    { label: 'Suffix', input: '["time","me","bell"]' },
    { label: 'Repeat', input: '["pot","top","pot","opt"]' },
  ],
}

export default function ShortEncoding() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="Words still needing a reference (kept)" columns={['word']}
      rows={step.kept.map(w => ({ word: w }))} activeRow={-1} />
    <p><strong>Just removed:</strong> {step.removed.length ? step.removed.join(', ') : 'nothing'}</p>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>An encoding reference ends in #. A word that is a suffix of another word can be read from that longer reference, so it does not need one.</p>
    <p>Each kept word costs its letters plus one for the #.</p>
  </>} />
}
