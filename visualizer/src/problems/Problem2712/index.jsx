import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with zero cost.' },
    { id: 'same', label: 'Match', description: 'Neighbours match, so the boundary is free.' },
    { id: 'differ', label: 'Differ', description: 'Pay the cheaper flip for this boundary.' },
    { id: 'done', label: 'Complete', description: 'Report the total cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary string of 1 to 30 characters (JSON string)',
  url: 'https://leetcode.com/problems/minimum-cost-to-make-all-characters-equal/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 30 characters.',
  examples: [
    { label: 'Example 1', input: '"0011"' },
    { label: 'Example 2', input: '"010101"' },
  ],
}

export default function EqualCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters" length={run.input.length} valueAt={i => run.input[i]}
      active={step.boundary} roleAt={i => (step.boundary >= 0 && (i === step.boundary || i === step.boundary + 1) ? 'boundary pair' : '')} />
    <output aria-label="Cost so far">{`Total cost so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Every place where neighbouring characters differ must be crossed by one flip, either of the prefix ending there or of the suffix starting after it.</p>
    <p>Choosing the cheaper of the two for each boundary gives the minimum total.</p>
  </>} />
}
