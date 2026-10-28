import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'rest', label: 'Whole rest', description: 'Deleting everything that remains counts as one operation.' },
    { id: 'repeat', label: 'Repeated prefix', description: 'Delete a prefix that is repeated right after it.' },
    { id: 'done', label: 'Complete', description: 'Report the best count from position 0.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (lowercase letters, up to 40)',
  url: 'https://leetcode.com/problems/maximum-deletions-on-a-string/',
  complexity: 'O(n^2) letter comparisons in this build (O(n^3) if each comparison is a substring check).',
  examples: [
    { label: 'Example 1', input: '{"s": "abcabcdabc"}' },
    { label: 'Example 2', input: '{"s": "aaabaab"}' },
  ],
}

export default function MaximumDeletions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <p aria-label="String">{run.s.split('').map((ch, i) => (i === step.index ? `[${ch}]` : ch)).join('')}</p>
      <output aria-label="Best counts">{`Best counts from each position: ${step.dp.join(', ')}`}</output>
    </>
  )} renderReasoning={() => <>
    <p>Each operation removes a prefix, so the best count from a position depends only on the position after the removed prefix.</p>
    <p>Filling the table from the end lets each position reuse the answers for later positions.</p>
  </>} />
}
