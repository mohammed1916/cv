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
    { label: 'Tight rooms', input: '{"n":2,"meetings":[[0,4],[1,2],[3,6],[5,7]]}' },
    { label: 'Three rooms', input: '{"n":3,"meetings":[[1,9],[2,5],[3,4],[6,8],[10,12]]}' },
  ],
}

// Room timeline: one row per room, one bar per meeting, drawn at its real (possibly delayed) start.
function RoomTimeline({ n, schedule, horizon }) {
  const span = Math.max(1, horizon)
  return <section className="algorithm-sequence" aria-label="Room timeline">
    <h3>Room timeline</h3>
    {Array.from({ length: n }, (_, room) => <div key={room} className="algorithm-sequence__cells" style={{ position: 'relative', height: 26, marginBottom: 4 }}>
      <span style={{ position: 'absolute', left: 0, top: 4 }}>Room {room}</span>
      <div style={{ position: 'absolute', left: 80, right: 0, top: 0, bottom: 0 }}>
        {schedule.filter(s => s.room === room).map((s, i) => <div key={i} title={`meeting ${s.from}-${s.to} runs ${s.start}-${s.end}`}
          style={{ position: 'absolute', top: 2, bottom: 2, left: `${(s.start / span) * 100}%`, width: `${((s.end - s.start) / span) * 100}%`, background: 'var(--primary)', color: 'var(--surface2)', borderRadius: 4, fontSize: 12, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {s.from}-{s.to}
        </div>)}
      </div>
    </div>)}
  </section>
}

export default function MeetingRoomsIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RoomTimeline n={run.input.n} schedule={step.schedule} horizon={Math.max(1, ...step.schedule.map(s => s.end), ...run.input.meetings.map(([, e]) => e))} />
    <IndexedSequence label="Meetings held per room" length={step.count.length} valueAt={i => step.count[i]} active={step.room} />
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Meetings are handled in start order. A room that is free takes the meeting, with the lowest number preferred so the choice is fixed.</p>
    <p>When every room is busy, the meeting starts when the earliest room frees and keeps its duration, so the busy heap records that room’s new end time.</p>
  </>} />
}
