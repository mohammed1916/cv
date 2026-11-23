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
  question: "Find the string left just before it becomes empty when repeatedly removing all copies of the most frequent letters.",
  approaches: [
    { name: "Simulate rounds", intuition: "Each round removes the letters with the highest remaining count, and track the last round's letters.", time: "O(26\u00b7n)", space: "O(26)" },
    { name: "Last occurrence of top letters", intuition: "Find the last positions of the letters with the highest total count and keep those in order.", time: "O(n)", space: "O(26)" },
  ],
  examples: [
    { label: 'Repeated letters', input: '"ddcbbaad"' },
    { label: 'Four distinct letters', input: '"mnop"' },
    { label: 'Single letter', input: '"a"' },
    { label: 'Equal counts', input: '"abab"' },
    { label: 'Longest string', input: '"abcdefghijklmnopqrst"' },
    { label: 'Long run: 20 letters', input: '"cdcbcaaacbbdaabdbdca"' },
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
