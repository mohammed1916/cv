import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Scan', description: 'Start with no letter to compare against.' },
    { id: 'keep', label: 'Keep', description: 'The letter is not almost equal to the one before it.' },
    { id: 'change', label: 'Change', description: 'Change this letter and forget the previous one.' },
    { id: 'done', label: 'Complete', description: 'Report the number of changes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a lowercase string word',
  url: 'https://leetcode.com/problems/remove-adjacent-almost-equal-characters/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the word at 30 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"aaaaa"}' },
    { label: 'Example 2', input: '{"word":"abddez"}' },
  ],
}

export default function RemoveAlmostEqualCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.word.length} valueAt={index => run.word[index]} active={step.index} roleAt={index => (step.changed.includes(index) ? 'changed' : '')} />
    <output aria-label="Changes">{`Changes so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Changing a letter only affects its comparison with its two neighbours, so the choice can be made greedily.</p>
    <p>When a letter clashes with the one before it, it is changed to a letter far from both neighbours, and the comparison restarts from the next letter.</p>
  </>} />
}
