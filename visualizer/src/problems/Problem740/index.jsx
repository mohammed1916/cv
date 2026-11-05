import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Points', description: 'Each value earns v times its count.' },
    { id: 'take', label: 'Take', description: 'Take the value and give up the one just before it.' },
    { id: 'skip', label: 'Skip', description: 'Keep the best total from earlier values.' },
    { id: 'empty', label: 'Absent value', description: 'Nothing is earned at this value.' },
    { id: 'done', label: 'Complete', description: 'Return the best total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums (JSON array of integers 1–20)',
  url: 'https://leetcode.com/problems/delete-and-earn/',
  complexity: 'O(V) time after counting, where V is the largest value; O(V) for the points array.',
  examples: [
    { label: 'Pairs', input: '[3,3,5,6,9]' },
    { label: 'Neighbours', input: '[2,4,4,5,7]' },
  ],
}

export default function DeleteAndEarn() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Points by value (v earns v times its count)" length={step.points.length} active={step.v}
      valueAt={i => step.points[i]}
      roleAt={i => (i === step.v ? 'current' : '')} />
    <RecordStateTable label="Best totals as values go up" columns={['v', 'points', 'take', 'skip', 'choice']}
      rows={step.rows} activeRow={step.rows.length - 1} />
    <output aria-label="Step">{step.message}</output>
    <p>{`Input values: ${run.input.join(', ')}`}</p>
  </>} renderReasoning={() => <>
    <p>Deleting a value x earns x times its count, and also removes x - 1 and x + 1. Values therefore sit on a line where no two adjacent values can both be taken.</p>
    <p>The best total is the usual house-robber recurrence over the points array.</p>
  </>} />
}
