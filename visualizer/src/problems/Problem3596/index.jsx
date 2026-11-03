import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AlternatingGridView from './AlternatingGridView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Enter the top left cell.' },
    { id: 'pop', label: 'Settle', description: 'Take the cheapest unsettled state.' },
    { id: 'relax', label: 'Move', description: 'Follow a move that matches the parity.' },
    { id: 'done', label: 'Result', description: 'The opposite corner is settled.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with rows and cols (grid size, from 1 to 6)',
  url: 'https://leetcode.com/problems/minimum-cost-path-with-alternating-directions-i/',
  complexity: 'O(m * n) states with a heap gives O(m * n log(m * n)) time; this traced version selects by scanning, so it runs in O((m * n)^2) for the visualization, which caps each side at 6.',
  examples: [
    { label: 'Three by three', input: '{"rows":3,"cols":3}' },
    { label: 'Narrow strip', input: '{"rows":2,"cols":4}' },
  ],
}

export default function MinimumCostPathWithAlternatingDirectionsI() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <AlternatingGridView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>The move number decides the direction, so the search tracks cost for each cell together with whether the next move goes forward or back.</p>
    </>} />
}
