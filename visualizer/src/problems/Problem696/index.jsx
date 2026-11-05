import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Runs', description: 'Group equal neighbouring characters into runs.' },
    { id: 'pair', label: 'Pair of runs', description: 'Two neighbouring runs contribute the shorter of their lengths.' },
    { id: 'done', label: 'Total', description: 'Sum the contributions of every neighbouring pair.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Binary string (JSON string of 0 and 1)',
  url: 'https://leetcode.com/problems/count-binary-substrings/',
  complexity: 'O(n) time and O(number of runs) space.',
  examples: [
    { label: 'Mixed runs', input: '"0011100"' },
    { label: 'Long runs', input: '"000111"' },
    { label: 'Alternating', input: '"0101"' },
  ],
}

export default function CountBinarySubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Run lengths (character in brackets)" length={step.runs.length} active={step.index ?? -1}
      valueAt={i => `${step.runs[i]}`}
      roleAt={i => (step.index !== null && i === step.index ? 'cur' : step.index !== null && i === step.index - 1 ? 'prev' : run.runChars[i])} />
    <output aria-label="Total so far">{`Total ${step.total}${step.add !== undefined ? ` (+${step.add})` : ''}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the minimum:</strong> the shorter run limits how many matched pairs can sit across the boundary.</p>
  </>} />
}
