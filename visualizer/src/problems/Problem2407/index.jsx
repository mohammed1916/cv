import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SegtreeView from '../../components/shared/SegtreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No run ends anywhere yet.' },
    { id: 'element', label: 'Value', description: 'Query the window below x, then store the new run length at x.' },
    { id: 'done', label: 'Complete', description: 'Report the longest run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [...] (1 to 32), "k": 1-5}',
  url: 'https://leetcode.com/problems/longest-increasing-subsequence-ii/',
  complexity: 'O(n log M) time with a segment tree over the values, O(M) space. The visualization caps values at 32.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,2,1,4,3,4,5,8,15],"k":3}' },
    { label: 'Gap of 2', input: '{"nums":[1,3],"k":2}' },
  ],
}

export default function LongestIncreasingSubsequenceII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <SegtreeView {...step.seg} />
    <output aria-label="Best length">{`Best so far: ${step.best}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The run ending at x can extend any earlier run that ended at a value between x minus k and x minus one.</p>
    <p>A segment tree over values answers that range maximum and absorbs each new run length.</p>
  </>} />
}
