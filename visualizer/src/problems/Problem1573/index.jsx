import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Ones', description: 'Find the positions of the ones.' },
    { id: 'count', label: 'Divide', description: 'Check whether the ones split evenly into three groups.' },
    { id: 'first', label: 'First cut', description: 'Count the gaps where the first cut can fall.' },
    { id: 'second', label: 'Second cut', description: 'Count the gaps where the second cut can fall.' },
    { id: 'done', label: 'Complete', description: 'Multiply the two gap counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with s: 3 to 12 characters, each 0 or 1',
  url: 'https://leetcode.com/problems/number-of-ways-to-split-a-string/',
  complexity: 'O(n) time and O(n) space for the positions of the ones. The visualization caps s at 12 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"10101"}' },
    { label: 'Zeros', input: '{"s":"0000"}' },
  ],
}

export default function NumberOfWaysToSplitString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={index => run.input.s[index]} active={step.index}
      roleAt={index => step.ones.includes(index) ? 'one' : ''} />
    <output aria-label="Gap counts">{`First cut gaps: ${step.firstGaps ?? '(not yet)'}, second cut gaps: ${step.secondGaps ?? '(not yet)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each part must hold the same number of ones, so the ones are grouped in threes and the cuts are restricted to the gaps between groups.</p>
    <p>The first cut can move freely between the last one of the first group and the first one of the second group, and the second cut works the same way.</p>
  </>} />
}
