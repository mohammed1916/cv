import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Mark the suspicious method k.' },
    { id: 'mark', label: 'Spread', description: 'Mark every method a suspicious method invokes.' },
    { id: 'blocked', label: 'Blocked', description: 'An outside method calls into the suspicious set.' },
    { id: 'done', label: 'Remove', description: 'Keep only the methods that are not suspicious.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Project (JSON object with n, k and invocations)',
  url: 'https://leetcode.com/problems/remove-methods-from-project/',
  complexity: 'O(n + m * n) time in this trace, where m is the number of invocations. The visualization caps n at 10.',
  examples: [
    { label: 'Blocked', input: '{"n":4,"k":1,"invocations":[[1,2],[0,1],[3,2]]}' },
    { label: 'Removed', input: '{"n":5,"k":0,"invocations":[[1,2],[0,2],[0,1],[3,4]]}' },
    { label: 'Single method, no invocations', input: '{"n":1,"k":0,"invocations":[]}' },
    { label: 'Nothing invoked', input: '{"n":2,"k":1,"invocations":[]}' },
    { label: 'Repeated pair', input: '{"n":3,"k":0,"invocations":[[0,0],[0,0]]}' },
    { label: 'Long run: 14 invocations', input: '{"n":10,"k":9,"invocations":[[4,9],[3,7],[8,7],[8,4],[7,5],[6,0],[7,9],[3,0],[6,5],[2,2],[6,9],[6,7],[6,3],[1,7]]}' },
  ],
}

export default function RemoveMethods() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <IndexedSequence label="Methods" length={run.input.n} valueAt={i => i} active={run.input.k}
      roleAt={i => (step.marked[i] ? 'suspicious' : '')} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Removal is safe only when every invocation into the suspicious set comes from another suspicious method.</p>
  </>} />
}
