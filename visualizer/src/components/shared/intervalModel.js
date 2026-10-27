// Pure model for the interval view: bars on a number line plus a sweep-line event list.
// Interval: { start, end, label?, role?, group? }. Roles: current, merged, kept, rejected, active, pending, done, point.
export const MAX_INTERVALS = 40
export const INTERVAL_ROLES = ['current', 'merged', 'kept', 'rejected', 'active', 'pending', 'done']

/** True when two intervals share more than a boundary (half-open) or share any point (closed). */
export function intervalsOverlap(a, b, closed = false) {
  return closed ? a.start <= b.end && b.start <= a.end : a.start < b.end && b.start < a.end
}

/** Plain-language relation between two intervals, used for the merge/reject sentences. */
export function describeIntervalRelation(a, b, { closed = false } = {}) {
  const [x, y] = a.start <= b.start ? [a, b] : [b, a]
  const text = v => (closed ? `[${v.start}, ${v.end}]` : `[${v.start}, ${v.end})`)
  if (intervalsOverlap(x, y, closed)) {
    return closed && x.end === y.start
      ? `${text(x)} and ${text(y)} share the point ${y.start}, so they overlap`
      : `${text(x)} and ${text(y)} overlap on ${closed ? `[${y.start}, ${Math.min(x.end, y.end)}]` : `[${y.start}, ${Math.min(x.end, y.end)})`}`
  }
  return x.end === y.start
    ? `${text(x)} and ${text(y)} only touch at ${x.end}, which is not an overlap for half-open ranges`
    : `${text(x)} and ${text(y)} are disjoint (gap ${x.end} to ${y.start})`
}

/** Pack intervals of one group into lanes so overlapping bars never share a lane. */
function assignLanes(items, closed) {
  const order = items.map((item, index) => index).sort((a, b) => items[a].start - items[b].start || items[a].end - items[b].end || a - b)
  const laneEnds = []
  const lane = Array(items.length).fill(0)
  for (const index of order) {
    const { start, end } = items[index]
    let slot = laneEnds.findIndex(last => (closed ? start > last : start >= last))
    if (slot < 0) { slot = laneEnds.length; laneEnds.push(end) } else laneEnds[slot] = Math.max(end, laneEnds[slot])
    lane[index] = slot
  }
  return { lane, lanes: Math.max(1, laneEnds.length) }
}

function niceTicks(min, max) {
  const span = max - min
  if (span <= 12) return Array.from({ length: span + 1 }, (_, i) => min + i)
  const rough = span / 8
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 5, 10].map(m => m * magnitude).find(s => s >= rough) ?? magnitude * 10
  const ticks = []
  for (let t = Math.ceil(min / step) * step; t <= max; t += step) ticks.push(t)
  return ticks
}

/** Percent geometry for every bar, grouped into labelled tracks that share one axis. */
export function intervalTrackLayout(intervals, { marker = null, closed = false } = {}) {
  const values = intervals.flatMap(i => [i.start, i.end]).concat(marker === null ? [] : [marker])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1, max - min)
  const pad = span * 0.04
  const lo = min - pad
  const width = span + 2 * pad
  const pct = v => ((v - lo) / width) * 100
  const groups = [...new Set(intervals.map(i => i.group ?? ''))]
  const tracks = groups.map(group => {
    const items = intervals.filter(i => (i.group ?? '') === group)
    const { lane, lanes } = assignLanes(items, closed)
    const bars = items.map((item, index) => ({
      ...item, lane: lane[index],
      left: pct(item.start), width: Math.max(1.2, pct(item.end) - pct(item.start)),
      role: item.role ?? 'pending',
    }))
    return { group, lanes, bars }
  })
  return { tracks, ticks: niceTicks(min, max).map(value => ({ value, left: pct(value) })), markerLeft: marker === null ? null : pct(marker) }
}

/** Sweep-line events with the running count after each one; the maximum is flagged as the peak. */
export function sweepEventRows(events, index = -1) {
  let running = 0
  const rows = events.map((event, i) => {
    running += event.delta
    return { ...event, running, state: i < index ? 'done' : i === index ? 'current' : 'pending' }
  })
  const peak = Math.max(0, ...rows.map(r => r.running))
  return rows.map(row => ({ ...row, isPeak: peak > 0 && row.running === peak && row.state !== 'pending' }))
}

/** Same events a solver would build: each interval gives +weight at start and -weight at end, ends first on ties. */
export function eventsFromIntervals(intervals, weightOf = () => 1) {
  const events = intervals.flatMap((iv, i) => [
    { pos: iv.start, delta: weightOf(iv, i), label: `start of [${iv.start}, ${iv.end})` },
    { pos: iv.end, delta: -weightOf(iv, i), label: `end of [${iv.start}, ${iv.end})` },
  ])
  return events.sort((a, b) => a.pos - b.pos || a.delta - b.delta)
}

/**
 * Shape a solver emits as `...intervalView(...)`. Returns {} when there is nothing readable to draw
 * (no intervals, non-finite endpoints, or more than MAX_INTERVALS bars), so callers keep their table.
 */
export function intervalView({ title = 'Intervals', intervals = [], marker = null, markerLabel = '', events = null, eventIndex = -1, closed = false, note = '' } = {}) {
  const clean = intervals.filter(i => Number.isFinite(i.start) && Number.isFinite(i.end))
  if (clean.length === 0 || clean.length > MAX_INTERVALS) return {}
  const rows = events && events.length <= MAX_INTERVALS * 2 ? sweepEventRows(events, eventIndex) : null
  return { interval: { title, intervals: clean.map(i => ({ ...i })), marker: Number.isFinite(marker) ? marker : null, markerLabel, events: rows, closed, note } }
}
