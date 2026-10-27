import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the first digit as the window.' },
    { id: 'compare', label: 'Compare', description: 'Check whether the new digit repeats the one before it.' },
    { id: 'move', label: 'Move start', description: 'A second repeat forces the window to start after the older pair.' },
    { id: 'record', label: 'Record', description: 'Keep the longest window seen so far.' },
    { id: 'done', label: 'Complete', description: 'Report the longest semi-repetitive substring.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s, a string of digits',
  url: 'https://leetcode.com/problems/find-the-longest-semi-repetitive-substring/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 20 digits.',
  examples: [
    { label: 'Example 1', input: '{"s":"52233"}' },
    { label: 'Two pairs', input: '{"s":"1111111"}' },
  ],
}

export default function LongestSemiRepetitiveSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.end}
      roleAt={i => (i >= step.start && i <= step.end ? 'window' : (step.pair !== null && i === step.pair ? 'pair' : ''))} />
    <output aria-label="Window">{`Window ${step.start} to ${step.end}, best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Only the most recent equal pair matters: an older pair must lie outside the window before a new one is accepted.</p>
  </>} />
}
