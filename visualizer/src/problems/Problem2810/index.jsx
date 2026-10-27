import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The screen is empty.' },
    { id: 'type', label: 'Type letter', description: 'A letter is appended to the end of the screen.' },
    { id: 'reverse', label: 'Type i', description: 'The faulty key reverses the whole screen.' },
    { id: 'done', label: 'Complete', description: 'Report what the screen shows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (lowercase letters)',
  url: 'https://leetcode.com/problems/faulty-keyboard/',
  complexity: 'O(n^2) time with string reversals, or O(n) with a flag. The visualization caps s at 100 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"string"}' },
    { label: 'Example 2', input: '{"s":"poiinter"}' },
  ],
}

export default function FaultyKeyboard() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Screen" length={step.text.length} valueAt={i => step.text[i]} active={-1} />
    <output aria-label="Screen text">{`Screen: ${step.text || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Typing i reverses everything typed so far, so each reversal changes which end new letters join.</p>
    <p>Reversing twice cancels out, which is the idea behind the flag-based solution.</p>
  </>} />
}
