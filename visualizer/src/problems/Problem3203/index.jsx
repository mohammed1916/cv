import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the two trees.' },
    { id: 'first', label: 'Tree 1 diameter', description: 'Search for the first tree’s diameter.' },
    { id: 'second', label: 'Tree 2 diameter', description: 'Search for the second tree’s diameter.' },
    { id: 'radius', label: 'Radii', description: 'Half each diameter, rounded up.' },
    { id: 'join', label: 'Join', description: 'Connect the two centres with one edge.' },
    { id: 'done', label: 'Result', description: 'Report the smallest possible diameter.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with edges1 and edges2 (each a tree, up to 6 edges)',
  url: 'https://leetcode.com/problems/find-minimum-diameter-after-merging-two-trees/',
  complexity: 'O(n + m) time with two searches per tree. The visualization caps each tree at 6 edges.',
  examples: [
    { label: 'Example', input: '{"edges1":[[0,1]],"edges2":[[0,1],[1,2]]}' },
    { label: 'Single node', input: '{"edges1":[],"edges2":[[0,1]]}' },
  ],
}

export default function MinimumMergedDiameter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <table aria-label="Diameter search">
      <tbody>
        <tr><th scope="row">Step</th><td>{step.label}</td></tr>
        <tr><th scope="row">Value</th><td>{step.value ?? '-'}</td></tr>
      </tbody>
    </table>
  )} renderReasoning={() => <>
    <p>Joining two trees with one edge never produces a longer diameter than the larger original diameter, unless the two halves must cross through the new edge.</p>
    <p>The crossing path runs from the far side of the first tree, through its centre, across the new edge, and into the second tree, so it has length ceil(d1 / 2) plus ceil(d2 / 2) plus 1.</p>
  </>} />
}
