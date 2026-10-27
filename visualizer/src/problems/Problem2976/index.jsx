import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DistanceMatrixView from '../../components/shared/DistanceMatrixView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Letters', description: 'Start with zero cost from each letter to itself.' },
    { id: 'edges', label: 'Rules', description: 'Load the direct conversion rules.' },
    { id: 'relax', label: 'Pivot', description: 'Route every pair through one letter when that is cheaper.' },
    { id: 'done', label: 'Total', description: 'Sum the cost of each position.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with source, target, original, changed and cost',
  url: 'https://leetcode.com/problems/minimum-cost-to-convert-string-i/',
  complexity: 'O(26^3) time for the letter graph, plus O(n) to sum positions. The visualization caps the strings at 8 letters.',
  examples: [
    { label: 'Example 1', input: '{"source":"abcd","target":"acbe","original":["a","b","c","c","e","d"],"changed":["b","c","b","e","b","e"],"cost":[2,5,5,1,2,20]}' },
    { label: 'Small', input: '{"source":"aaaa","target":"bbbb","original":["a","c"],"changed":["c","b"],"cost":[1,2]}' },
  ],
}

export default function MinimumCostConvertI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DistanceMatrixView label="Cheapest conversion between letters in the input" matrix={step.matrix}
      activeCell={step.pivot >= 0 ? { row: step.pivot, col: step.pivot } : null} />
    <output aria-label="Letters shown">{`Letters shown: ${step.labels.join(' ')}`}</output>
  </>} renderReasoning={() => <>
    <p>Conversions chain: a rule a to b followed by b to c converts a to c, so the cheapest cost between any two letters is a shortest path.</p>
    <p>Floyd-Warshall tries every letter as a stepping stone. With 26 letters that is small enough to finish the whole table before summing positions.</p>
  </>} />
}
