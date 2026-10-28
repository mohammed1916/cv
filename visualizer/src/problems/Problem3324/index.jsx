import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty screen.' },
    { id: 'append', label: 'Key 1', description: 'Append an a to the screen.' },
    { id: 'advance', label: 'Key 2', description: 'Advance the last letter to the next letter.' },
    { id: 'done', label: 'Complete', description: 'Every screen shown is recorded.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with target: 1 to 5 lowercase letters',
  url: 'https://leetcode.com/problems/find-the-sequence-of-strings-appeared-on-the-screen/',
  complexity: 'O(L * 26) screens for a target of length L. The visualization caps the target at 5 letters.',
  examples: [
    { label: 'Example 1', input: '{"target":"abc"}' },
    { label: 'Example 2', input: '{"target":"he"}' },
  ],
}

export default function ScreenSequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Screens shown" length={step.screens.length} valueAt={index => step.screens[index]} active={step.screens.length - 1} />
    <output aria-label="Screen">{`Current screen: ${step.screen || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Typing a target letter means appending an a and then advancing the last letter to the target, one step per press.</p>
    <p>Each earlier letter is fixed once a new letter is appended after it, so this order of presses is the shortest possible.</p>
  </>} />
}
