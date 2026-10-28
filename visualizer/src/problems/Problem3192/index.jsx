import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no suffix flipped.' },
    { id: 'keep', label: 'Keep', description: 'The value reads 1 with the current flips, so leave it.' },
    { id: 'flip', label: 'Flip suffix', description: 'The value reads 0, so flip everything from here to the end.' },
    { id: 'done', label: 'Complete', description: 'Report the number of suffix flips.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary array of 1 to 12 entries, for example [0,1,1,0,1]',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-binary-array-elements-equal-to-one-ii/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 12 entries.',
  examples: [
    { label: 'Example 1', input: '[0,1,1,0,1]' },
    { label: 'Example 2', input: '[1,0,0,0]' },
  ],
}

export default function SuffixFlipsToOnes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Original array" length={run.input.length} valueAt={index => run.input[index]} active={step.index}
      roleAt={index => (index >= step.from && index <= step.to ? 'flipped' : '')} />
    <output aria-label="Suffix flips">{`Suffix flips so far: ${step.operations}. Suffix currently flipped: ${step.flipped ? 'yes' : 'no'}`}</output>
  </>} renderReasoning={() => <>
    <p>A suffix flip reaches every later value, so the scan only needs to track whether the suffix is flipped right now.</p>
    <p>A value that reads 0 under the current flip state forces a flip starting at that position, and that flip is the cheapest way to fix it.</p>
  </>} />
}
