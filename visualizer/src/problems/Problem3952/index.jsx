import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoverageRowView from './CoverageRowView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No slot is covered before index 0.' },
    { id: 'index', label: 'Index', description: 'Decide where the token here stays or moves left.' },
    { id: 'done', label: 'Result', description: 'Report the best total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with values and tokens (binary string, e.g. {"values":[3,1,4],"tokens":"101"})',
  url: 'https://leetcode.com/problems/maximum-total-value-of-covered-indices/',
  complexity: 'O(n) time and O(1) extra space for the two running totals. The visual caps the row at 12 indices.',
  examples: [
    { label: 'Stay or move', input: '{"values":[4,2,7,1],"tokens":"0110"}' },
    { label: 'Crowded tokens', input: '{"values":[5,1,3,8,2],"tokens":"11011"}' },
  ],
}

export default function MaximumTotalValueOfCoveredIndices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <CoverageRowView run={run} step={step} />} renderReasoning={({ run, step }) => (
    <p>
      Each index can be claimed by the token there or by the token one step right, and a claimed index adds its value once. Two running totals keep whether the current slot is taken. {run ? `Best total: ${run.result}.` : ''} {step.message}
    </p>
  )} />
}
