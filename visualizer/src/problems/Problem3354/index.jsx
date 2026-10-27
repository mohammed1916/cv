import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Count from zero.' },
    { id: 'trial', label: 'Trial', description: 'Start at a zero and pick a direction.' },
    { id: 'move', label: 'Move', description: 'Step across a zero cell.' },
    { id: 'bounce', label: 'Bounce', description: 'Hit a nonzero cell, lower it, and reverse.' },
    { id: 'valid', label: 'Valid', description: 'Every cell ended at zero.' },
    { id: 'invalid', label: 'Invalid', description: 'Some cell is still nonzero.' },
    { id: 'done', label: 'Complete', description: 'Report the number of valid choices.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (values 0 to 5)',
  url: 'https://leetcode.com/problems/make-array-elements-equal-to-zero/',
  complexity: 'O(n * (n + sum)) time for the trials. The visualization caps the array at 10 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,0,2,0,3]}' },
    { label: 'Example 2', input: '{"nums":[0]}' },
  ],
}

export default function MakeArrayZero() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label={`Array during trial (start ${step.start}, direction ${step.dir > 0 ? 'right' : step.dir < 0 ? 'left' : '-'})`}
      length={step.arr.length} valueAt={i => step.arr[i]} active={step.pos} roleAt={i => (i === step.start ? 'start' : '')} />
    <output aria-label="Valid count">{`Valid choices so far: ${step.count}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A trial starts at a zero and bounces between nonzero cells, lowering each one it hits. The choice is valid when every cell has been lowered to zero.</p>
  </>} />
}
