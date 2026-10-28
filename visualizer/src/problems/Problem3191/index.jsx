import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the left edge with no flips yet.' },
    { id: 'skip', label: 'Keep', description: 'A one at the start of the window is left alone.' },
    { id: 'flip', label: 'Flip', description: 'A zero at the start forces a flip of the next three values.' },
    { id: 'stuck', label: 'Stuck', description: 'A zero is left where no window fits.' },
    { id: 'done', label: 'Complete', description: 'Report the number of flips.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary array of 1 to 12 entries, for example [0,1,1,1,0,0]',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-binary-array-elements-equal-to-one-i/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 12 entries.',
  examples: [
    { label: 'Example 1', input: '[0,1,1,1]' },
    { label: 'Example 2', input: '[0,1,1,1,0,0]' },
  ],
}

export default function FlipThreeToOnes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Current array" length={run.input.length} valueAt={index => step.values[index]} active={step.index}
      roleAt={index => (index >= step.from && index <= step.to ? 'flipped' : '')} />
    <output aria-label="Flips">{`Flips so far: ${step.operations}`}</output>
  </>} renderReasoning={() => <>
    <p>Position 0 can only be fixed by a window that starts there, so a zero at the start of the scan forces a flip.</p>
    <p>Every window starting at the left is therefore forced, and the scan stops with -1 if a zero is left in the last two positions.</p>
  </>} />
}
