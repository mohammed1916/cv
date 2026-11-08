import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SectionsView from './SectionsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2212',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with numArrows and aliceArrows (12 counts that sum to numArrows)',
  url: 'https://leetcode.com/problems/maximum-points-in-an-archery-competition/',
  complexity: 'O(12 * numArrows) time with the knapsack table and O(12 * numArrows) space for the choices. The page caps numArrows at 12.',
  examples: [
    { label: 'Four arrows', input: '{"numArrows":4,"aliceArrows":[0,0,0,0,0,0,0,0,0,1,1,2]}' },
    { label: 'Six arrows', input: '{"numArrows":6,"aliceArrows":[2,0,0,0,0,0,0,0,0,1,0,3]}' },
    { label: 'Five arrows', input: '{"numArrows":5,"aliceArrows":[0,3,0,0,0,0,0,0,0,0,0,2]}' },
    { label: 'Single arrow', input: '{"numArrows":1,"aliceArrows":[0,0,0,0,0,0,0,0,0,0,0,1]}' },
    { label: 'Tie at two sections', input: '{"numArrows":4,"aliceArrows":[0,0,0,0,0,0,0,0,0,0,2,2]}' },
    { label: 'Largest: twelve arrows', input: '{"numArrows":12,"aliceArrows":[1,1,1,1,1,1,1,1,1,1,1,1]}' },
  ],
}

export default function Problem2212Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SectionsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
