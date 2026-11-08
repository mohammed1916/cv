import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Four cards', description: 'Start with the four numbers.' },
    { id: 'combine', label: 'Combine a pair', description: 'Pick two numbers and apply one operator; the result replaces them.' },
    { id: 'check', label: 'Check result', description: 'When one number is left, it must be 24.' },
    { id: 'done', label: 'Answer', description: 'True if any sequence of combinations reaches 24.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Four cards (JSON array of four integers 1–9)',
  url: 'https://leetcode.com/problems/24-game/',
  complexity: 'O(1) time for four cards: at most a few hundred combinations are explored.',
  examples: [
    { label: 'Reachable', input: '[3,3,8,8]' },
    { label: 'Not reachable', input: '[1,1,1,2]' },
    { label: 'Division', input: '[8,8,3,3]' },
    { label: 'All ones', input: '[1,1,1,1]' },
    { label: 'Equal cards', input: '[6,6,6,6]' },
    { label: 'Largest cards', input: '[9,9,9,9]' },
  ],
}

export default function TwentyFourGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label={`Numbers left (depth ${step.depth})`} columns={['slot', 'value']}
      rows={step.pool.map((value, index) => ({ slot: index + 1, value: Number(value.toFixed(3)) }))} />
    <output aria-label="Current combination">{step.combine ?? (step.phase === 'done' ? (step.result ? 'Reached 24' : 'Not reachable') : 'Choose a pair')}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why pairs:</strong> any arithmetic expression over four numbers starts by combining two of them, so trying every pair and every operator covers all bracketings.</p>
  </>} />
}
