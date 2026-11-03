import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3944View from './Problem3944View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Price every residue for each position group.' },
    { id: 'even', label: 'Even cost', description: 'Total cost of moving even-index values to a residue.' },
    { id: 'odd', label: 'Odd cost', description: 'Total cost of moving odd-index values to a residue.' },
    { id: 'pair', label: 'Pair', description: 'Try one even residue and one different odd residue.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest pair.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers 0 to 20) and k (from 2 to 6)',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-array-modulo-alternating-ii/',
  complexity: 'O(n * k + k^2) time and O(k) space: each value is priced against every residue, then every pair of distinct residues is compared. The visualization caps nums at 8 values and k at 6.',
  examples: [
    { label: 'Six values', input: '{"nums":[5,8,2,9,4,7],"k":3}' },
    { label: 'All ones', input: '{"nums":[1,1,1,1],"k":2}' },
  ],
}

export default function Problem3944Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3944View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A value moves to the nearest number in its target residue class, which costs the shorter way around the mod-k cycle.</p>
  </>} />
}
