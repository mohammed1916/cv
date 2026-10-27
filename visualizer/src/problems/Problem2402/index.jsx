import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Rooms', description: 'Every room starts free with no meetings.' },
    { id: 'use', label: 'Use a room', description: 'A free room takes the meeting; the lowest numbered free room is chosen.' },
    { id: 'wait', label: 'Delay', description: 'No room is free, so the meeting waits for the room that frees first.' },
    { id: 'done', label: 'Complete', description: 'Report the busiest room, lowest number on ties.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": rooms, "meetings": [[start, end], ...]}',
  url: 'https://leetcode.com/problems/meeting-rooms-iii/',
  complexity: 'O(m log m + m log n) time with heaps for the free rooms and the busy rooms. The visualization caps input at 5 rooms and 10 meetings.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"meetings":[[0,10],[1,5],[2,7],[3,4]]}' },
    { label: 'Example 2', input: '{"n":3,"meetings":[[1,20],[2,10],[3,5],[4,9],[6,8]]}' },
  ],
}

export default function MeetingRoomsIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Meetings held per room" length={step.count.length} valueAt={i => step.count[i]} active={step.room} />
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Meetings are handled in start order. A room that is free takes the meeting, with the lowest number preferred so the choice is fixed.</p>
    <p>When every room is busy, the meeting starts when the earliest room frees and keeps its duration, so the busy heap records that room&apos;s new end time.</p>
  </>} />
}
