import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare an empty frequency table.' },
    { id: 'count', label: 'Count', description: 'Tally one character of s.' },
    { id: 'emit', label: 'Emit ordered', description: 'Append all copies of a character in custom order.' },
    { id: 'miss', label: 'Absent', description: 'Order character does not occur in s.' },
    { id: 'rest', label: 'Append rest', description: 'Characters outside the order go at the end.' },
    { id: 'done', label: 'Complete', description: 'Return the joined result.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'order and s (JSON)',
  url: 'https://leetcode.com/problems/custom-sort-string/',
  complexity: 'O(|order| + |s|) time, O(26) space for the counts.',
  examples: [
    { label: 'cba / abcd', input: '{"order":"cba","s":"abcd"}' },
    { label: 'bcafg / abcd', input: '{"order":"bcafg","s":"abcd"}' },
    { label: 'kqep / pekeq', input: '{"order":"kqep","s":"pekeq"}' },
  ],
}
export default function CustomSortString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="order" length={run.input.order.length} valueAt={i => run.input.order[i]} roleAt={i => step.phase !== 'count' && run.input.order[i] === step.current ? 'now' : ''} />
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} />
    <IndexedSequence label="Remaining counts (char:count)" length={Math.max(step.counts.length, 1)} valueAt={i => step.counts[i] ?? ' '} />
    <IndexedSequence label="Output so far" length={Math.max(step.out.length, 1)} valueAt={i => step.out[i] ?? ' '} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Only the relative order of characters listed in <code>order</code> matters, and equal characters are interchangeable, so counting then repeating is enough. Popping from the table leaves exactly the characters absent from <code>order</code>.</p>
  </>} />
}
