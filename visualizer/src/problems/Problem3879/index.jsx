import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3879View from './Problem3879View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Pick a start node, or report the setup.' },
    { id: 'enter', label: 'Extend', description: 'Add this node to the path if its value is new.' },
    { id: 'blocked', label: 'Repeat', description: 'The value already appears on the path.' },
    { id: 'best', label: 'Best', description: 'This path beats the best sum so far.' },
    { id: 'leave', label: 'Back up', description: 'Remove the node and try another branch.' },
    { id: 'done', label: 'Result', description: 'Report the best distinct-value path sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with tree: level-order values with null for empty slots',
  url: 'https://leetcode.com/problems/maximum-distinct-path-sum-in-a-binary-tree/',
  complexity: 'O(n^2) time and O(n) space: each start node drives one depth first search over the tree. The visualization caps the tree at 12 nodes.',
  examples: [
    { label: 'Mixed signs', input: '{"tree":[4,-2,6,1,null,5,-7]}' },
    { label: 'Repeated values', input: '{"tree":[1,1,1]}' },
    { label: 'Single node', input: '{"tree":[0]}' },
    { label: 'Equal values', input: '{"tree":[5,5,5]}' },
    { label: 'Extreme values, 12 nodes', input: '{"tree":[-9,9,-9,9,-9,9,-9,9,-9,9,-9,9]}' },
    { label: 'Long run: 12 nodes', input: '{"tree":[5,-6,-5,-7,-8,-9,0,-5,5,-8,5,-3]}' },
  ],
}

export default function Problem3879Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3879View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A path in a tree is unique between its two ends, so growing paths from every start node and refusing repeated values reaches every candidate.</p>
  </>} />
}
