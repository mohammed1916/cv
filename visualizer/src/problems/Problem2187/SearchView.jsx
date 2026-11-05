import AnswerRangeBar from '../../components/shared/AnswerRangeBar'

// The candidate times form the search range lo..hi. Each probe is the middle of that range.
export default function SearchView({ run, step }) {
  const { time, totalTrips } = run.input
  return (
    <div className="search-view">
      <AnswerRangeBar title="Candidate times" min={1} max={Math.max(step.max, 2)} low={step.lo} high={step.hi}
        probe={step.probe ?? null} verdict={step.verdict ?? null} />
      <p>Buses take {time.join(', ')} time units per trip. Target: {totalTrips} trips.</p>
      {step.trips !== undefined && <p>At time {step.probe}, the buses complete {step.trips} trips.</p>}
    </div>
  )
}
