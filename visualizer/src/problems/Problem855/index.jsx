import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Empty room, sorted list of students.' },
    { id: 'candidate', label: 'Candidate gap', description: 'Evaluate the best seat inside one gap or at an edge.' },
    { id: 'seat', label: 'Seat', description: 'Place the student at the best seat.' },
    { id: 'leave', label: 'Leave', description: 'Remove a student, merging gaps.' },
    { id: 'done', label: 'Complete', description: 'All operations finished.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object {n, ops} (JSON, n up to 40, up to 40 ops)',
  url: 'https://leetcode.com/problems/exam-room/',
  complexity: 'seat is O(k) over k seated students, leave is O(k); the visualization is capped at 40 seats.',
  examples: [
    { label: 'Official example', input: '{"n":10,"ops":[["seat"],["seat"],["seat"],["seat"],["leave",4],["seat"]]}' },
    { label: 'Fill a small room', input: '{"n":5,"ops":[["seat"],["seat"],["seat"],["seat"],["seat"]]}' },
    { label: 'Leaving merges gaps', input: '{"n":12,"ops":[["seat"],["seat"],["seat"],["leave",11],["leave",0],["seat"],["seat"]]}' },
  ],
}

export default function ExamRoom() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.n
    const occ = new Set(step.students ?? [])
    const logOps = run.input.ops.map((op, k) => ({ name: op[0], args: op.slice(1), returned: k < (step.returned ?? []).length ? step.returned[k] : undefined }))
    return <>
      <IndexedSequence label="Seats (occupied = student id order)" length={n} active={step.phase === 'candidate' || step.phase === 'seat' ? (step.cand?.seat ?? -1) : -1}
        valueAt={i => occ.has(i) ? 'S' : '·'} roleAt={i => occ.has(i) ? 'written' : i === step.bestSeat ? 'shifted' : ''} />
      <p>Sorted students: [{(step.students ?? []).join(', ')}]</p>
      {step.cand && <output aria-label="Candidate">Candidate seat {step.cand.seat} with distance {step.cand.dist}{step.best !== null ? `; best so far ${step.bestSeat} (distance ${step.best})` : ''}</output>}
      <OperationLog title="ExamRoom operations" ops={logOps} current={step.opIndex ?? -1} through={step.opIndex ?? -1} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>Occupied seats: [{(step.students ?? []).join(', ')}].</p>
    <p><strong>Why the middle of a gap:</strong> between students a and b the nearest-neighbour distance is maximised at the midpoint, giving (b - a) // 2. The two edge seats have only one neighbour, so their distance is the full gap to that neighbour.</p>
    <p><strong>Ties:</strong> candidates are scanned left to right and replaced only when strictly better, so the lowest seat wins a tie.</p>
  </>} />
}
