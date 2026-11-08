import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TreeDiameterView from './TreeDiameterView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'first', label: 'Search from 0', description: 'Breadth-first search from node 0.' },
    { id: 'pickA', label: 'Endpoint A', description: 'Take the farthest node from 0.' },
    { id: 'second', label: 'Search from A', description: 'Breadth-first search from endpoint A.' },
    { id: 'pickB', label: 'Endpoint B', description: 'Take the farthest node from A.' },
    { id: 'done', label: 'Result', description: 'Return the pair in ascending order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and edges (n minus 1 [u, v] pairs)',
  url: 'https://leetcode.com/problems/find-diameter-endpoints-of-a-tree/',
  complexity: 'O(n) time and O(n) space for a tree on n nodes. The visualization caps n at 12.',
  examples: [
    { label: 'Branch on one side', input: '{"n":7,"edges":[[0,1],[0,2],[2,3],[3,4],[3,5],[5,6]]}' },
    { label: 'Plain path', input: '{"n":4,"edges":[[2,0],[0,3],[3,1]]}' },
    { label: "Two nodes", input: "{\"n\":2,\"edges\":[[0,1]]}" },
    { label: "Star with three leaves", input: "{\"n\":4,\"edges\":[[0,1],[0,2],[0,3]]}" },
    { label: "Path of 12, reversed edges", input: "{\"n\":12,\"edges\":[[1,0],[2,1],[3,2],[4,3],[5,4],[6,5],[7,6],[8,7],[9,8],[10,9],[11,10]]}" },
    { label: "Long run: random tree of 12", input: "{\"n\":12,\"edges\":[[0,1],[1,2],[1,3],[1,4],[1,5],[5,6],[5,7],[7,8],[8,9],[3,10],[8,11]]}" },
  ],
}

export default function FindDiameterEndpointsOfATree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <TreeDiameterView run={run} step={step} />} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>Two breadth-first searches suffice: the farthest node from any start is an endpoint of some diameter, and the farthest node from that endpoint closes it.</p>
    {run ? <p>Final answer: {run.result.join(' and ')}.</p> : null}
  </>} />
}
