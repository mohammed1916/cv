import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the goal and scan from the left.' },
    { id: 'plant', label: 'Plant', description: 'A plot is free and both neighbours are empty.' },
    { id: 'skip', label: 'Skip', description: 'The plot is taken or next to a flower.' },
    { id: 'done', label: 'Complete', description: 'Report whether the goal is reachable.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Input (JSON object with flowerbed and n)',
  url: 'https://leetcode.com/problems/can-place-flowers/',
  complexity: 'O(len) time and O(1) extra space; the visualization stores a copy of the bed per frame for display.',
  examples: [
    { label: 'Three fit', input: '{"flowerbed":[1,0,0,0,1],"n":1}' },
    { label: 'Two do not fit', input: '{"flowerbed":[1,0,0,0,1],"n":2}' },
    { label: 'Empty bed', input: '{"flowerbed":[0,0,0,0,0,0,0],"n":3}' },
  ],
}

export default function CanPlaceFlowers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Flowerbed" length={run.input.flowerbed.length} active={step.index}
      valueAt={i => step.bed[i]} roleAt={i => (i === step.index ? (step.phase === 'plant' ? 'planted' : 'checked') : '')} />
    <output aria-label="Flowers planted">Planted {step.planted} of {step.need} needed</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why greedy works:</strong> planting at the first free plot leaves the most room for later plots, so no better arrangement exists.</p>
  </>} />
}
