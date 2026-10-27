import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Set the range of lengths to search.' },
    { id: 'search', label: 'Try length', description: 'Keep the windows of the first path that every other path contains.' },
    { id: 'done', label: 'Complete', description: 'Report the longest shared block.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of paths, each an array of city ids',
  url: 'https://leetcode.com/problems/longest-common-subpath/',
  complexity: 'O(S log m) expected time for S total cities and shortest path m, using rolling hashes. The visualization caps input at 4 paths of 8 cities.',
  examples: [
    { label: 'Example', input: '[[0,1,2,3,4],[2,3,4],[4,0,1,2,3]]' },
    { label: 'Alternating', input: '[[0,1,0,1],[1,0,1,0],[0,1,0,1,0]]' },
  ],
}

export default function LongestCommonSubpath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="First path" length={run.input[0].length} valueAt={index => run.input[0][index]} />
    <output aria-label="Search range">{`Lengths ${step.lo} to ${step.hi}${step.mid ? `, trying ${step.mid}` : ''}`}</output>
    <output aria-label="Best so far">{`Best so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A block shared by every path is also shared by every shorter block inside it, so the length can be binary searched.</p>
    <p>Rolling hashes locate candidate windows in each path quickly. A hash hit only counts after the cities are compared.</p>
  </>} />
}
