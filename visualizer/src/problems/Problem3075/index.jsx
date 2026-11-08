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
    { label: 'Four children, pick two', input: '{"happiness":[9,2,7,5],"k":2}' },
    { label: 'Three children, pick all', input: '{"happiness":[12,40,8],"k":3}' },
    { label: 'Single child', input: '{"happiness":[5],"k":1}' },
    { label: 'Equal happiness', input: '{"happiness":[3,3,3,3],"k":2}' },
    { label: 'Largest values', input: '{"happiness":[1000,1000,1000,1000,1000,1000,1000,1000],"k":8}' },
    { label: 'Long run: 8 children', input: '{"happiness":[881,434,175,136,69,134,643,756],"k":4}' },
  ],
}

export default function MaximizeHappiness() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const ranked = [...run.input.happiness].sort((a, b) => b - a)
    return <>
      <IndexedSequence label="Children ranked by happiness (value shown is the current happiness)" length={ranked.length} valueAt={i => step.values[i]} active={step.index} roleAt={i => (i < step.turn ? 'picked' : 'waiting')} />
      <output aria-label="Total happiness">{`Total so far: ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>After each pick, every child not yet picked loses one point, never below zero. The child picked on turn t has therefore lost t points.</p>
    <p>Picking in descending order of happiness, each turn gives the largest remaining value minus its turn index.</p>
  </>} />
}
