import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count each letter and find the largest count.' },
    { id: 'keep', label: 'Keep', description: 'This is the last copy of a letter with the largest count.' },
    { id: 'skip', label: 'Skip', description: 'This copy is removed in an earlier round.' },
    { id: 'done', label: 'Complete', description: 'Report the string before the last round.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase string as a JSON string',
  url: 'https://leetcode.com/problems/apply-operations-to-make-string-empty/',
  complexity: 'O(n + 26) time and O(26) space for the scan.',
  examples: [
    { label: 'Example 1', input: '"aabcbbca"' },
    { label: 'Example 2', input: '"abcd"' },
  ],
}

export default function ApplyOperationsToMakeStringEmpty() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String" length={run.input.length} valueAt={i => run.input[i]} active={step.index} roleAt={i => (i < step.index ? 'scanned' : '')} />
    <output aria-label="Kept so far">{`Kept so far: ${step.kept || '(nothing yet)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every round removes the first remaining copy of each letter, so a letter with count c is gone after c rounds.</p>
    <p>The round before the last one contains exactly the letters with the largest count, each at its last original position.</p>
  </>} />
}
