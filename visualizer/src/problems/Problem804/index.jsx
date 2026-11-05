import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'No representation seen yet.' },
    { id: 'new', label: 'New code', description: 'This transformation is added to the set.' },
    { id: 'repeat', label: 'Repeat', description: 'This transformation was already counted.' },
    { id: 'done', label: 'Complete', description: 'The set size is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words (JSON array of lowercase words)',
  url: 'https://leetcode.com/problems/unique-morse-code-words/',
  complexity: 'O(total letters) time and O(total length) space.',
  examples: [
    { label: 'Pair', input: '["gin","zen","gig","msg"]' },
    { label: 'Repeats', input: '["ab","ba","aab","ab"]' },
  ],
}

export default function UniqueMorseCodeWords() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="Words, their Morse strings, and whether they are new" columns={['word', 'morse', 'status']}
      rows={step.rows.map(r => ({ word: r.word, morse: r.code, status: r.fresh ? 'new' : 'repeat' }))}
      activeRow={step.rows.length - 1} />
    <output aria-label="Distinct count">{`Distinct so far: ${step.distinct}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each letter maps to its Morse code. A word's transformation is the concatenation, and the answer counts distinct concatenations.</p>
  </>} />
}
