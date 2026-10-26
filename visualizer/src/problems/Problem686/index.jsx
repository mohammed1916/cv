import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the base string.' },
    { id: 'repeat', label: 'Add a copy', description: 'Append another copy of a and search for b.' },
    { id: 'found', label: 'Found', description: 'b is now a substring.' },
    { id: 'stop', label: 'Stop', description: 'Enough copies have been tried.' },
    { id: 'done', label: 'Complete', description: 'Return the number of copies.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Strings a and b (JSON object)',
  url: 'https://leetcode.com/problems/repeated-string-match/',
  complexity: 'O(m · (n + m)) time for the search, where m = |b| and n = |a|; the extra copy covers wrap-around matches.',
  examples: [
    { label: 'Wraps', input: '{"a":"abcd","b":"cdabcdab"}' },
    { label: 'Same', input: '{"a":"a","b":"aa"}' },
    { label: 'Impossible', input: '{"a":"a","b":"aaaaaaaaaaaaaaaaaaaaaab"}' },
  ],
}

export default function RepeatedStringMatch() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Repeated text" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{step.text || '—'}</output>
    <p>Looking for <code>{run.input.b}</code> · copies {step.copies}</p>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Why one extra copy:</strong> a match can start inside the last copy and finish in the next one; once the text is at least as long as b plus one copy of a, every alignment has been seen.</p>
    <p>Pattern {run.input.b}, base {run.input.a}.</p>
  </>} />
}
