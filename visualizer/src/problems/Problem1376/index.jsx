import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Head', description: 'The head starts the news at minute zero.' },
    { id: 'spread', label: 'Pass on', description: 'Each employee passes the news to every direct report.' },
    { id: 'done', label: 'Finish', description: 'Return the latest time anyone is informed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, headID, manager and informTime (JSON)',
  url: 'https://leetcode.com/problems/time-needed-to-inform-all-employees/',
  complexity: 'O(n) time and O(n) space for the manager lists. The visualization caps employees at 12.',
  examples: [
    { label: 'Example 2', input: '{"n":6,"headID":2,"manager":[2,2,-1,2,2,2],"informTime":[0,0,1,0,0,0]}' },
    { label: 'Chain', input: '{"n":7,"headID":6,"manager":[1,2,3,4,5,6,-1],"informTime":[0,6,5,4,3,2,1]}' },
  ],
}

export default function InformEmployees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const informed = Object.keys(step.heard).map(Number)
    const tags = Object.fromEntries(Object.entries(step.heard).map(([id, t]) => [id, `t${t}`]))
    return <>
      <GraphTraversalView title="Manager tree (who hears when)" n={run.input.n} edges={run.edges} directed
        labels={Array.from({ length: run.input.n }, (_, i) => `E${i}`)} current={step.node} visited={informed}
        tags={tags} />
      <output aria-label="Inform state">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Every employee passes the news to each direct report in turn, but the reports hear it at the same time as each other.</p>
    <p>So an employee hears at the moment their manager heard, plus the manager's own inform time. The answer is the latest hearing.</p>
  </>} />
}
