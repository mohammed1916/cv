import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the rabbits\' answers.' },
    { id: 'count', label: 'Count', description: 'Tally how many rabbits gave each answer.' },
    { id: 'group', label: 'Form groups', description: 'Round each tally up to whole colour groups.' },
    { id: 'done', label: 'Complete', description: 'Return the minimum total.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array answers (JSON, up to 200)',
  url: 'https://leetcode.com/problems/rabbits-in-forest/',
  complexity: 'O(n) time and O(k) space for k distinct answers.',
  examples: [
    { label: '[1,1,2] -> 5', input: '[1,1,2]' },
    { label: '[10,10,10] -> 11', input: '[10,10,10]' },
    { label: '[0,0,1,1,1] -> 5', input: '[0,0,1,1,1]' },
    { label: 'Mixed', input: '[2,2,2,2,2,3,3,0,1,1,1]' },
  ],
}
export default function RabbitsInForest() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Answers" length={run.input.length} valueAt={i => run.input[i]} />
    <IndexedSequence label="Distinct answers (tally)" length={run.entries.length} active={step.phase === 'group' ? step.groups.length - 1 : -1} valueAt={i => `${run.entries[i][0]} x${run.entries[i][1]}`} roleAt={i => (i < step.groups.length ? 'grouped' : '')} />
    <IndexedSequence label="Rabbits contributed per answer" length={run.entries.length} valueAt={i => (step.groups[i] ? step.groups[i].added : '?')} />
    <output aria-label="Running total">Total so far: {step.total}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Greedy argument:</strong> rabbits with different answers cannot share a colour, and rabbits with the same answer a share as many colour groups of size a+1 as needed, so rounding up is minimal.</p>
  </>} />
}
