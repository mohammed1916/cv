import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PathGridView from './PathGridView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Fill the grid with obstacles.' },
    { id: 'top', label: 'Top row', description: 'Open the top row.' },
    { id: 'right', label: 'Right column', description: 'Open the right column.' },
    { id: 'count', label: 'Count', description: 'Count the paths into each free cell.' },
    { id: 'done', label: 'Result', description: 'Check the bottom-right count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with rows and cols (e.g. {"rows":3,"cols":4})',
  url: 'https://leetcode.com/problems/create-grid-with-exactly-one-path/',
  complexity: 'O(m * n) time and space for the grid and the path counts.',
  examples: [
    { label: 'Three by four', input: '{"rows":3,"cols":4}' },
    { label: 'Single row', input: '{"rows":1,"cols":5}' },
  ],
}

export default function CreateGridWithExactlyOnePath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PathGridView run={run} step={step} />} renderReasoning={({ step }) => (
    <p>An L-shaped corridor along the top row and right column is the only open route, so every other cell stays an obstacle. {step.message}</p>
  )} />
}
