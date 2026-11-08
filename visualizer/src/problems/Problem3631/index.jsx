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
    { label: 'Single threat with zero scores', input: '[[7,0,0]]' },
    { label: 'Equal scores keep the id order', input: '[[3,5,5],[1,5,5],[2,5,5]]' },
    { label: 'Largest scores', input: '[[1,100,100],[2,100,0],[3,0,100]]' },
    { label: 'Long run: 8 threats', input: '[[71,56,22],[82,75,1],[43,56,36],[44,37,3],[45,57,67],[26,58,17],[7,74,97],[8,30,91]]' },
  ],
}

export default function Problem3631Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <ThreatRankView run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
