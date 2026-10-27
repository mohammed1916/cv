import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Nodes', description: 'Collect each distinct rule string as a node.' },
    { id: 'set', label: 'Rules', description: 'Store the cheapest direct cost of each rule.' },
    { id: 'floyd', label: 'Shortest paths', description: 'Let each rule string act as a stepping stone.' },
    { id: 'dp', label: 'Pieces', description: 'Find the cheapest cost to convert each prefix.' },
    { id: 'done', label: 'Complete', description: 'Report the cost of the whole string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with source, target, original, changed and cost',
  url: 'https://leetcode.com/problems/minimum-cost-to-convert-string-ii/',
  complexity: 'O(m^3 + n^2 * m) time for m distinct rule strings and length n. The visualization caps rules at 6 pairs.',
  examples: [
    { label: 'Two pieces', input: '{"source":"abab","target":"caca","original":["ab"],"changed":["ca"],"cost":[3]}' },
    { label: 'Chain', input: '{"source":"aba","target":"cbc","original":["a","b"],"changed":["b","c"],"cost":[2,5]}' },
  ],
}

const cell = value => (value === Infinity ? '∞' : value)

export default function MinimumCostConvertII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    {step.matrix.length > 0 && <DistanceMatrixView label="Cheapest conversion between rule strings" matrix={step.matrix} />}
    <output aria-label="Rule strings">{`Nodes: ${step.names.join(', ') || '(none)'}`}</output>
    {step.dp.length > 0 && <IndexedSequence label="Cheapest cost to convert each prefix" length={step.dp.length}
      valueAt={index => cell(step.dp[index])} />}
  </>} renderReasoning={() => <>
    <p>Rule strings can be longer than one letter, so the letters alone do not form the graph. Each distinct rule string becomes a node.</p>
    <p>The prefix DP asks where a piece of source ends and becomes the matching piece of target, and it charges the shortest-path cost for that piece.</p>
  </>} />
}
