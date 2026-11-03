import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ThreatRankView from './ThreatRankView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3631',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Threats as [id, severity, exploitability] (e.g. [[1,2,3],[2,3,1]])',
  url: 'https://leetcode.com/problems/sort-threats-by-severity-and-exploitability/',
  complexity: 'O(k²) time and O(k) space for k threats, using insertion sort. The visualization caps the list at 8 threats; the official bounds are not verified here.',
  examples: [
    { label: 'Tie on score', input: '[[1, 2, 3], [2, 3, 1], [3, 2, 3], [4, 1, 9]]' },
    { label: 'Single threat', input: '[[7, 0, 0]]' },
    { label: 'Ids decide ties', input: '[[5, 1, 1], [2, 0, 3], [9, 1, 1]]' },
  ],
}

export default function Problem3631Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <ThreatRankView run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
