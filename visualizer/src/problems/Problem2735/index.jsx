import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Buy each type at its own cost.' },
    { id: 'shift', label: 'Shift', description: 'Each type may now come from one more index back.' },
    { id: 'cost', label: 'Cost', description: 'Add the rotation cost to the purchases.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (costs per type) and x (cost of one rotation)',
  url: 'https://leetcode.com/problems/collecting-chocolates/',
  complexity: 'O(n^2) time with the running minimum per type and O(n) space. The visualization caps n at 12.',
  examples: [
    { label: 'One rotation pays', input: '{"nums":[7,3,9,4],"x":2}' },
    { label: 'Three rotations pay', input: '{"nums":[5,5,1,6],"x":3}' },
    { label: 'Single value', input: '{"nums":[5],"x":5}' },
    { label: 'No rotation tie', input: '{"nums":[9,9],"x":1}' },
    { label: 'Largest values', input: '{"nums":[1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000],"x":1000}' },
    { label: 'Long run: 12 values', input: '{"nums":[981,350,411,652,57,178,327,192,181,934,315,756],"x":500}' },
  ],
}

export default function CollectingChocolates() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="cheapest cost per type" length={step.best.length} valueAt={i => step.best[i]} active={-1} />
    <output aria-label="Rotation cost">{`rotations = ${step.k >= 0 ? step.k : 'done'}, best total = ${step.answer}${step.cost !== null && step.cost !== undefined ? `, this total = ${step.cost}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Rotating k times lets type i be bought at any of the costs nums[i], nums[i-1], ..., nums[i-k], so the best price per type only ever goes down as k grows.</p>
    <p>Keeping a running minimum per type makes each new rotation a single update, and the answer is the cheapest k * x plus the sum of those minima.</p>
  </>} />
}
