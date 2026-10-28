import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin counting the letters of s.' },
    { id: 'letter', label: 'Letter', description: 'Sort this letter’s count into the odd or even side.' },
    { id: 'done', label: 'Complete', description: 'Subtract the smallest even count from the largest odd count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String of lowercase letters (JSON string, 3 to 30 letters)',
  url: 'https://leetcode.com/problems/maximum-difference-between-even-and-odd-frequency-i/',
  complexity: 'O(n + 26) time and O(1) extra space. The visualization caps input at 30 letters.',
  examples: [
    { label: 'Example 1', input: '"aaaaabbc"' },
    { label: 'Example 2', input: '"abcabcab"' },
  ],
}

export default function EvenOddFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.length} valueAt={i => run.input[i]} active={-1} roleAt={i => (step.letter === run.input[i] ? 'current' : '')} />
    <p aria-label="Sides">{`Largest odd count: ${step.odd || '(none yet)'}; smallest even count: ${step.even ?? '(none yet)'}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only letters that occur are considered. The answer pairs the most frequent odd-count letter with the least frequent even-count letter.</p>
  </>} />
}
