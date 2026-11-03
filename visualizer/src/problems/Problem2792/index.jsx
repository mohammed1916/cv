import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GreatEnoughTreeView from './GreatEnoughTreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the count to zero.' },
    { id: 'enter', label: 'Enter', description: 'Visit a node before its children.' },
    { id: 'collect', label: 'Collect', description: 'Gather the values of the whole subtree.' },
    { id: 'tally', label: 'Tally', description: 'Count the values strictly smaller than the node.' },
    { id: 'qualify', label: 'Count', description: 'The tally reaches k, so the node counts.' },
    { id: 'reject', label: 'Skip', description: 'The tally is below k, so the node does not count.' },
    { id: 'done', label: 'Result', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with tree (level order, null for a gap) and k',
  url: 'https://leetcode.com/problems/count-nodes-that-are-great-enough/',
  complexity: 'O(n^2) time in the worst case, because each node rescans the values below it, and O(n) extra space for the value lists along the recursion. The visualization caps the tree at 15 nodes with values from -99 to 99 and k from 0 to 15; the official bounds are not restated here.',
  examples: [
    { label: 'Mixed tree', input: '{"tree":[4,2,6,1,3,5,7],"k":2}' },
    { label: 'Sparse tree', input: '{"tree":[5,1,8,null,4,9,null],"k":1}' },
    { label: 'Equal values', input: '{"tree":[3,3,3,1],"k":1}' },
  ],
}

export default function CountNodesThatAreGreatEnough() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GreatEnoughTreeView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
