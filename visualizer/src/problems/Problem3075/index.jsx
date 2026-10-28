import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Rank children by happiness, highest first.' },
    { id: 'pick', label: 'Pick', description: 'Take the next child; its value drops by one per earlier turn.' },
    { id: 'done', label: 'Complete', description: 'Report the total happiness.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with happiness (array of positive integers) and k',
  url: 'https://leetcode.com/problems/maximize-happiness-of-selected-children/',
  complexity: 'O(n log n) time for the sort, then O(k) for the picks. The visualization caps input at 8 children.',
  examples: [
    { label: 'Example 1', input: '{"happiness":[1,2,3],"k":2}' },
    { label: 'Example 2', input: '{"happiness":[2,3,4,5],"k":1}' },
  ],
}

export default function MaximizeHappiness() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const ranked = [...run.input.happiness].sort((a, b) => b - a)
    return <>
      <IndexedSequence label="Children ranked by happiness" length={ranked.length} valueAt={i => ranked[i]} active={step.index} roleAt={i => (i < step.turn ? 'picked' : '')} />
      <output aria-label="Total happiness">{`Total so far: ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>After each pick, every child not yet picked loses one point, never below zero. The child picked on turn t has therefore lost t points.</p>
    <p>Picking in descending order of happiness, each turn gives the largest remaining value minus its turn index.</p>
  </>} />
}
