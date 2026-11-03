import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ZigzagView from './ZigzagView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3993',
  phases: [
    { id: 'start', label: 'Setup', description: 'Read the start value, length and largest step.' },
    { id: 'pattern', label: 'Pattern', description: 'Choose which direction the zigzag opens with.' },
    { id: 'up', label: 'Up', description: 'Climb by the largest allowed step.' },
    { id: 'down', label: 'Down', description: 'Drop by the smallest allowed step.' },
    { id: 'done', label: 'Result', description: 'Report the highest value reached.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with start, n and m (e.g. {"start":5,"n":4,"m":3})',
  url: 'https://leetcode.com/problems/maximum-value-of-an-alternating-sequence/',
  complexity: 'O(n) time and O(1) extra space with the simulation shown; the answer is also a closed form. The visualization caps n at 12.',
  examples: [
    { label: 'Four steps', input: '{"start":5,"n":4,"m":3}' },
    { label: 'Single element', input: '{"start":20,"n":1,"m":9}' },
    { label: 'Unit steps', input: '{"start":2,"n":5,"m":1}' },
  ],
}

export default function MaximumAlternatingValue() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <ZigzagView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>An up move can add up to m while a down move only needs to subtract 1, so each climb is as large as possible.</p>
    </>} />
}
