import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2157',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Words as a JSON array',
  url: 'https://leetcode.com/problems/groups-of-strings/',
  complexity: 'O(n * 26 * 26) mask operations with union-find; O(n) space.',
  examples: [
    { label: 'Two groups', input: '["abc","ab","bcd","xyz","yz"]' },
    { label: 'Replace joins', input: '["ab","cd","ac","bd"]' },
  ],
}

export default function Problem2157Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <RecordStateTable label="Words, letter sets and group" columns={['word', 'letters', 'group']} rows={step.rows} activeRow={-1} />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
