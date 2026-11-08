import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'An empty window.' },
    { id: 'append', label: 'Arrive', description: 'A number joins the window at r.' },
    { id: 'trim', label: 'Leave', description: 'The oldest number leaves at l.' },
    { id: 'answer', label: 'Answer', description: 'Check the last k numbers.' },
    { id: 'done', label: 'Result', description: 'Stream finished.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with value, k and stream (list of integers)',
  url: 'https://leetcode.com/problems/find-consecutive-integers-from-a-data-stream/',
  complexity: 'Each number is added and removed from the window once, so every answer costs constant time and the window holds at most k numbers.',
  examples: [
    { label: 'Example', input: '{"value":7,"k":2,"stream":[7,3,7,7,7,2,7]}' },
    { label: 'Longer run', input: '{"value":4,"k":3,"stream":[4,4,4,1,4,4,4,4]}' },
    { label: 'Single number', input: '{"value":3,"k":1,"stream":[3]}' },
    { label: 'Equal values', input: '{"value":5,"k":2,"stream":[5,5,5,5,5]}' },
    { label: 'Largest stream, k = 8', input: '{"value":9,"k":8,"stream":[9,9,9,9,9,9,9,9,1,9,9,9,9,9,9,9,9,9,9,9]}' },
    { label: 'Long run: 20 numbers', input: '{"value":2,"k":3,"stream":[2,1,2,2,3,2,3,3,2,3,1,1,2,3,3,1,3,1,3,1]}' },
  ],
}

export default function ConsecutiveIntegersFromStream() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Stream (window from l to r)" length={run.input.stream.length} active={step.r}
      valueAt={i => run.input.stream[i]}
      roleAt={i => (i === step.l ? 'l' : i === step.r ? 'r' : step.l !== null && i > step.l && i < step.r ? 'in window' : '')} />
    <output aria-label="Match count">{`Matches of ${run.input.value} in the window: ${step.matches} of ${run.input.k}`}</output>
    <p role="status">{step.message}</p>
    {step.out !== null && <p aria-label="Answer">{`Answer: ${step.out ? 'true' : 'false'}`}</p>}
  </>} renderReasoning={({ step }) => <>
    <p>The window always holds the last k numbers, from l to r. The answer is true only when the window is full and every number in it equals the value.</p>
    <p>{step.message}</p>
  </>} />
}
