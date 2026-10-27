import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Call', description: 'Push a function; the caller pauses.' },
    { id: 'end', label: 'Return', description: 'Pop the function and add its time.' },
    { id: 'done', label: 'Complete', description: 'Return the exclusive times.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Program (JSON object with n and logs)',
  url: 'https://leetcode.com/problems/exclusive-time-of-functions/',
  complexity: 'O(logs + n) time and O(logs) stack space.',
  examples: [
    { label: 'Nested', input: '{"n":2,"logs":["0:start:0","1:start:2","1:end:5","0:end:6"]}' },
    { label: 'Recursion', input: '{"n":1,"logs":["0:start:0","0:start:2","0:end:5","0:start:6","0:end:6","0:end:7"]}' },
    { label: 'Back to back', input: '{"n":2,"logs":["0:start:0","0:end:0","1:start:1","1:end:1"]}' },
  ],
}

export default function ExclusiveTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StackLane title="Call stack" items={step.stack.map(id => `f${id}`)} note={step.stack.length ? 'top is running' : 'idle'} />
    <IndexedSequence label="Exclusive time per function" length={run.input.n} active={step.current ?? -1} valueAt={i => step.result[i]}
      roleAt={i => (i === step.current ? 'current' : '')} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Exclusive time:</strong> a function accumulates time only while it is on top; a call pauses its caller until the callee ends.</p>
  </>} />
}
